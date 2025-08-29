import React, { useMemo, useState } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Trash2, Crown, Wand2 } from 'lucide-react';
import jsPDF from 'jspdf';
// Lightweight DOCX export via HTML technique as a fallback approach
const exportDocxFromHtml = (html: string, filename: string) => {
  const blob = new Blob([
    '\uFEFF' +
      `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${html}</body></html>`
  ], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.docx') ? filename : `${filename}.doc`; // simple .doc for wide compatibility
  a.click();
  URL.revokeObjectURL(url);
};
import { generateAwsResumeAI } from '@/services/resumeAiService';
import { useToast } from '@/components/ui/use-toast';

interface ExperienceItem {
  company: string;
  role: string;
  start: string;
  end: string;
  description: string;
}

interface EducationItem {
  school: string;
  degree: string;
  start: string;
  end: string;
}

const defaultExperience: ExperienceItem = {
  company: '',
  role: '',
  start: '',
  end: '',
  description: ''
};

const defaultEducation: EducationItem = {
  school: '',
  degree: '',
  start: '',
  end: ''
};

const ResumeMakerPage: React.FC = () => {
  // Allow usage without relying on subscription/database. Keep hook import for future but don't gate UI.
  const { hasProPlan } = useSubscription();
  const isPro = useMemo(() => true, []);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [summary, setSummary] = useState('');
  const [skills, setSkills] = useState<string>('');
  const [certs, setCerts] = useState<string>('');
  const [experience, setExperience] = useState<ExperienceItem[]>([{ ...defaultExperience }]);
  const [education, setEducation] = useState<EducationItem[]>([{ ...defaultEducation }]);
  const [jobDescription, setJobDescription] = useState('');
  const [aiResult, setAiResult] = useState<any>(null);
  const [template, setTemplate] = useState<'minimalist' | 'modern' | 'creative'>('minimalist');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAddExperience = () => setExperience(prev => [...prev, { ...defaultExperience }]);
  const handleRemoveExperience = (idx: number) => setExperience(prev => prev.filter((_, i) => i !== idx));
  const handleExpChange = (idx: number, field: keyof ExperienceItem, value: string) => {
    setExperience(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const handleAddEducation = () => setEducation(prev => [...prev, { ...defaultEducation }]);
  const handleRemoveEducation = (idx: number) => setEducation(prev => prev.filter((_, i) => i !== idx));
  const handleEduChange = (idx: number, field: keyof EducationItem, value: string) => {
    setEducation(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const generatePdf = () => {
    const doc = new jsPDF();
    let y = 20;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text(fullName || 'Your Name', 20, y);
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text([`${email || ''}`.trim(), `${phone || ''}`.trim(), `${location || ''}`.trim()].filter(Boolean).join('  •  '), 20, y);
    y += 12;

    if (summary) {
      doc.setFont('helvetica', 'bold');
      doc.text('Professional Summary', 20, y);
      y += 7;
      doc.setFont('helvetica', 'normal');
      const split = doc.splitTextToSize(summary, 170);
      doc.text(split, 20, y);
      y += split.length * 6 + 6;
    }

    if (skills.trim()) {
      doc.setFont('helvetica', 'bold');
      doc.text('Core AWS/Cloud Skills', 20, y);
      y += 7;
      doc.setFont('helvetica', 'normal');
      const skillLine = skills.split(',').map(s => s.trim()).filter(Boolean).join('  •  ');
      const split = doc.splitTextToSize(skillLine, 170);
      doc.text(split, 20, y);
      y += split.length * 6 + 6;
    }

    if (certs.trim()) {
      doc.setFont('helvetica', 'bold');
      doc.text('Certifications', 20, y);
      y += 7;
      doc.setFont('helvetica', 'normal');
      const line = certs.split(',').map(s => s.trim()).filter(Boolean).join('  •  ');
      const split = doc.splitTextToSize(line, 170);
      doc.text(split, 20, y);
      y += split.length * 6 + 6;
    }

    if (experience.some(e => e.company || e.role)) {
      doc.setFont('helvetica', 'bold');
      doc.text('Experience', 20, y);
      y += 7;
      doc.setFont('helvetica', 'normal');
      experience.forEach(exp => {
        if (!exp.company && !exp.role) return;
        doc.setFont('helvetica', 'bold');
        doc.text(`${exp.role || ''}  —  ${exp.company || ''}`, 20, y);
        y += 6;
        doc.setFont('helvetica', 'normal');
        doc.text(`${exp.start || ''} - ${exp.end || ''}`, 20, y);
        y += 6;
        if (exp.description) {
          const split = doc.splitTextToSize(exp.description, 170);
          doc.text(split, 20, y);
          y += split.length * 6 + 6;
        } else {
          y += 4;
        }
      });
    }

    if (education.some(e => e.school || e.degree)) {
      doc.setFont('helvetica', 'bold');
      doc.text('Education', 20, y);
      y += 7;
      doc.setFont('helvetica', 'normal');
      education.forEach(edu => {
        if (!edu.school && !edu.degree) return;
        doc.setFont('helvetica', 'bold');
        doc.text(`${edu.degree || ''}`, 20, y);
        y += 6;
        doc.setFont('helvetica', 'normal');
        doc.text(`${edu.school || ''}  •  ${edu.start || ''} - ${edu.end || ''}`, 20, y);
        y += 8;
      });
    }

    doc.save(`${fullName || 'resume'}.pdf`);
  };

  // Lightweight on-device AI-style composer (deterministic heuristics, no external APIs)
  const actionVerbs = ['Led', 'Designed', 'Implemented', 'Automated', 'Optimized', 'Migrated', 'Architected', 'Secured', 'Deployed', 'Scaled'];
  const impactPhrases = [
    'reducing costs by ~X%',
    'improving reliability to ~X% uptime',
    'cutting deployment time by ~X%',
    'increasing performance by ~X%',
    'improving developer productivity by ~X%'
  ];

  const inferAwsBullets = (text: string): string[] => {
    const baseText = `${text} ${skills}`.toLowerCase();
    const hints: string[] = [];
    if (baseText.includes('ec2') || baseText.includes('eks') || baseText.includes('ecs') || baseText.includes('docker') || baseText.includes('kubernetes')) hints.push('containerization and orchestration on AWS');
    if (baseText.includes('s3') || baseText.includes('glacier')) hints.push('object storage with lifecycle policies');
    if (baseText.includes('lambda') || baseText.includes('serverless')) hints.push('serverless compute and event-driven patterns');
    if (baseText.includes('rds') || baseText.includes('dynamodb') || baseText.includes('aurora') || baseText.includes('postgres') || baseText.includes('mysql')) hints.push('managed databases and data modeling');
    if (baseText.includes('terraform') || baseText.includes('cloudformation') || baseText.includes('cdk')) hints.push('Infrastructure as Code automation');
    if (baseText.includes('vpc') || baseText.includes('route53') || baseText.includes('cloudfront') || baseText.includes('alb') || baseText.includes('elb')) hints.push('networking, DNS, and edge distribution');
    if (baseText.includes('iam') || baseText.includes('kms') || baseText.includes('cognito') || baseText.includes('security')) hints.push('security, identity, and key management');
    if (hints.length === 0) {
      hints.push('high-availability architectures on AWS');
      hints.push('CI/CD pipelines and observability');
      hints.push('cost optimization and performance tuning');
    }
    const picked = hints.slice(0, 3);
    return picked.map((h, i) => `${actionVerbs[i % actionVerbs.length]} ${h}, ${impactPhrases[i % impactPhrases.length]}.`);
  };

  const generateWithAI = async () => {
    // require minimal contact info
    if (!fullName.trim() || !email.trim()) {
      toast({
        title: 'Missing Required Information',
        description: 'Please enter at least your Full Name and Email before using AI.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsGenerating(true);
    try {
      const result = await generateAwsResumeAI({
        fullName,
        email,
        phone,
        location,
        summary,
        skills: skills.split(',').map(s => s.trim()).filter(Boolean),
        experience,
        education,
        targetRole: 'AWS/Cloud Engineer',
        jobDescription: jobDescription || undefined
      });
      setAiResult(result);

      // Build robust ATS PDF with pagination
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const pageW = 210; const pageH = 297; const margin = 20; let y = margin;
      const lineH = (fs:number) => fs * 0.35 + 1.4;
      const checkPage = (need:number) => { if (y + need > pageH - margin) { doc.addPage(); y = margin; } };
      const sectionTitle = (title:string) => { checkPage(8); doc.setFont('helvetica','bold'); doc.setFontSize(12); doc.text(title, margin, y); y += 6; doc.setDrawColor(200); doc.setLineWidth(0.4); doc.line(margin, y, pageW - margin, y); y += 4; };
      const para = (text:string, fs=11) => { if (!text) return; doc.setFont('helvetica','normal'); doc.setFontSize(fs); const chunks = doc.splitTextToSize(text, pageW - margin*2); const need = chunks.length * lineH(fs) + 2; checkPage(need); doc.text(chunks, margin, y); y += need; };
      const bulletList = (items:string[], fs=11) => { if (!items?.length) return; doc.setFont('helvetica','normal'); doc.setFontSize(fs); const lines = items.map(b => `• ${b}`); const chunks = doc.splitTextToSize(lines.join('\n'), pageW - margin*2); const need = chunks.length * lineH(fs) + 2; checkPage(need); doc.text(chunks, margin, y); y += need; };

      // Contact (top, no header)
      doc.setFont('helvetica','bold'); doc.setFontSize(18); doc.text((fullName || 'Your Name').trim() || 'Your Name', margin, y); y += 7;
      doc.setFont('helvetica','normal'); doc.setFontSize(10);
      const contact = [email, phone, location].filter(Boolean).join('  •  ');
      para(contact, 10);

      // Summary
      if (result.summary || summary) { sectionTitle('Professional Summary'); para((result.summary || summary || '').trim()); }

      // Skills (limit to 12)
      const skillsOut = (Array.isArray(result.skills) ? result.skills : skills.split(',').map(s=>s.trim()).filter(Boolean)).slice(0,12);
      if (skillsOut.length) { sectionTitle('Key Skills'); para(skillsOut.join('  •  '), 10); }

      // Experience
      if (Array.isArray(result.experience) && result.experience.length) {
        sectionTitle('Work Experience');
        result.experience.forEach((exp:any) => {
          const title = `${exp.role || ''}${exp.company ? ' — ' + exp.company : ''}`.trim();
          if (title) { checkPage(6); doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.text(title, margin, y); y += lineH(11); }
          const dates = `${exp.start || ''}${exp.end ? ' - ' + exp.end : ''}`.trim();
          if (dates) { para(dates, 10); }
          bulletList((exp.bullets || []).slice(0, 8), 10);
        });
      }

      // Education
      if (Array.isArray(result.education) && result.education.length) {
        sectionTitle('Education');
        result.education.forEach((ed:any) => {
          const degree = ed.degree || '';
          if (degree) { checkPage(6); doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.text(degree, margin, y); y += lineH(11); }
          const line = [ed.school, [ed.start, ed.end].filter(Boolean).join(' - ')].filter(Boolean).join(' • ');
          para(line, 10);
          bulletList((ed.highlights || []).slice(0, 4), 10);
        });
      }

      // Certifications
      if (Array.isArray(result.certifications) && result.certifications.length) {
        sectionTitle('Certifications');
        para(result.certifications.join('  •  '), 10);
      }

      // Projects
      if (Array.isArray(result.projects) && result.projects.length) {
        sectionTitle('Projects');
        result.projects.forEach((p:any) => {
          if (p.name) { checkPage(6); doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.text(p.name, margin, y); y += lineH(11); }
          bulletList((p.bullets || []).slice(0, 6), 10);
        });
      }

      // Achievements (optional)
      if (Array.isArray(result.achievements) && result.achievements.length) {
        sectionTitle('Achievements');
        bulletList(result.achievements.slice(0, 8), 10);
      }

      doc.save(`${(fullName || 'resume').trim() || 'resume'}.pdf`);
      
      toast({
        title: 'AI Resume Generated',
        description: 'Your AI-powered resume has been created and downloaded!',
      });
    } catch (err:any) {
      console.error('AI resume generation failed:', err);
      toast({
        title: 'AI Generation Failed',
        description: err.message || 'Could not generate with AI. Please try again.',
        variant: 'destructive',
      });
      // Fallback: deterministic resume with inferred bullets
      const doc = new jsPDF({ unit:'mm', format:'a4' });
      const pageW = 210; const pageH = 297; const margin = 20; let y = margin; const lineH = (fs:number)=>fs*0.35+1.4;
      const checkPage = (need:number)=>{ if (y + need > pageH - margin) { doc.addPage(); y = margin; } };
      const sectionTitle = (t:string)=>{ checkPage(8); doc.setFont('helvetica','bold'); doc.setFontSize(12); doc.text(t, margin, y); y+=6; doc.setDrawColor(200); doc.setLineWidth(0.4); doc.line(margin,y,pageW-margin,y); y+=4; };
      const para = (t:string, fs=11)=>{ if(!t) return; doc.setFont('helvetica','normal'); doc.setFontSize(fs); const chunks = doc.splitTextToSize(t, pageW - margin*2); const need = chunks.length * lineH(fs) + 2; checkPage(need); doc.text(chunks, margin, y); y += need; };

      doc.setFont('helvetica','bold'); doc.setFontSize(18); doc.text((fullName || 'Your Name').trim() || 'Your Name', margin, y); y += 7;
      doc.setFont('helvetica','normal'); doc.setFontSize(10);
      para([email, phone, location].filter(Boolean).join('  •  '), 10);

      const yrs = Math.max(experience.filter(e=>e.start).length, 1);
      const core = skills.split(',').map(s=>s.trim()).filter(Boolean).slice(0,12);
      const coreText = core.length ? `Skilled in ${core.join(', ')}.` : '';
      const inferredSummary = summary?.trim() || `Results-driven engineer with ${yrs}+ years building and operating highly-available systems. ${coreText} Passionate about scalability, cost optimization, and developer productivity.`;
      sectionTitle('Professional Summary'); para(inferredSummary);

      if (core.length) { sectionTitle('Key Skills'); para(core.join('  •  '), 10); }

      sectionTitle('Work Experience');
      experience.filter(e=>e.company||e.role).forEach((e)=>{
        const title = `${e.role || ''}${e.company? ' — '+e.company:''}`.trim();
        if (title) { checkPage(6); doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.text(title, margin, y); y += lineH(11); }
        para([e.start, e.end].filter(Boolean).join(' - '), 10);
        const bullets = inferAwsBullets(e.description || `${e.role} at ${e.company}`);
        const lines = bullets.map(b=>`• ${b}`);
        para(lines.join('\n'), 10);
      });

      if (education.some(ed=>ed.school||ed.degree)) { sectionTitle('Education'); education.forEach(ed=>{ if (ed.degree) { checkPage(6); doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.text(ed.degree, margin, y); y += lineH(11); } para([ed.school, [ed.start, ed.end].filter(Boolean).join(' - ')].filter(Boolean).join(' • '), 10); }); }

      doc.save(`${(fullName || 'resume').trim() || 'resume'}.pdf`);
    } finally {
      setIsGenerating(false);
    }
  };

  const exportAiPdf = () => {
    if (!aiResult) return;
    const doc = new jsPDF();
    let y = 20;
    if (template !== 'minimalist') {
      doc.setDrawColor(59, 130, 246);
      doc.setLineWidth(0.8);
      doc.line(20, 15, 190, 15);
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text(fullName || 'Your Name', 20, y);
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text([`${email || ''}`.trim(), `${phone || ''}`.trim(), `${location || ''}`.trim()].filter(Boolean).join('  •  '), 20, y);
    y += 12;

    if (aiResult.summary) {
      doc.setFont('helvetica', 'bold');
      doc.text('Professional Summary', 20, y);
      y += 7;
      doc.setFont('helvetica', 'normal');
      const split = doc.splitTextToSize(aiResult.summary, 170);
      doc.text(split, 20, y);
      y += split.length * 6 + 6;
    }
    if (Array.isArray(aiResult.skills) && aiResult.skills.length) {
      doc.setFont('helvetica', 'bold');
      doc.text('Core AWS/Cloud Skills', 20, y);
      y += 7;
      doc.setFont('helvetica', 'normal');
      const skillLine = aiResult.skills.join('  •  ');
      const split = doc.splitTextToSize(skillLine, 170);
      doc.text(split, 20, y);
      y += split.length * 6 + 6;
    }
    if (Array.isArray(aiResult.certifications) && aiResult.certifications.length) {
      doc.setFont('helvetica', 'bold');
      doc.text('Certifications', 20, y);
      y += 7;
      doc.setFont('helvetica', 'normal');
      const line = aiResult.certifications.join('  •  ');
      const split = doc.splitTextToSize(line, 170);
      doc.text(split, 20, y);
      y += split.length * 6 + 6;
    }
    if (Array.isArray(aiResult.education) && aiResult.education.length) {
      doc.setFont('helvetica', 'bold');
      doc.text('Education', 20, y);
      y += 7;
      doc.setFont('helvetica', 'normal');
      aiResult.education.forEach((edu: any) => {
        doc.setFont('helvetica', 'bold');
        doc.text(`${edu.degree || ''}`, 20, y);
        y += 6;
        doc.setFont('helvetica', 'normal');
        doc.text(`${edu.school || ''} • ${edu.start || ''} - ${edu.end || ''}`, 20, y);
        y += 6;
        if (Array.isArray(edu.highlights) && edu.highlights.length) {
          const split = doc.splitTextToSize(edu.highlights.map((h: string) => `• ${h}`).join('\n'), 170);
          doc.text(split, 20, y);
          y += split.length * 6 + 6;
        }
      });
    }
    if (Array.isArray(aiResult.experience) && aiResult.experience.length) {
      doc.setFont('helvetica', 'bold');
      doc.text('Experience', 20, y);
      y += 7;
      doc.setFont('helvetica', 'normal');
      aiResult.experience.forEach((exp: any) => {
        doc.setFont('helvetica', 'bold');
        doc.text(`${exp.role || ''}  —  ${exp.company || ''}`, 20, y);
        y += 6;
        doc.setFont('helvetica', 'normal');
        doc.text(`${exp.start || ''} - ${exp.end || ''}`, 20, y);
        y += 6;
        if (Array.isArray(exp.bullets) && exp.bullets.length) {
          const bullets = exp.bullets.map((b: string) => `• ${b}`);
          const split = doc.splitTextToSize(bullets.join('\n'), 170);
          doc.text(split, 20, y);
          y += split.length * 6 + 6;
        }
      });
    }
    if (Array.isArray(aiResult.projects) && aiResult.projects.length) {
      doc.setFont('helvetica', 'bold');
      doc.text('Projects', 20, y);
      y += 7;
      doc.setFont('helvetica', 'normal');
      aiResult.projects.forEach((p: any) => {
        doc.setFont('helvetica', 'bold');
        doc.text(p.name || 'Project', 20, y);
        y += 6;
        doc.setFont('helvetica', 'normal');
        const split = doc.splitTextToSize((p.bullets || []).map((b: string) => `• ${b}`).join('\n'), 170);
        doc.text(split, 20, y);
        y += split.length * 6 + 6;
      });
    }
    if (Array.isArray(aiResult.achievements) && aiResult.achievements.length) {
      doc.setFont('helvetica', 'bold');
      doc.text('Achievements', 20, y);
      y += 7;
      doc.setFont('helvetica', 'normal');
      const split = doc.splitTextToSize(aiResult.achievements.map((a: string) => `• ${a}`).join('\n'), 170);
      doc.text(split, 20, y);
      y += split.length * 6 + 6;
    }
    doc.save(`${fullName || 'resume'}.pdf`);
  };

  if (!isPro) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                AI Resume Maker — Pro Only
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                This feature is available for Pro subscribers. Upgrade to unlock AI-powered resume creation and PDF export.
              </p>
              <Button onClick={() => navigate('/pricing')}>View Pricing</Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" /> AI Resume Maker
          </h1>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={generateWithAI} 
              disabled={isGenerating}
              title="Polish content to AWS/ATS style"
            >
              <Wand2 className="w-4 h-4 mr-2" /> {isGenerating ? 'Generating...' : 'AI Generate'}
            </Button>
            <Button 
              onClick={() => {
                if (!aiResult) {
                  toast({
                    title: 'Run AI First',
                    description: 'Click "AI Generate" to create your resume, then export.',
                    variant: 'destructive',
                  });
                  return;
                }
                exportAiPdf();
              }} 
              disabled={isGenerating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Export PDF
            </Button>
            {aiResult && (
              <Button
                variant="outline"
                disabled={isGenerating}
                onClick={() => {
                  if (!aiResult) {
                    toast({
                      title: 'Run AI First',
                      description: 'Click "AI Generate" to create your resume, then export.',
                      variant: 'destructive',
                    });
                    return;
                  }
                  const html = `
                    <h2 style="font-family:Arial;margin:0;">${fullName || 'Your Name'}</h2>
                    <p style="font-family:Arial;margin:4px 0 12px 0;font-size:12px;color:#555;">${[email, phone, location].filter(Boolean).join(' • ')}</p>
                    ${aiResult.summary ? `<h3 style=\"font-family:Arial;font-size:13px;margin:8px 0 4px 0\">Professional Summary</h3><p style=\"font-family:Arial;font-size:12px\">${aiResult.summary}</p>` : ''}
                    ${aiResult.skills?.length ? `<h3 style=\"font-family:Arial;font-size:13px;margin:8px 0 4px 0\">Skills</h3><p style=\"font-family:Arial;font-size:12px\">${aiResult.skills.join(' • ')}</p>` : ''}
                    ${aiResult.experience?.length ? `<h3 style=\"font-family:Arial;font-size:13px;margin:8px 0 4px 0\">Experience</h3>` + aiResult.experience.map((e:any)=>`<p style=\"font-family:Arial;font-size:12px;margin:6px 0 2px 0\"><strong>${e.role}</strong> — ${e.company}</p><p style=\"font-family:Arial;font-size:11px;color:#555;margin:0 0 4px 0\">${e.start} - ${e.end}</p><ul style=\"font-family:Arial;font-size:12px;margin:0 0 8px 18px\">${(e.bullets||[]).map((b:string)=>`<li>${b}</li>`).join('')}</ul>`).join('') : ''}
                  `;
                  exportDocxFromHtml(html, `${fullName || 'resume'}`);
                }}
              >
                Export DOCX
              </Button>
            )}
          </div>
        </div>

        <Card className="glass-card border border-gray-200 dark:border-white/10">
          <CardHeader>
            <CardTitle className="text-gray-800 dark:text-gray-100">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <Input placeholder="Full name" value={fullName} onChange={e => setFullName(e.target.value)} />
            <Input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <Input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
            <Input placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} />
            <div className="md:col-span-2">
              <Textarea placeholder="Professional summary" rows={4} value={summary} onChange={e => setSummary(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Textarea placeholder="Optional: paste a job description to tailor the resume" rows={5} value={jobDescription} onChange={e => setJobDescription(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Experience</CardTitle>
            <Button variant="outline" onClick={handleAddExperience}><Plus className="w-4 h-4 mr-2" />Add</Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {experience.map((exp, idx) => (
              <div key={idx} className="grid md:grid-cols-2 gap-4 border rounded-xl p-4">
                <Input placeholder="Company" value={exp.company} onChange={e => handleExpChange(idx, 'company', e.target.value)} />
                <Input placeholder="Role" value={exp.role} onChange={e => handleExpChange(idx, 'role', e.target.value)} />
                <Input placeholder="Start (e.g. Jan 2022)" value={exp.start} onChange={e => handleExpChange(idx, 'start', e.target.value)} />
                <div className="flex gap-2">
                  <Input placeholder="End (e.g. Present)" value={exp.end} onChange={e => handleExpChange(idx, 'end', e.target.value)} />
                  {experience.length > 1 && (
                    <Button variant="destructive" onClick={() => handleRemoveExperience(idx)} className="whitespace-nowrap">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div className="md:col-span-2">
                  <Textarea placeholder="Description / Achievements (AI will generate bullets if empty)" rows={4} value={exp.description} onChange={e => handleExpChange(idx, 'description', e.target.value)} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Education</CardTitle>
            <Button variant="outline" onClick={handleAddEducation}><Plus className="w-4 h-4 mr-2" />Add</Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {education.map((edu, idx) => (
              <div key={idx} className="grid md:grid-cols-2 gap-4 border rounded-xl p-4">
                <Input placeholder="School" value={edu.school} onChange={e => handleEduChange(idx, 'school', e.target.value)} />
                <Input placeholder="Degree" value={edu.degree} onChange={e => handleEduChange(idx, 'degree', e.target.value)} />
                <Input placeholder="Start (e.g. 2019)" value={edu.start} onChange={e => handleEduChange(idx, 'start', e.target.value)} />
                <div className="flex gap-2">
                  <Input placeholder="End (e.g. 2023)" value={edu.end} onChange={e => handleEduChange(idx, 'end', e.target.value)} />
                  {education.length > 1 && (
                    <Button variant="destructive" onClick={() => handleRemoveEducation(idx)} className="whitespace-nowrap">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea placeholder="Comma-separated skills (e.g. AWS, EC2, Lambda, Terraform, Docker, CI/CD)" rows={3} value={skills} onChange={e => setSkills(e.target.value)} />
            <div className="flex flex-wrap gap-2">
              {skills.split(',').map(s => s.trim()).filter(Boolean).slice(0, 20).map((s, i) => (
                <Badge key={`${s}-${i}`} variant="secondary">{s}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Live Preview + Template Switcher */}
        <Card className="glass-card border border-gray-200 dark:border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-800 dark:text-gray-100">Live Preview</CardTitle>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 dark:text-gray-300">Template</label>
                <select
                  value={template}
                  onChange={e => setTemplate(e.target.value as any)}
                  className="border rounded-md px-2 py-1 text-sm bg-background text-foreground"
                >
                  <option value="minimalist">Minimalist</option>
                  <option value="modern">Modern</option>
                  <option value="creative">Creative</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!aiResult ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Run AI Generate to see a live preview here.</p>
            ) : (
              <div className={`border rounded-xl p-5 ${template === 'modern' ? 'bg-gray-50 dark:bg-white/5' : template === 'creative' ? 'bg-gradient-to-br from-white to-blue-50 dark:from-white/5 dark:to-blue-500/5' : ''}`}>
                <h2 className="text-xl font-bold mb-1 text-gray-900 dark:text-gray-100">{fullName || 'Your Name'}</h2>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">{[email, phone, location].filter(Boolean).join(' • ')}</p>
                <div className="space-y-4">
                  {aiResult.summary && (
                    <section>
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-1">Professional Summary</h3>
                      <p className="text-sm text-gray-800 dark:text-gray-200">{aiResult.summary}</p>
                    </section>
                  )}
                  {aiResult.skills?.length ? (
                    <section>
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-1">Skills</h3>
                      <p className="text-sm text-gray-800 dark:text-gray-200">{aiResult.skills.join(' • ')}</p>
                    </section>
                  ) : null}
                  {aiResult.experience?.length ? (
                    <section>
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700 mb-1">Experience</h3>
                      <div className="space-y-2">
                        {aiResult.experience.map((exp: any, i: number) => (
                          <div key={i}>
                            <p className="text-sm font-semibold">{exp.role} — {exp.company}</p>
                            <p className="text-xs text-gray-600 mb-1">{exp.start} - {exp.end}</p>
                            <ul className="list-disc pl-5 text-sm text-gray-800">
                              {(exp.bullets || []).map((b: string, j: number) => (<li key={j}>{b}</li>))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </section>
                  ) : null}
                  {aiResult.education?.length ? (
                    <section>
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700 mb-1">Education</h3>
                      <div className="space-y-1">
                        {aiResult.education.map((ed: any, i: number) => (
                          <div key={i}>
                            <p className="text-sm font-semibold">{ed.degree}</p>
                            <p className="text-xs text-gray-600">{ed.school} • {ed.start} - {ed.end}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  ) : null}
                  {aiResult.projects?.length ? (
                    <section>
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700 mb-1">Projects</h3>
                      <div className="space-y-1">
                        {aiResult.projects.map((p: any, i: number) => (
                          <div key={i}>
                            <p className="text-sm font-semibold">{p.name}</p>
                            <ul className="list-disc pl-5 text-sm text-gray-800">
                              {(p.bullets || []).map((b: string, j: number) => (<li key={j}>{b}</li>))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </section>
                  ) : null}
                  {aiResult.achievements?.length ? (
                    <section>
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700 mb-1">Achievements</h3>
                      <ul className="list-disc pl-5 text-sm text-gray-800">
                        {aiResult.achievements.map((a: string, i: number) => (<li key={i}>{a}</li>))}
                      </ul>
                    </section>
                  ) : null}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Certifications (optional)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea placeholder="Comma-separated (e.g. AWS Certified Solutions Architect – Associate)" rows={2} value={certs} onChange={e => setCerts(e.target.value)} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ResumeMakerPage;


