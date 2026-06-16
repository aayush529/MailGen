import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GenerateMailDto } from './dto/generate-mail.dto';
import { buildBodySectionPrompt } from './mail-type.config';

// ─────────────────────────────────────────────────────────────────────────────
// MASTER SYSTEM PROMPT
// ─────────────────────────────────────────────────────────────────────────────
const MASTER_SYSTEM_PROMPT = `You are MailGen AI, an expert business communication assistant.

Your task is to generate professional, context-aware emails based on the selected email type.

## General Rules
1. Understand the user's intent and the email type.
2. Generate a clear and professional subject line.
3. Maintain proper email structure:
   - Subject
   - Greeting: Must start with "Dear [Recipient Name/Title]," or "Hi [Recipient Name/Title]," (using the Recipient's name/title provided in the prompt). The Recipient's name must ONLY appear in the Greeting, NEVER in the signature at the bottom.
   - Body: Main content of the email.
   - Closing: "Sincerely,", "Best regards,", or another appropriate sign-off.
   - Signature: Must end with "[Sender Name]" (the Sender's name provided in the prompt). NEVER place the Recipient's name here.
4. Adjust tone according to the requested tone field AND the email type guidelines below.
5. Keep language natural, human, and free of robotic AI phrasing.
6. Never use unnecessary filler text.
7. Ensure grammar and formatting are perfect.
8. Infer any missing but reasonable details; do NOT invent critical facts.
9. Write emails that are ready to send with zero or minimal editing.

---

## EMAIL TYPE GUIDELINES

### TYPE: Leave Request
- Purpose: Request leave from school, college, internship, or workplace.
- Subject format: Leave Request for [Reason] – [Date Range if available]
- Greeting: Dear [Recipient],
- Body must cover: reason for leave, duration, academic/work arrangements during absence.
- Closing: Request approval and thank the recipient.
- Tone: Professional and polite.

### TYPE: Internship Application
- Purpose: Apply for an internship opportunity.
- Subject format: Application for Internship – [Role if provided]
- Greeting: Dear Hiring Manager, (or recipient if provided)
- Body must cover: introduction, academic background, relevant skills and projects, motivation for applying, why you fit the role.
- Closing: Express eagerness to discuss further.
- Tone: Professional, confident, and enthusiastic.

### TYPE: Complaint Letter
- Purpose: Report an issue formally.
- Subject format: Complaint Regarding [Issue]
- Greeting: Dear [Recipient],
- Body must cover: clear description of the issue, relevant dates/events, impact of the issue, any previous attempts to resolve it.
- Closing: Request corrective action and a prompt response.
- Tone: Firm but respectful.

### TYPE: Apology Mail
- Purpose: Apologize for mistakes, delays, misunderstandings, or absences.
- Subject format: Apology Regarding [Incident/Issue]
- Greeting: Dear [Recipient],
- Body must cover: clear acknowledgment of the mistake, taking full responsibility, brief explanation (without excuses), corrective actions being taken.
- Closing: Express sincere regret and appreciation for patience.
- Tone: Sincere, humble, and accountable.

### TYPE: Follow-up Mail
- Purpose: Follow up on a previous communication, meeting, or application.
- Subject format: Follow-Up Regarding [Topic]
- Greeting: Dear [Recipient],
- Body must cover: reference to previous email/meeting, polite request for an update, reiteration of interest or urgency if applicable.
- Closing: Thank the recipient for their time.
- Tone: Polite and professional.

### TYPE: Offer Acceptance
- Purpose: Formally accept a job offer, internship, admission, or opportunity.
- Subject format: Acceptance of [Role/Offer]
- Greeting: Dear [Recipient],
- Body must cover: express gratitude for the offer, formally accept the offer, mention the role/programme, confirm joining details if available.
- Closing: Express enthusiasm for the opportunity.
- Tone: Professional and positive.

### TYPE: Resignation
- Purpose: Formally resign from a job or position.
- Subject format: Resignation – [Role] – [Last Working Date if available]
- Greeting: Dear [Recipient],
- Body must cover: clear statement of resignation, current role, last working day, notice period if applicable, brief reason if provided, offer to assist with handover.
- Closing: Express gratitude for the opportunity and professionalism throughout.
- Tone: Professional, respectful, and concise.

### TYPE: Scholarship Application
- Purpose: Apply for a scholarship or financial aid.
- Subject format: Application for [Scholarship Name]
- Greeting: Dear Scholarship Committee, (or recipient if provided)
- Body must cover: introduction, academic background, achievements, motivation for applying, why the applicant deserves or needs the scholarship.
- Closing: Express gratitude and eagerness for consideration.
- Tone: Professional, sincere, and persuasive.

---

## WORD COUNT CONSTRAINT
You MUST strictly target the requested word limit for the email body.
- The word count of the generated email body (excluding the subject line) MUST be within ±10% of the requested limit.
- If the requested limit is high (e.g., 500 words), you must expand the email by detailing the context, professional background, implications, and action plans to write a comprehensive email of approximately 500 words. Do NOT return a brief email when a higher word count is requested.
- If the requested limit is low (e.g., 100 words), keep it extremely crisp, concise, and direct.
- If no limit is specified, target approximately 200 words.

## QUALITY CHECKLIST (apply internally before responding)
✓ Subject is present and specific.
✓ Greeting is appropriate.
✓ Message is clear and complete.
✓ Tone matches both the type and requested tone.
✓ Grammar is correct.
✓ Email sounds human-written.
✓ No unnecessary repetition.
✓ Recipient can easily understand the request.
✓ Email is ready to send.

---

## OUTPUT FORMAT
Return only valid JSON — no markdown, no explanations, no commentary:
{
  "subject": "Generated Subject Line",
  "body": "Complete email body including greeting and closing",
  "tone_used": "Actual tone applied",
  "mail_type": "The email type used"
}`;

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Build a structured user prompt per mail type
// ─────────────────────────────────────────────────────────────────────────────
function buildStructuredPrompt(dto: GenerateMailDto, userName: string): string {
  const { type, tone } = dto;
  const wordLimitNum = dto.word_limit ? parseInt(dto.word_limit, 10) : 200;
  const wordLimit = `${wordLimitNum} words`;
  const recipient = dto.recipient || 'Concerned Authority';

  const base = `Email Type: ${type}
Tone: ${tone}
Word Limit for Email Body: ${wordLimit}
Sender Name: ${userName}`;

  const bodySections = buildBodySectionPrompt(type, dto, userName, recipient);

  return `${base}

${bodySections}

The email body MUST be very close to the target of ${wordLimit} (do not write significantly fewer words; if the target is 500, write a detailed and elaborated email of approximately 500 words by adding context and details; if the target is 100, keep it extremely concise). DO NOT exceed ${wordLimitNum} words.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mail Service
// ─────────────────────────────────────────────────────────────────────────────
@Injectable()
export class MailService {
  async generateMail(dto: GenerateMailDto, userName: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    const targetLimit = parseInt(dto.word_limit || '200', 10);
    let subject = '';
    let body = '';

    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          systemInstruction: MASTER_SYSTEM_PROMPT,
          generationConfig: {
            responseMimeType: 'application/json',
          },
        });

        const userPrompt = buildStructuredPrompt(dto, userName);

        const result = await model.generateContent(userPrompt);
        const text = result.response.text();

        try {
          const parsed = JSON.parse(text);
          subject = parsed.subject;
          body = parsed.body;
        } catch (parseError) {
          console.error('Failed to parse JSON response from Gemini, raw string fallback:', text);
          const lines = text.split('\n');
          if (lines[0]?.toLowerCase().startsWith('subject:')) {
            subject = lines[0].replace(/^subject:\s*/i, '').trim();
            const idx = lines[1]?.trim() === '' ? 2 : 1;
            body = lines.slice(idx).join('\n').trim();
          } else {
            subject = `${dto.type} - Generated`;
            body = text.trim();
          }
        }
      } catch (error) {
        console.error('Gemini API error, falling back to local templates:', error);
      }
    }

    if (!body) {
      const fallbackResult = this.generateMockMailFallback(dto, userName);
      const lines = fallbackResult.split('\n');
      subject = lines[0].replace(/^subject:\s*/i, '').trim();
      const idx = lines[1]?.trim() === '' ? 2 : 1;
      body = lines.slice(idx).join('\n').trim();
    }

    const adjustedBody = this.adjustToExactWordCount(body, targetLimit);
    return `Subject: ${subject}\n\n${adjustedBody}`;
  }

  private adjustToExactWordCount(body: string, targetLimit: number): string {
    const words = body.trim().split(/\s+/).filter(Boolean);
    const currentCount = words.length;

    if (currentCount === targetLimit) {
      return body;
    }

    const EXACT_WORD_PHRASES: Record<number, string> = {
      1: 'Thanks.',
      2: 'Thank you.',
      3: 'Best regards always.',
      4: 'Thank you very much.',
      5: 'I appreciate your prompt support.',
      6: 'I appreciate your time and assistance.',
      7: 'Thank you for your cooperation and help.',
      8: 'I look forward to hearing from you soon.',
      9: 'Please let me know if you have any questions.',
      10: 'Please let me know if you need any further information.',
      11: 'Please let me know if you need any further details. Thanks.',
      12: 'Please let me know if you need any further details or clarifications.',
      13: 'Please let me know if you need any further details or clarifications. Thanks.',
      14: 'Please let me know if you need any further details or clarifications. Thank you.',
      15: 'Please let me know if you need any further details or clarifications. Best regards.',
      16: 'Please let me know if you need any further details or clarifications. Thank you very much.',
      17: 'Please let me know if you need any further details or clarifications regarding this request. Thanks.',
      18: 'Please let me know if you need any further details or clarifications regarding this request. Thank you.',
      19: 'Please let me know if you need any further details or clarifications regarding this request. Best regards.',
      20: 'Please let me know if you need any further details or clarifications regarding this request. Thank you very much.',
    };

    const pool = [
      'I have set up an out-of-office response on my email to redirect urgent queries.',
      'I have also compiled a comprehensive progress report for all my ongoing assignments to review.',
      'I am working diligently this week to ensure all key deliverables are completed on time.',
      'I have discussed the upcoming deadlines with the project coordinator to ensure smooth operations.',
      'Should there be any urgent matters requiring direct attention, please feel free to call.',
      'I will review any outstanding items immediately upon my return to remain on schedule.',
      'I appreciate your flexibility and understanding during this period as we coordinate this transition.',
    ];

    if (currentCount < targetLimit) {
      let diff = targetLimit - currentCount;
      let adjustedWords = [...words];
      let poolIndex = 0;

      while (diff >= 15 && poolIndex < pool.length) {
        const sentence = pool[poolIndex];
        const sentenceWords = sentence.split(/\s+/).filter(Boolean);
        adjustedWords.push(...sentenceWords);
        diff -= sentenceWords.length;
        poolIndex++;
      }

      if (diff > 0 && EXACT_WORD_PHRASES[diff]) {
        const phraseWords = EXACT_WORD_PHRASES[diff].split(/\s+/).filter(Boolean);
        adjustedWords.push(...phraseWords);
      } else if (diff > 0) {
        for (let i = 0; i < diff; i++) {
          adjustedWords.push(i === diff - 1 ? 'Thanks.' : 'thanks');
        }
      }

      return adjustedWords.join(' ');
    } else {
      const sentences = body.split(/(?<=[.!?])\s+/).filter(Boolean);
      let newWords: string[] = [];

      for (let i = 0; i < sentences.length; i++) {
        const sentenceWords = sentences[i].split(/\s+/).filter(Boolean);
        if (newWords.length + sentenceWords.length <= targetLimit) {
          newWords.push(...sentenceWords);
        } else {
          break;
        }
      }

      if (newWords.length === 0 && sentences.length > 0) {
        const firstSentenceWords = sentences[0].split(/\s+/).filter(Boolean);
        newWords = firstSentenceWords.slice(0, targetLimit);
        if (newWords.length > 0) {
          const lastWord = newWords[newWords.length - 1];
          if (!/[.!?]$/.test(lastWord)) {
            newWords[newWords.length - 1] = lastWord.replace(/[,;:]$/, '') + '.';
          }
        }
        return newWords.join(' ');
      }

      let diff = targetLimit - newWords.length;
      if (diff > 0 && EXACT_WORD_PHRASES[diff]) {
        const phraseWords = EXACT_WORD_PHRASES[diff].split(/\s+/).filter(Boolean);
        newWords.push(...phraseWords);
      } else if (diff > 0) {
        for (let i = 0; i < diff; i++) {
          newWords.push(i === diff - 1 ? 'Thanks.' : 'thanks');
        }
      }

      return newWords.join(' ');
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Fallback: local template generation (no API key)
  // ─────────────────────────────────────────────────────────────────────────
  private getMockElaboration(type: string, targetLimit: number): string {
    let text = '';
    if (type === 'Leave Request') {
      if (targetLimit >= 200) {
        text += '\n\nTo ensure a smooth transition, I have documented my current tasks and set up an automatic out-of-office reply. I will remain reachable for urgent matters via email.';
      }
      if (targetLimit >= 350) {
        text += '\n\nAdditionally, I have briefed my immediate colleagues on the status of my ongoing projects. They have kindly agreed to monitor any urgent deliverables that may arise during my absence. I will compile a detailed status report before my departure.';
      }
      if (targetLimit >= 500) {
        text += '\n\nI am also working extra hours this week to complete all pending deliverables ahead of time. This will ensure my team faces no blockers while I am away. Thank you once again for your understanding and guidance.';
      }
    } else if (type === 'Internship Application') {
      if (targetLimit >= 200) {
        text += '\n\nThrough my academic coursework and personal projects, I have developed a strong foundation in this field. I am eager to apply my theoretical knowledge to real-world challenges and learn from the experienced professionals at your company.';
      }
      if (targetLimit >= 350) {
        text += '\n\nIn addition to my technical skills, I am a proactive communicator and a collaborative team player. I enjoy solving complex problems and am always looking for ways to optimize workflows. I believe this internship would be a great mutual fit.';
      }
      if (targetLimit >= 500) {
        text += '\n\nI have been following your organization\'s achievements and am highly inspired by your recent initiatives. Working with your team would provide me with invaluable industry insights and allow me to make meaningful contributions. Thank you for your time.';
      }
    } else if (type === 'Complaint Letter') {
      if (targetLimit >= 200) {
        text += '\n\nThis situation has caused significant disruption and inconvenience. I have attempted to resolve this through standard support channels, but have not yet received a satisfactory response. I believe a formal review is now necessary.';
      }
      if (targetLimit >= 350) {
        text += '\n\nI have attached all relevant receipts, screenshots, and logs to document this issue. I expect a prompt investigation into this matter and look forward to receiving a status update within the next few business days.';
      }
      if (targetLimit >= 500) {
        text += '\n\nIf this issue remains unresolved, I will be forced to escalate it to higher management or relevant regulatory bodies. I trust that it will not come to that and that we can reach an amicable resolution soon. Thank you for your attention.';
      }
    } else if (type === 'Apology Mail') {
      if (targetLimit >= 200) {
        text += '\n\nI understand the negative impact this has had on our timeline and deliverables. I want to assure you that this is not reflective of my standard of work, and I am fully committed to making things right.';
      }
      if (targetLimit >= 350) {
        text += '\n\nI have already initiated a review of our processes to identify how this occurred and put preventive measures in place. I will share the findings and corrective action plan with the team tomorrow morning.';
      }
      if (targetLimit >= 500) {
        text += '\n\nI truly appreciate your patience, feedback, and continued support. I value our professional relationship and am working diligently to rebuild your trust. Please let me know if we can discuss this in person.';
      }
    } else if (type === 'Follow-up Mail') {
      if (targetLimit >= 200) {
        text += '\n\nI understand that you have a busy schedule, but even a brief update would be extremely helpful so that I can plan my next steps accordingly. Please let me know if you need any additional information from my side.';
      }
      if (targetLimit >= 350) {
        text += '\n\nFor your convenience, I have attached the original proposal and documents to this email. I am happy to hop on a quick 5-minute call if that makes it easier to discuss. Let me know what time works best for you.';
      }
      if (targetLimit >= 500) {
        text += '\n\nI look forward to hearing your thoughts and hoping we can collaborate on this exciting initiative. Thank you once again for your consideration and time in reviewing my request.';
      }
    } else if (type === 'Offer Acceptance') {
      if (targetLimit >= 200) {
        text += '\n\nI am incredibly excited about the opportunity to join the team and begin collaborating. I am confident that my skills and background will allow me to make immediate positive contributions to the company\'s goals.';
      }
      if (targetLimit >= 350) {
        text += '\n\nI have reviewed the onboarding materials and will complete the necessary documentation by the end of the week. Please let me know if there are any other pre-employment formalities I should complete.';
      }
      if (targetLimit >= 500) {
        text += '\n\nI would also like to thank the hiring team for making the recruitment process so smooth and engaging. I look forward to meeting everyone in person on my first day. Thank you again for this fantastic opportunity.';
      }
    } else if (type === 'Resignation') {
      if (targetLimit >= 200) {
        text += '\n\nDuring my notice period, I am committed to completing all pending assignments and ensuring a smooth handover of responsibilities to my team or designated successor.';
      }
      if (targetLimit >= 350) {
        text += '\n\nI have documented my ongoing projects and key contacts to facilitate the transition. I am happy to train a replacement or assist in any way needed during this period.';
      }
      if (targetLimit >= 500) {
        text += '\n\nI am grateful for the opportunities for professional growth and the valuable experience I have gained during my tenure. I wish the organisation continued success and hope to stay in touch with colleagues in the future.';
      }
    } else if (type === 'Scholarship Application') {
      if (targetLimit >= 200) {
        text += '\n\nMy academic record and extracurricular involvement reflect my dedication to excellence and my commitment to making a meaningful contribution to my field of study.';
      }
      if (targetLimit >= 350) {
        text += '\n\nReceiving this scholarship would significantly reduce my financial burden and allow me to focus fully on my studies and research. I am determined to uphold the values and expectations associated with this award.';
      }
      if (targetLimit >= 500) {
        text += '\n\nI am eager to represent your institution with integrity and to give back to the community through mentorship and service once I complete my programme. Thank you for considering my application.';
      }
    } else {
      if (targetLimit >= 200) {
        text += '\n\nPlease let me know if you need any further details or clarifications. I will be happy to elaborate on any specific points of interest.';
      }
      if (targetLimit >= 350) {
        text += '\n\nI look forward to your feedback and hope we can resolve this or move forward with the next steps as soon as possible. Thank you for your time and cooperation.';
      }
      if (targetLimit >= 500) {
        text += '\n\nYour assistance in this matter is highly appreciated. I will keep you updated on any further developments from my end. Sincerely.';
      }
    }
    return text;
  }

  private getMockPaddingSentences(type: string, currentCount: number, target: number): string {
    const sentences: Record<string, string[]> = {
      'Leave Request': [
        'I have set up an out-of-office response on my email to redirect urgent queries to my team.',
        'I have also compiled a comprehensive progress report for all my ongoing assignments to keep everyone updated.',
        'I am working diligently this week to ensure all key deliverables are completed before my leave begins.',
        'I have discussed the upcoming deadlines with the project coordinator to ensure there are no workflow bottlenecks.',
        'Should there be any urgent matters requiring my direct attention, please feel free to reach out to me via phone.',
        'I will review any outstanding items immediately upon my return to ensure we remain on schedule.',
        'Thank you once again for your guidance and support in facilitating this leave request.',
        'I will make sure to check in periodically if connectivity allows.',
        'I appreciate your flexibility and understanding during this period.',
        'I will ensure my handover notes are shared with all key team members before my departure.',
      ],
      'Internship Application': [
        'I am eager to contribute my skills and learn from the talented professionals in your group.',
        'My coursework has prepared me to tackle complex problems and work collaboratively in fast-paced environments.',
        'I am highly motivated to work on your company\'s innovative projects and contribute to their success.',
        'I appreciate your time and consideration of my application and look forward to the possibility of working together.',
        'Please let me know if you require any additional portfolios, references, or transcripts from my side.',
        'I am available for an interview at your convenience and look forward to discussing my application further.',
        'I am confident that my academic background aligns well with your team\'s current objectives.',
        'I possess a strong work ethic and a passion for continuous learning and professional development.',
        'I look forward to contributing my energy and dedication to your organization.',
      ],
      'Complaint Letter': [
        'I believe that addressing this issue promptly will prevent similar occurrences in the future.',
        'I value your company\'s services and hope we can resolve this matter in a mutually agreeable way.',
        'I have kept a record of all previous communications and transactions regarding this issue for reference.',
        'I request that you confirm receipt of this letter and provide an expected timeline for the investigation.',
        'Thank you for your prompt attention to this matter, and I look forward to your response.',
        'This has caused a significant impact on my daily routine and operations.',
        'I hope to hear from your customer support representatives at your earliest convenience.',
        'I appreciate your understanding and support in resolving this discrepancy.',
      ],
      'Apology Mail': [
        'I am taking this situation very seriously and am investigating the root cause of the error.',
        'I have briefed my team on the corrective actions to ensure we prevent similar mistakes in the future.',
        'I value our partnership and am committed to delivering the high quality of work you expect from us.',
        'Thank you for bringing this to my attention and for your patience as we work to resolve this issue.',
        'I am available to discuss this further at your convenience to answer any questions you may have.',
        'I sincerely apologize for the inconvenience and delay this has caused to the project timeline.',
        'We have implemented new quality control checks to avoid such occurrences going forward.',
        'I hope to demonstrate our commitment to excellence in our future deliverables.',
      ],
      'Follow-up Mail': [
        'I want to ensure we align on the project deliverables and timeline to avoid any delays.',
        'Please let me know if you need any further clarification or details regarding our last discussion.',
        'I am happy to schedule a quick sync call this week if that is more convenient for you.',
        'Thank you for your continued collaboration and support on this important project.',
        'I look forward to your reply and to working together on the next phases.',
        'I wanted to make sure you had all the necessary materials to proceed.',
        'Please feel free to share any feedback or suggestions you might have.',
        'I appreciate your guidance and look forward to our next meeting.',
      ],
      'Offer Acceptance': [
        'I am eager to meet the rest of the team and start working on our upcoming initiatives.',
        'I am preparing all the necessary documents and will submit them to HR ahead of my joining date.',
        'Please let me know if there are any specific onboarding tasks I should complete in the meantime.',
        'I am grateful for this opportunity and look forward to a successful journey with the company.',
        'Thank you once again for the offer and for the warm welcome during the recruitment process.',
        'I am excited to align my career goals with the company\'s vision.',
        'I look forward to working under your leadership and contributing to team achievements.',
      ],
      'Resignation': [
        'I will ensure all my current projects are documented and handed over before my departure.',
        'I am happy to assist with training my replacement or supporting the team during the transition.',
        'Thank you for the opportunities for growth and development during my time here.',
        'I wish the team and the organisation continued success in all future endeavours.',
        'Please let me know if there are any formal exit procedures I should complete.',
        'I remain committed to maintaining high standards of work until my last day.',
        'I appreciate your understanding and support during this transition period.',
      ],
      'Scholarship Application': [
        'My academic performance demonstrates consistent dedication and a strong work ethic.',
        'I am actively involved in community service and leadership roles on campus.',
        'This scholarship would enable me to pursue research and professional development opportunities.',
        'I am committed to maintaining the academic standards required of scholarship recipients.',
        'Thank you for your time and consideration of my application.',
        'I am happy to provide references or additional documentation upon request.',
        'I look forward to contributing positively to the academic community if selected.',
      ],
    };

    const pool = sentences[type] || [
      'Please let me know if you need any further details or clarifications from my side.',
      'I look forward to your feedback and hope we can move forward with the next steps soon.',
      'Thank you for your time, consideration, and cooperation in this matter.',
      'I appreciate your prompt response and help with this request.',
      'Let me know if we can discuss this in more detail at a later stage.',
    ];

    let result = '';
    let count = currentCount;
    let index = 0;
    while (count < target && index < pool.length) {
      const sentence = pool[index];
      result += ' ' + sentence;
      count += sentence.split(/\s+/).length;
      index++;
    }
    return result;
  }

  private generateMockMailFallback(dto: GenerateMailDto, userName: string): string {
    const { type, tone } = dto;
    const targetLimit = parseInt(dto.word_limit || '200', 10);
    const elaboration = this.getMockElaboration(type, targetLimit);

    const salutation = dto.recipient
      ? (tone === 'Semi-Formal' ? `Hi ${dto.recipient},` : `Dear ${dto.recipient},`)
      : (tone === 'Semi-Formal' ? 'Hi,' : 'Dear Sir/Madam,');

    const signOff =
      tone === 'Semi-Formal'
        ? 'Best regards'
        : tone === 'Urgent'
          ? 'Regards'
          : 'Sincerely';

    const urgencyPrefix = tone === 'Urgent' ? '[URGENT] ' : '';
    let subject = '';
    let body = '';

    switch (type) {
      case 'Leave Request': {
        const reason = dto.reason || dto.description || 'personal reasons';
        const duration = dto.duration ? ` for ${dto.duration}` : '';
        const dates = dto.leave_date ? ` from ${dto.leave_date}` : '';
        subject = `${urgencyPrefix}Leave Request – ${reason}${dates}`;
        const intro = `${salutation}\n\nI am writing to formally request a leave of absence${duration}${dates} due to ${reason}.\n\nI have ensured all pending tasks and responsibilities are handled prior to my absence and will remain reachable for any critical matters.${elaboration}`;
        const closing = `\n\nI would appreciate your approval at the earliest convenience. Thank you for your understanding.\n\n${signOff},\n${userName}`;
        const currentCount = intro.split(/\s+/).filter(Boolean).length + closing.split(/\s+/).filter(Boolean).length;
        const padding = this.getMockPaddingSentences(type, currentCount, targetLimit);
        body = intro + padding + closing;
        break;
      }

      case 'Internship Application': {
        const role = dto.role_applied || 'Internship Position';
        const company = dto.company_name ? ` at ${dto.company_name}` : '';
        subject = `Application for ${role}${company}`;
        const intro = `${salutation}\n\nI am writing to express my interest in the ${role}${company}. ${dto.academic_background || dto.description || ''}\n\nMy key skills include ${dto.skills || 'relevant technical and soft skills'}. ${dto.why_this_internship ? `I am particularly motivated by: ${dto.why_this_internship}.` : ''}${elaboration}`;
        const closing = `\n\nI would welcome the opportunity to discuss how my background aligns with your requirements.\n\nThank you for considering my application.\n\n${signOff},\n${userName}`;
        const currentCount = intro.split(/\s+/).filter(Boolean).length + closing.split(/\s+/).filter(Boolean).length;
        const padding = this.getMockPaddingSentences(type, currentCount, targetLimit);
        body = intro + padding + closing;
        break;
      }

      case 'Complaint Letter': {
        const issue = dto.issue || dto.description || 'the matter at hand';
        subject = `${urgencyPrefix}Complaint Regarding ${issue}`;
        const intro = `${salutation}\n\nI am writing to formally raise a complaint regarding ${issue}${dto.incident_date ? ` on ${dto.incident_date}` : ''}.\n\n${dto.previous_action ? `I have previously attempted to resolve this matter by: ${dto.previous_action}. However, the issue remains unresolved.` : 'This has caused considerable inconvenience.'}${elaboration}`;
        const closing = `\n\nI respectfully request that this matter be investigated and resolved promptly.\n\n${signOff},\n${userName}`;
        const currentCount = intro.split(/\s+/).filter(Boolean).length + closing.split(/\s+/).filter(Boolean).length;
        const padding = this.getMockPaddingSentences(type, currentCount, targetLimit);
        body = intro + padding + closing;
        break;
      }

      case 'Apology Mail': {
        const apologyFor = dto.apology_for || dto.description || 'the recent incident';
        subject = `Sincere Apology Regarding ${apologyFor}`;
        const intro = `${salutation}\n\nI am writing to sincerely apologise for ${apologyFor}. I take full responsibility for this and deeply regret any inconvenience caused.\n\n${dto.corrective_action ? `I have taken the following corrective steps: ${dto.corrective_action}.` : 'I am taking immediate steps to ensure this does not recur.'}${elaboration}`;
        const closing = `\n\nThank you for your patience and understanding.\n\n${signOff},\n${userName}`;
        const currentCount = intro.split(/\s+/).filter(Boolean).length + closing.split(/\s+/).filter(Boolean).length;
        const padding = this.getMockPaddingSentences(type, currentCount, targetLimit);
        body = intro + padding + closing;
        break;
      }

      case 'Follow-up Mail': {
        const topic = dto.previous_communication || dto.description || 'our previous conversation';
        subject = `Follow-Up Regarding ${topic}`;
        const intro = `${salutation}\n\nI am writing to follow up on ${topic}. ${dto.follow_up_ask ? `I wanted to check on: ${dto.follow_up_ask}.` : 'Could you please provide an update at your earliest convenience?'}${elaboration}`;
        const closing = `\n\nThank you for your time.\n\n${signOff},\n${userName}`;
        const currentCount = intro.split(/\s+/).filter(Boolean).length + closing.split(/\s+/).filter(Boolean).length;
        const padding = this.getMockPaddingSentences(type, currentCount, targetLimit);
        body = intro + padding + closing;
        break;
      }

      case 'Offer Acceptance': {
        const role = dto.offer_role || dto.description || 'the offered position';
        subject = `Acceptance of Offer – ${role}`;
        const intro = `${salutation}\n\nThank you for extending the offer for ${role}. I am pleased to formally accept this opportunity.\n\n${dto.joining_date ? `I confirm my joining date as ${dto.joining_date}.` : 'Please let me know the next steps regarding onboarding.'}${elaboration}`;
        const closing = `\n\nI look forward to contributing to the team.\n\n${signOff},\n${userName}`;
        const currentCount = intro.split(/\s+/).filter(Boolean).length + closing.split(/\s+/).filter(Boolean).length;
        const padding = this.getMockPaddingSentences(type, currentCount, targetLimit);
        body = intro + padding + closing;
        break;
      }

      case 'Resignation': {
        const employer = dto.employer_name ? ` at ${dto.employer_name}` : '';
        const role = dto.current_role || 'my current position';
        subject = `${urgencyPrefix}Resignation – ${role}`;
        const intro = `${salutation}\n\nPlease accept this letter as formal notification of my resignation from the position of ${role}${employer}.${dto.last_working_date ? ` My last working day will be ${dto.last_working_date}.` : ''}${dto.notice_period ? ` I am providing ${dto.notice_period} of notice as required.` : ''}\n\n${dto.reason_for_leaving ? `After careful consideration, I have decided to leave because ${dto.reason_for_leaving}.` : 'This was not an easy decision, and I am grateful for the opportunities I have had here.'}${elaboration}`;
        const closing = `\n\nThank you for your support and guidance during my tenure.\n\n${signOff},\n${userName}`;
        const currentCount = intro.split(/\s+/).filter(Boolean).length + closing.split(/\s+/).filter(Boolean).length;
        const padding = this.getMockPaddingSentences(type, currentCount, targetLimit);
        body = intro + padding + closing;
        break;
      }

      case 'Scholarship Application': {
        const scholarship = dto.scholarship_name || 'Scholarship Programme';
        const institution = dto.institution ? ` at ${dto.institution}` : '';
        subject = `Application for ${scholarship}`;
        const intro = `${salutation}\n\nI am writing to apply for the ${scholarship}${institution}. ${dto.academic_background || dto.description || ''}\n\n${dto.achievements ? `My notable achievements include ${dto.achievements}.` : ''} ${dto.why_scholarship ? `I am applying because ${dto.why_scholarship}.` : ''}${elaboration}`;
        const closing = `\n\nThank you for considering my application. I would be honoured to receive this scholarship.\n\n${signOff},\n${userName}`;
        const currentCount = intro.split(/\s+/).filter(Boolean).length + closing.split(/\s+/).filter(Boolean).length;
        const padding = this.getMockPaddingSentences(type, currentCount, targetLimit);
        body = intro + padding + closing;
        break;
      }

      default: {
        subject = type;
        const intro = `${salutation}\n\n${dto.description || ''}${elaboration}`;
        const closing = `\n\n${signOff},\n${userName}`;
        const currentCount = intro.split(/\s+/).filter(Boolean).length + closing.split(/\s+/).filter(Boolean).length;
        const padding = this.getMockPaddingSentences(type, currentCount, targetLimit);
        body = intro + padding + closing;
      }
    }

    return `Subject: ${subject}\n\n${body}`;
  }
}
