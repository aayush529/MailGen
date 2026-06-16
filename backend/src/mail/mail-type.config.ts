import { GenerateMailDto } from './dto/generate-mail.dto';

export interface BodySectionPrompt {
  section: string;
  content: string;
}

type SectionBuilder = (dto: GenerateMailDto, userName: string) => BodySectionPrompt[];

function val(value: string | undefined, fallback = 'Not specified'): string {
  return value?.trim() ? value.trim() : fallback;
}

export const MAIL_TYPE_BODY_BUILDERS: Record<string, SectionBuilder> = {
  'Leave Request': (dto) => [
    { section: 'Opening', content: 'Formally request leave of absence.' },
    { section: 'Leave Details', content: `Reason: ${val(dto.reason, dto.description)}. Duration: ${val(dto.duration)}. Dates: ${val(dto.leave_date)}.` },
    { section: 'Work Arrangements', content: `Sender role: ${val(dto.sender_role, 'Student/Employee')}. ${val(dto.additional_context, 'Ensure tasks are covered during absence.')}` },
    { section: 'Approval Request', content: 'Request approval and thank the recipient.' },
  ],

  'Internship Application': (dto) => [
    { section: 'Introduction', content: `Apply for ${val(dto.role_applied, 'Internship Position')} at ${val(dto.company_name)}.` },
    { section: 'Background & Skills', content: `Academic background: ${val(dto.academic_background, dto.description)}. Skills: ${val(dto.skills)}.` },
    { section: 'Motivation', content: `Why this internship: ${val(dto.why_this_internship)}. ${val(dto.additional_context, '')}` },
    { section: 'Closing Ask', content: 'Express eagerness to discuss the application further.' },
  ],

  'Scholarship Application': (dto) => [
    { section: 'Introduction', content: `Apply for ${val(dto.scholarship_name)} at ${val(dto.institution)}.` },
    { section: 'Academic Profile', content: `Background: ${val(dto.academic_background, dto.description)}. Achievements: ${val(dto.achievements)}.` },
    { section: 'Need & Merit', content: val(dto.why_scholarship) },
    { section: 'Closing Ask', content: `Additional notes: ${val(dto.additional_context, 'Thank the committee for consideration.')}` },
  ],

  'Complaint Letter': (dto) => [
    { section: 'Opening Statement', content: `Sender role: ${val(dto.sender_role, 'Customer/Student/Employee')}. Formally raise a complaint.` },
    { section: 'Issue Details', content: `Issue: ${val(dto.issue, dto.description)}. Date: ${val(dto.incident_date)}.` },
    { section: 'Prior Attempts', content: val(dto.previous_action, 'No prior resolution attempts noted.') },
    { section: 'Impact', content: val(dto.additional_context, 'Describe inconvenience caused.') },
    { section: 'Resolution Request', content: 'Request investigation and corrective action promptly.' },
  ],

  'Apology Mail': (dto) => [
    { section: 'Acknowledgment', content: `Apologise for: ${val(dto.apology_for, dto.description)}. Role: ${val(dto.sender_role, 'Professional/Student')}.` },
    { section: 'Accountability', content: 'Take full responsibility without making excuses.' },
    { section: 'Corrective Action', content: val(dto.corrective_action, 'Steps are being taken to prevent recurrence.') },
    { section: 'Closing', content: val(dto.additional_context, 'Express sincere regret and appreciation for patience.') },
  ],

  'Follow-up Mail': (dto) => [
    { section: 'Reference', content: `Previous communication: ${val(dto.previous_communication, dto.description)}.` },
    { section: 'Follow-up Ask', content: val(dto.follow_up_ask, 'Request a status update.') },
    { section: 'Additional Context', content: val(dto.additional_context, 'None') },
  ],

  'Offer Acceptance': (dto) => [
    { section: 'Acceptance Statement', content: `Formally accept the offer for ${val(dto.offer_role, dto.description)}.` },
    { section: 'Role & Joining', content: `Joining date: ${val(dto.joining_date, 'To be confirmed with HR.')}` },
    { section: 'Enthusiasm', content: val(dto.additional_context, 'Express excitement to join the team.') },
  ],

  Resignation: (dto) => [
    { section: 'Resignation Statement', content: `Resign from ${val(dto.current_role)} at ${val(dto.employer_name)}.` },
    { section: 'Dates & Notice', content: `Last working day: ${val(dto.last_working_date)}. Notice period: ${val(dto.notice_period)}.` },
    { section: 'Reason (Optional)', content: val(dto.reason_for_leaving, 'Keep brief and professional if included.') },
    { section: 'Handover & Gratitude', content: val(dto.additional_context, 'Offer handover support and thank the employer.') },
  ],
};

export function buildBodySectionPrompt(
  type: string,
  dto: GenerateMailDto,
  userName: string,
  recipient: string,
): string {
  const builder = MAIL_TYPE_BODY_BUILDERS[type];
  const sections = builder
    ? builder(dto, userName)
    : [{ section: 'Body', content: val(dto.description, 'Generate a professional email from the provided details.') }];

  const lines = [
    `Recipient (for greeting only): ${recipient}`,
    `Sender Name (for signature only): ${userName}`,
    '',
    'Write the email body using these sections in order. Each section becomes one or more paragraphs:',
    ...sections.map((s, i) => `${i + 1}. ${s.section}: ${s.content}`),
    '',
    'Always include: Greeting → body sections above → closing line → sender signature.',
  ];

  return lines.join('\n');
}
