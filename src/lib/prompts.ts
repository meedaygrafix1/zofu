export const SYSTEM_PROMPT = `You are Zofu, an expert resume optimization AI. Your job is to take a candidate's existing resume content and a target job description, then rewrite the resume to be perfectly tailored for that role.

CRITICAL RULES:
1. AMPLIFY, don't fabricate. Only enhance and reframe existing experience — never invent new skills or experiences.
2. Mirror the language, tone, and terminology used in the job description.
3. Quantify achievements wherever possible (e.g., "increased sales" → "boosted revenue by 20%").
4. Naturally integrate the top keywords from the JD for ATS compatibility.
5. Keep the content truthful and professional.
6. Maintain the candidate's voice while making it more compelling.`;

export const AMPLIFY_PROMPT = `Analyze the following resume and job description. Then produce an amplified version of the resume tailored to this specific role.

## Resume Content:
{resumeText}

## Job Description:
{jobDescription}

## Instructions:
1. Identify the top keywords and requirements from the JD (both "must-have" and "nice-to-have").
2. Rewrite the Professional Summary to directly address the role requirements.
3. Rewrite Experience bullet points to mirror JD language and quantify achievements.
4. Ensure the top keywords from the JD are naturally woven into the content.
5. Suggest any missing skills that should be added to a Skills section.

## Required Output Format (JSON):
{
  "amplifiedResume": "The full rewritten resume text with clear sections",
  "atsScore": 85,
  "keywords": {
    "found": ["keyword1", "keyword2"],
    "missing": ["keyword3", "keyword4"],
    "added": ["keyword5"]
  },
  "changes": [
    {
      "section": "Professional Summary",
      "original": "Original text...",
      "amplified": "Rewritten text...",
      "reason": "Why this change was made"
    }
  ],
  "summary": "Brief explanation of what was changed and why"
}

Return ONLY valid JSON, no markdown fences or extra text.`;

export const INTERVIEW_PROMPT = `Based on the following resume and job description, generate targeted interview questions that a candidate should prepare for.

## Resume Content:
{resumeText}

## Job Description:
{jobDescription}

## Instructions:
Generate two categories of questions:

1. **Behavioral Questions** (5-7 questions): "Tell me about a time you..." style questions that connect the candidate's experience with the JD requirements. Include suggested talking points from the resume.

2. **Technical Questions** (5-7 questions): Specific questions about the technologies, tools, and methodologies mentioned in the JD. Tailor difficulty to the role level.

## Required Output Format (JSON):
{
  "behavioral": [
    {
      "question": "Tell me about a time you...",
      "context": "This relates to the JD requirement for...",
      "suggestedPoints": ["Point from resume 1", "Point from resume 2"]
    }
  ],
  "technical": [
    {
      "question": "How would you approach...",
      "context": "This tests knowledge of...",
      "suggestedPoints": ["Relevant experience 1", "Key concept to mention"]
    }
  ]
}

Return ONLY valid JSON, no markdown fences or extra text.`;

export function buildPrompt(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), value);
  }
  return result;
}
