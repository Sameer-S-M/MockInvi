import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Fixed namespace UUID for consistent generation
const NAMESPACE_UUID = '1b671a64-40d5-491e-99b0-da01ff1f3341';

// Generate consistent UUID from Clerk User ID for database operations
const generateConsistentUUID = (userId: string): string => {
  try {
    // Simple hash function to create deterministic UUID (matches client logic)
    let hash = 0;
    const input = userId + NAMESPACE_UUID;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Convert hash to hex and pad to create UUID format
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `${hex.slice(0, 8)}-${hex.slice(0, 4)}-4${hex.slice(1, 4)}-a${hex.slice(0, 3)}-${hex.slice(0, 12).padEnd(12, '0')}`;
  } catch (error) {
    console.error("Error generating consistent UUID:", error);
    return crypto.randomUUID();
  }
};

// Enhanced certificate generation function
const generateCertificate = async (supabase: any, params: {
  userId: string;
  name: string;
  courseId: string;
  courseName: string;
  score: number;
  clerkUserId?: string;
}): Promise<{ success: boolean; certificateId?: string; message?: string }> => {
  const PASSING_SCORE = 70;
  
  console.log('Enhanced certificate generation called with params:', params);
  
  if (params.score < PASSING_SCORE) {
    console.log('Score below passing threshold, no certificate generated');
    return { success: false, message: 'Score below passing threshold' };
  }

  try {
    // Update certificate management system if clerkUserId is provided
    if (params.clerkUserId) {
      try {
        console.log('Updating certificate management...');
        const { error: certMgmtError } = await supabase.rpc('update_course_certificate_management', {
          p_clerk_user_id: params.clerkUserId,
          p_course_id: params.courseId,
          p_course_name: params.courseName,
          p_course_complete: true,
          p_assessment_score: params.score
        });

        if (certMgmtError) {
          console.error('Error updating certificate management:', certMgmtError);
        } else {
          console.log('Certificate management updated successfully');
        }
      } catch (certMgmtError) {
        console.error('Certificate management update failed:', certMgmtError);
      }
    }

    // Check if certificate already exists
    const { data: existingCert } = await supabase
      .from('user_certificates')
      .select('id')
      .eq('user_id', params.userId)
      .eq('course_id', params.courseId)
      .eq('is_active', true)
      .maybeSingle();

    if (existingCert) {
      console.log('Certificate already exists:', existingCert.id);
      return { success: true, certificateId: existingCert.id, message: 'Certificate already exists' };
    }

    // Get default certificate template
    const { data: defaultCertificate, error: certError } = await supabase
      .from('certificates')
      .select('*')
      .eq('is_active', true)
      .eq('certificate_type', 'completion')
      .single();

    if (certError || !defaultCertificate) {
      console.warn('No default certificate found, creating one...');
      
      const { data: newCertificate, error: createCertError } = await supabase
        .from('certificates')
        .insert({
          title: 'Course Completion Certificate',
          description: 'Certificate of successful course completion',
          certificate_type: 'completion',
          is_active: true,
          auto_issue: true,
          requirements: { min_score: PASSING_SCORE }
        })
        .select()
        .single();

      if (createCertError || !newCertificate) {
        console.error('Failed to create certificate template:', createCertError);
        return { success: false, message: 'Failed to create certificate template' };
      }
      
      defaultCertificate = newCertificate;
    }

    // Generate verification code
    const verificationCode = `CERT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    console.log('Creating user certificate...');
    
    // Create user certificate
    const { data: newCert, error: saveError } = await supabase
      .from('user_certificates')
      .insert({
        user_id: params.userId,
        clerk_user_id: params.clerkUserId,
        certificate_id: defaultCertificate.id,
        course_id: params.courseId,
        verification_code: verificationCode,
        score: params.score,
        completion_data: {
          course_id: params.courseId,
          course_name: params.courseName,
          completion_date: new Date().toISOString(),
          score: params.score,
          passing_score: PASSING_SCORE,
          user_name: params.name
        },
        is_active: true
      })
      .select('id')
      .single();

    if (saveError) {
      console.error('Error saving certificate:', saveError);
      throw saveError;
    }

    console.log('Certificate generated successfully:', newCert.id);
    return { success: true, certificateId: newCert.id, message: 'Certificate generated successfully' };
  } catch (error) {
    console.error('Error generating certificate:', error);
    return { success: false, message: error.message || 'Certificate generation failed' };
  }
};

Deno.serve(async (req) => {
  console.log('Enhanced learning service function invoked:', req.method, req.url);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { action, clerkUserId, data, totalModules, questions, answers } = await req.json();
    console.log('Enhanced learning service request:', { action, clerkUserId, hasData: !!data, totalModules });
    
    if (!clerkUserId) {
      throw new Error('Clerk user ID is required');
    }

    // Generate consistent UUID from Clerk user ID
    const supabaseUserId = generateConsistentUUID(clerkUserId);
    console.log('Processing request for Clerk user:', clerkUserId, 'as UUID:', supabaseUserId);

    let result;

    switch (action) {
      case 'fetch':
        console.log('Fetching user learning data...');
        
        // Ensure user profile exists first
        try {
          await supabase.rpc('get_or_create_user_profile', {
            p_clerk_user_id: clerkUserId,
            p_full_name: 'Student',
            p_email: `${clerkUserId}@temp.com`,
            p_role: 'student'
          });
        } catch (profileError) {
          console.warn('Profile creation failed, continuing:', profileError);
        }

        // Try to find existing record
        const { data: existingData, error: fetchError } = await supabase
          .from('user_learning')
          .select('*')
          .eq('user_id', supabaseUserId)
          .eq('course_id', data?.courseId)
          .maybeSingle();
        
        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Fetch error:', fetchError);
          throw fetchError;
        }
        
        if (!existingData && totalModules && data?.courseId) {
          console.log('Creating new learning record...');
          const newRecord = {
            user_id: supabaseUserId,
            course_id: data.courseId,
            progress: {},
            completed_modules_count: 0,
            total_modules_count: totalModules,
            assessment_attempted: false,
            assessment_score: null,
            last_assessment_score: 0,
            is_completed: false,
            assessment_passed: false,
            assessment_completed_at: null
          };

          const { data: createdData, error: createError } = await supabase
            .from('user_learning')
            .insert(newRecord)
            .select('*')
            .single();

          if (createError) {
            console.error('Create error:', createError);
            result = null;
          } else {
            result = createdData;
            console.log('Created new learning record:', result.id);
          }
        } else {
          result = existingData;
          console.log('Found existing learning record:', result?.id || 'none');
        }
        break;

      case 'update':
        console.log('Updating learning record...');
        
        // Ensure user profile exists
        try {
          await supabase.rpc('get_or_create_user_profile', {
            p_clerk_user_id: clerkUserId,
            p_full_name: 'Student',
            p_email: `${clerkUserId}@temp.com`,
            p_role: 'student'
          });
        } catch (profileError) {
          console.warn('Profile creation failed, continuing:', profileError);
        }

        // Check if record exists
        const { data: checkData } = await supabase
          .from('user_learning')
          .select('id')
          .eq('user_id', supabaseUserId)
          .eq('course_id', data.courseId)
          .maybeSingle();
        
        if (!checkData) {
          console.log('No existing record found, creating one...');
          const newRecord = {
            user_id: supabaseUserId,
            course_id: data.courseId,
            progress: data.progress || data.course_progress || {},
            completed_modules_count: data.completed_modules_count || data.completed_modules || 0,
            total_modules_count: data.total_modules_count || data.total_modules || 0,
            assessment_attempted: false,
            assessment_score: null,
            last_assessment_score: 0,
            is_completed: false,
            assessment_passed: false,
            assessment_completed_at: null
          };

          const { data: createdData, error: createError } = await supabase
            .from('user_learning')
            .insert(newRecord)
            .select('*')
            .single();

          if (createError) {
            console.error('Create error during update:', createError);
            throw createError;
          }
          result = createdData;
          console.log('Created new learning record during update:', result.id);
        } else {
          const updatePayload = {
            progress: data.progress || data.course_progress || {},
            completed_modules_count: data.completed_modules_count || data.completed_modules || 0,
            total_modules_count: data.total_modules_count || data.total_modules || 0,
            updated_at: new Date().toISOString()
          };

          const { data: updateData, error: updateError } = await supabase
            .from('user_learning')
            .update(updatePayload)
            .eq('user_id', supabaseUserId)
            .eq('course_id', data.courseId)
            .select('*')
            .single();
          
          if (updateError) {
            console.error('Update error:', updateError);
            throw updateError;
          }
          result = updateData;
          console.log('Updated learning record:', result.id);
        }
        break;

      case 'evaluateAssessment':
        console.log('Evaluating assessment...');
        
        if (!questions || !answers || !data?.courseId) {
          throw new Error('Questions, answers, and courseId are required for assessment evaluation');
        }

        // Ensure user profile exists
        try {
          await supabase.rpc('get_or_create_user_profile', {
            p_clerk_user_id: clerkUserId,
            p_full_name: 'Student',
            p_email: `${clerkUserId}@temp.com`,
            p_role: 'student'
          });
        } catch (profileError) {
          console.warn('Profile creation failed, continuing:', profileError);
        }

        // Fetch course questions from database
        const { data: courseQuestions, error: questionsError } = await supabase
          .from('course_questions')
          .select('*')
          .eq('course_id', data.courseId)
          .eq('is_active', true)
          .order('order_index');

        if (questionsError) {
          throw new Error(`Failed to fetch course questions: ${questionsError.message}`);
        }

        if (!courseQuestions || courseQuestions.length === 0) {
          throw new Error('No questions found for this course');
        }

        // Calculate score
        let correctAnswers = 0;
        const evaluatedAnswers = answers.map((answer: any) => {
          const question = courseQuestions.find(q => q.id === answer.questionId);
          const isCorrect = question && answer.selectedAnswer === question.correct_answer;
          
          if (isCorrect) {
            correctAnswers++;
          }

          return {
            questionId: answer.questionId,
            selectedAnswer: answer.selectedAnswer,
            isCorrect: isCorrect,
            correctAnswer: question?.correct_answer || null
          };
        });

        const totalQuestions = courseQuestions.length;
        const score = Math.round((correctAnswers / totalQuestions) * 100);
        const passed = score >= 70;

        const assessmentResult = {
          totalQuestions,
          correctAnswers,
          score,
          passed,
          answers: evaluatedAnswers
        };

        // Save assessment results
        const assessmentData = {
          assessment_attempted: true,
          assessment_passed: passed,
          assessment_score: score,
          last_assessment_score: score,
          assessment_completed_at: new Date().toISOString(),
          is_completed: passed,
          total_modules_count: totalModules || 0
        };

        // Update or create learning record
        const { data: existingLearning } = await supabase
          .from('user_learning')
          .select('*')
          .eq('user_id', supabaseUserId)
          .eq('course_id', data.courseId)
          .maybeSingle();

        if (existingLearning) {
          const { error: updateError } = await supabase
            .from('user_learning')
            .update({
              ...assessmentData,
              progress: existingLearning.progress || {},
              completed_modules_count: existingLearning.completed_modules_count || 0,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingLearning.id);

          if (updateError) {
            console.error('Failed to update assessment results:', updateError);
            throw new Error(`Failed to update assessment results: ${updateError.message}`);
          }
        } else {
          const { error: insertError } = await supabase
            .from('user_learning')
            .insert({
              user_id: supabaseUserId,
              course_id: data.courseId,
              progress: {},
              completed_modules_count: 0,
              ...assessmentData
            });

          if (insertError) {
            console.error('Failed to save assessment results:', insertError);
            throw new Error(`Failed to save assessment results: ${insertError.message}`);
          }
        }

        // Generate certificate if passed
        let certificateResult = { success: false, message: 'Not applicable' };
        if (passed && data.courseName) {
          try {
            console.log('Attempting to generate certificate...');
            
            // Get user profile for certificate
            const { data: profileData } = await supabase
              .from('profiles')
              .select('full_name, email')
              .eq('id', supabaseUserId)
              .maybeSingle();

            if (profileData?.full_name) {
              const certResult = await generateCertificate(supabase, {
                userId: supabaseUserId,
                name: profileData.full_name,
                courseId: data.courseId,
                courseName: data.courseName,
                score: score,
                clerkUserId: clerkUserId
              });
              
              console.log('Certificate generation result:', certResult);
              certificateResult = certResult;
            } else {
              console.error('No profile data available for certificate generation');
              certificateResult = { success: false, message: 'No profile data available' };
            }
          } catch (certError) {
            console.error('Certificate generation failed:', certError);
            certificateResult = { success: false, message: 'Certificate generation failed' };
          }
        }

        result = {
          ...assessmentResult,
          saved: true,
          certificateGenerated: certificateResult.success,
          certificateId: certificateResult.certificateId || null
        };
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    console.log('Enhanced learning service request completed successfully');
    return new Response(
      JSON.stringify({ success: true, data: result }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Enhanced learning service error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'An error occurred in the enhanced learning service' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});