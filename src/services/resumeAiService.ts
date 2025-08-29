// Simple client-side Gemini integration (no Supabase). Uses REST API.
// Requires: VITE_GEMINI_API_KEY in your environment.

import { supabase } from '@/integrations/supabase/client';

export interface ExperienceItemInput {
  company: string;
  role: string;
  start: string;
  end: string;
  description: string;
}

export interface EducationItemInput {
  school: string;
  degree: string;
  start: string;
  end: string;
}

export interface ResumeAIInput {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary?: string;
  skills: string[];
  experience: ExperienceItemInput[];
  education: EducationItemInput[];
  targetRole: string; // e.g., "AWS/Cloud Engineer"
  jobDescription?: string; // optional JD tailoring
}

export interface ResumeAIOutput {
  summary: string;
  skills: string[];
  certifications?: string[];
  education?: Array<{ school: string; degree: string; start: string; end: string; highlights?: string[] }>;
  projects?: Array<{ name: string; bullets: string[] }>;
  achievements?: string[];
  suggestions?: string[];
  experience: Array<{
    company: string;
    role: string;
    start: string;
    end: string;
    bullets: string[];
  }>;
}

const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

const extractJson = (text: string): any => {
  try {
    // Try plain JSON first
    return JSON.parse(text);
  } catch {}
  // Try to extract from ```json code fence
  const match = text.match(/```json[\s\S]*?```/i) || text.match(/```[\s\S]*?```/);
  if (match) {
    const inner = match[0].replace(/```json|```/gi, '').trim();
    try { return JSON.parse(inner); } catch {}
  }
  // Try braces substring
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    const sub = text.substring(start, end + 1);
    try { return JSON.parse(sub); } catch {}
  }
  throw new Error('Unable to parse AI JSON response');
};

export const generateAwsResumeAI = async (input: ResumeAIInput): Promise<ResumeAIOutput> => {
  // Get API key from database instead of environment variable
  const { data: apiKeys, error } = await supabase.rpc('get_api_keys');
  
  if (error || !apiKeys || !apiKeys[0]?.gemini_api_key) {
    throw new Error('Gemini API key not configured. Please set it in admin settings.');
  }
  
  const apiKey = apiKeys[0].gemini_api_key;

  const prompt = `You are an expert resume writer and former FAANG/cloud recruiter. Given the user's inputs (from form or parsed resume), produce a world-class, ATS-optimized resume body. If a job description is provided, tailor language and keywords to it.
Return STRICT JSON only with this schema:
{
  "summary": string,
  "skills": string[],
  "certifications": string[],
  "education": [{"school": string, "degree": string, "start": string, "end": string, "highlights": string[]}],
  "experience": [{"company": string, "role": string, "start": string, "end": string, "bullets": string[]}],
  "projects": [{"name": string, "bullets": string[]}],
  "achievements": string[],
  "suggestions": string[]
}
Rules:
- Tone: executive, concise, high signal. Zero fluff.
- Bullets: start with strong action verbs; include quantified impact and scale (throughput, cost, latency, uptime), concrete AWS services, and architecture patterns. 4–6 bullets per role.
- Use realistic numbers (no placeholders like X%). Infer conservative but impressive metrics if missing.
- Skills: prioritize AWS services, IaC, CI/CD, security, networking; keep 12–18 items max.
- Certifications: include well-known AWS certs only when appropriate.
- JSON only — no extra text, no markdown, no code fences.
 - Never output placeholders, bracket tokens, or instructions like "[Previous Role]" or "Add 4-6 bullets". If data is unknown, omit the item.
 - For entry-level candidates, emphasize internships, projects, research, and measurable coursework outcomes.

Sections to include and polish: Professional Summary, Skills, Education, Experience, Projects, Achievements, Suggestions for Improvement.

Candidate:
Name: ${input.fullName}
Target Role: ${input.targetRole}
Location: ${input.location}
Email: ${input.email}
Phone: ${input.phone}
Given Summary: ${input.summary || '(none)'}
Skills: ${input.skills.join(', ')}
Experience: ${input.experience.map(e => `${e.role} at ${e.company} (${e.start} - ${e.end}): ${e.description}`).join(' | ')}
Education: ${input.education.map(e => `${e.degree} at ${e.school} (${e.start}-${e.end})`).join(' | ')}
Job Description (optional): ${input.jobDescription || '(none)'}
`;

  const res = await fetch(`${GEMINI_ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      }
    })
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Gemini error: ${res.status} ${msg}`);
  }
  const data = await res.json();
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  if (!text) throw new Error('Gemini returned empty response');

  const parsed = extractJson(text);
  // Basic validation
  if (!parsed.summary || !parsed.experience) {
    throw new Error('Gemini JSON missing required fields');
  }
  return parsed as ResumeAIOutput;
};


