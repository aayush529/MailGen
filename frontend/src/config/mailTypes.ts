export interface FieldDef {
  key: string;
  label: string;
  placeholder: string;
  type: 'text' | 'textarea';
  required?: boolean;
  fullWidth?: boolean;
}

export interface BodySectionDef {
  id: string;
  label: string;
  /** What this part of the generated email should contain */
  description: string;
}

export interface FieldGroupDef {
  /** Maps to a body section id */
  sectionId: string;
  title: string;
  hint?: string;
  fields: FieldDef[];
}

export interface MailTypeConfig {
  value: string;
  label: string;
  badge: string;
  subjectFormat: string;
  /** Ordered outline of the final email structure */
  structure: BodySectionDef[];
  /** Form fields grouped by the body section they feed into */
  fieldGroups: FieldGroupDef[];
}

const COMMON_CLOSING: BodySectionDef = {
  id: 'closing',
  label: 'Closing & Signature',
  description: 'Polite sign-off (Sincerely / Best regards) and your name.',
};

export const MAIL_TYPE_CONFIGS: MailTypeConfig[] = [
  {
    value: 'Leave Request',
    label: 'Leave Request',
    badge: 'Leave',
    subjectFormat: 'Leave Request for [Reason] – [Date Range]',
    structure: [
      { id: 'subject', label: 'Subject', description: 'Leave request with reason and dates.' },
      { id: 'greeting', label: 'Greeting', description: 'Dear [Recipient],' },
      { id: 'opening', label: 'Opening', description: 'State that you are formally requesting leave.' },
      { id: 'details', label: 'Leave Details', description: 'Duration, dates, and reason for absence.' },
      { id: 'arrangements', label: 'Work Arrangements', description: 'Your role and how tasks will be handled during leave.' },
      { id: 'request', label: 'Approval Request', description: 'Ask for approval and thank the recipient.' },
      COMMON_CLOSING,
    ],
    fieldGroups: [
      {
        sectionId: 'details',
        title: 'Leave Details',
        hint: 'Fills the core body — duration, dates, and reason.',
        fields: [
          { key: 'duration', label: 'Duration', placeholder: '3 days, 1 week…', type: 'text', required: true },
          { key: 'leave_date', label: 'Leave dates', placeholder: 'June 15–17, 2025', type: 'text' },
          { key: 'reason', label: 'Reason for leave', placeholder: 'Fever, family emergency…', type: 'text', required: true },
        ],
      },
      {
        sectionId: 'arrangements',
        title: 'Work Arrangements',
        hint: 'Context about your role and handover during absence.',
        fields: [
          { key: 'sender_role', label: 'Your role', placeholder: 'Student, Employee…', type: 'text' },
          { key: 'additional_context', label: 'Handover / additional context', placeholder: 'Work handover done, attendance consideration needed…', type: 'textarea', fullWidth: true },
        ],
      },
    ],
  },
  {
    value: 'Internship Application',
    label: 'Internship',
    badge: 'Internship',
    subjectFormat: 'Application for Internship – [Role]',
    structure: [
      { id: 'subject', label: 'Subject', description: 'Internship application with role and company.' },
      { id: 'greeting', label: 'Greeting', description: 'Dear Hiring Manager / [Recipient],' },
      { id: 'opening', label: 'Introduction', description: 'Brief intro and purpose of writing.' },
      { id: 'background', label: 'Background & Skills', description: 'Academic background and relevant skills.' },
      { id: 'motivation', label: 'Motivation', description: 'Why this internship and why you are a fit.' },
      { id: 'request', label: 'Closing Ask', description: 'Express interest in discussing further.' },
      COMMON_CLOSING,
    ],
    fieldGroups: [
      {
        sectionId: 'opening',
        title: 'Application Target',
        hint: 'Who you are applying to and for which role.',
        fields: [
          { key: 'company_name', label: 'Company / Organisation', placeholder: 'Google, XYZ Startup…', type: 'text', required: true },
          { key: 'role_applied', label: 'Role applied for', placeholder: 'Software Engineering Intern…', type: 'text', required: true },
        ],
      },
      {
        sectionId: 'background',
        title: 'Background & Skills',
        hint: 'Qualifications that go in the main body.',
        fields: [
          { key: 'academic_background', label: 'Academic background', placeholder: '3rd year B.Tech CSE, CGPA 8.5…', type: 'text', required: true },
          { key: 'skills', label: 'Skills & technologies', placeholder: 'React, Python, ML…', type: 'text' },
        ],
      },
      {
        sectionId: 'motivation',
        title: 'Motivation',
        hint: 'Why you want this internship.',
        fields: [
          { key: 'why_this_internship', label: 'Why this internship?', placeholder: 'Passionate about AI…', type: 'textarea', fullWidth: true },
          { key: 'additional_context', label: 'Availability / extra context', placeholder: 'Available from July, full-time…', type: 'textarea', fullWidth: true },
        ],
      },
    ],
  },
  {
    value: 'Scholarship Application',
    label: 'Scholarship',
    badge: 'Scholarship',
    subjectFormat: 'Application for [Scholarship Name]',
    structure: [
      { id: 'subject', label: 'Subject', description: 'Scholarship application with programme name.' },
      { id: 'greeting', label: 'Greeting', description: 'Dear Scholarship Committee / [Recipient],' },
      { id: 'opening', label: 'Introduction', description: 'State the scholarship you are applying for.' },
      { id: 'background', label: 'Academic Profile', description: 'Academic background and achievements.' },
      { id: 'motivation', label: 'Need & Merit', description: 'Why you deserve or need the scholarship.' },
      { id: 'request', label: 'Closing Ask', description: 'Thank the committee and express eagerness.' },
      COMMON_CLOSING,
    ],
    fieldGroups: [
      {
        sectionId: 'opening',
        title: 'Scholarship Details',
        hint: 'Identifies the scholarship and institution in the opening.',
        fields: [
          { key: 'scholarship_name', label: 'Scholarship name', placeholder: 'Merit Scholarship 2025…', type: 'text', required: true },
          { key: 'institution', label: 'Institution / University', placeholder: 'MIT, Delhi University…', type: 'text', required: true },
        ],
      },
      {
        sectionId: 'background',
        title: 'Academic Profile',
        hint: 'Credentials and achievements for the body.',
        fields: [
          { key: 'academic_background', label: 'Academic background', placeholder: '3rd year B.Tech, CGPA 9.2…', type: 'text', required: true },
          { key: 'achievements', label: 'Achievements & activities', placeholder: "Dean's list, research, clubs…", type: 'text' },
        ],
      },
      {
        sectionId: 'motivation',
        title: 'Need & Merit',
        hint: 'Persuasive paragraph on why you should receive it.',
        fields: [
          { key: 'why_scholarship', label: 'Why you need / deserve it', placeholder: 'Financial need, merit, goals…', type: 'textarea', required: true, fullWidth: true },
          { key: 'additional_context', label: 'Future plans / references', placeholder: 'Career goals, references…', type: 'textarea', fullWidth: true },
        ],
      },
    ],
  },
  {
    value: 'Complaint Letter',
    label: 'Complaint',
    badge: 'Complaint',
    subjectFormat: 'Complaint Regarding [Issue]',
    structure: [
      { id: 'subject', label: 'Subject', description: 'Clear complaint subject with the issue.' },
      { id: 'greeting', label: 'Greeting', description: 'Dear [Recipient],' },
      { id: 'opening', label: 'Opening Statement', description: 'Formally state you are raising a complaint.' },
      { id: 'incident', label: 'Issue Details', description: 'Describe the problem and when it occurred.' },
      { id: 'history', label: 'Prior Attempts', description: 'Steps already taken to resolve the issue.' },
      { id: 'impact', label: 'Impact', description: 'How the issue affected you.' },
      { id: 'request', label: 'Resolution Request', description: 'Ask for corrective action and a response.' },
      COMMON_CLOSING,
    ],
    fieldGroups: [
      {
        sectionId: 'opening',
        title: 'Sender Context',
        hint: 'Your role when introducing the complaint.',
        fields: [
          { key: 'sender_role', label: 'Your role', placeholder: 'Customer, Student…', type: 'text' },
        ],
      },
      {
        sectionId: 'incident',
        title: 'Issue Details',
        hint: 'Core of the complaint body.',
        fields: [
          { key: 'issue', label: 'Issue / problem', placeholder: 'Defective product, poor service…', type: 'text', required: true, fullWidth: true },
          { key: 'incident_date', label: 'Date of incident', placeholder: 'June 10, 2025', type: 'text' },
        ],
      },
      {
        sectionId: 'history',
        title: 'Prior Attempts & Impact',
        hint: 'Resolution history and consequences.',
        fields: [
          { key: 'previous_action', label: 'Previous resolution attempts', placeholder: 'Called support, raised ticket…', type: 'textarea', fullWidth: true },
          { key: 'additional_context', label: 'Impact / additional details', placeholder: 'Financial loss, missed deadlines…', type: 'textarea', fullWidth: true },
        ],
      },
    ],
  },
  {
    value: 'Apology Mail',
    label: 'Apology',
    badge: 'Apology',
    subjectFormat: 'Apology Regarding [Incident]',
    structure: [
      { id: 'subject', label: 'Subject', description: 'Apology with brief reference to the incident.' },
      { id: 'greeting', label: 'Greeting', description: 'Dear [Recipient],' },
      { id: 'acknowledgment', label: 'Acknowledgment', description: 'Clearly state what you are apologising for.' },
      { id: 'responsibility', label: 'Accountability', description: 'Take responsibility without making excuses.' },
      { id: 'corrective', label: 'Corrective Action', description: 'Steps being taken to fix the situation.' },
      { id: 'request', label: 'Closing', description: 'Express regret and appreciation for patience.' },
      COMMON_CLOSING,
    ],
    fieldGroups: [
      {
        sectionId: 'acknowledgment',
        title: 'Acknowledgment',
        hint: 'What the apology is about — first body paragraph.',
        fields: [
          { key: 'sender_role', label: 'Your role', placeholder: 'Student, Employee…', type: 'text' },
          { key: 'apology_for', label: 'What are you apologising for?', placeholder: 'Missing deadline, wrong doc…', type: 'text', required: true, fullWidth: true },
        ],
      },
      {
        sectionId: 'corrective',
        title: 'Corrective Action & Context',
        hint: 'How you are fixing it and any brief explanation.',
        fields: [
          { key: 'corrective_action', label: 'Corrective action being taken', placeholder: 'Submitting work immediately…', type: 'textarea', fullWidth: true },
          { key: 'additional_context', label: 'Additional context', placeholder: 'Brief explanation…', type: 'textarea', fullWidth: true },
        ],
      },
    ],
  },
  {
    value: 'Follow-up Mail',
    label: 'Follow-up',
    badge: 'Follow-up',
    subjectFormat: 'Follow-Up Regarding [Topic]',
    structure: [
      { id: 'subject', label: 'Subject', description: 'Follow-up with the original topic.' },
      { id: 'greeting', label: 'Greeting', description: 'Dear [Recipient],' },
      { id: 'reference', label: 'Reference', description: 'Mention the previous communication or meeting.' },
      { id: 'request', label: 'Follow-up Ask', description: 'Politely request an update or response.' },
      { id: 'context', label: 'Additional Context', description: 'Urgency, deadlines, or extra details.' },
      COMMON_CLOSING,
    ],
    fieldGroups: [
      {
        sectionId: 'reference',
        title: 'Previous Communication',
        hint: 'What you are following up on.',
        fields: [
          { key: 'previous_communication', label: 'Topic of previous communication', placeholder: 'Job application on June 5…', type: 'text', required: true, fullWidth: true },
        ],
      },
      {
        sectionId: 'request',
        title: 'Follow-up Ask',
        hint: 'The update or response you need.',
        fields: [
          { key: 'follow_up_ask', label: 'What update do you need?', placeholder: 'Status of application…', type: 'textarea', required: true, fullWidth: true },
          { key: 'additional_context', label: 'Urgency / additional context', placeholder: 'Deadline approaching…', type: 'textarea', fullWidth: true },
        ],
      },
    ],
  },
  {
    value: 'Offer Acceptance',
    label: 'Offer Accept',
    badge: 'Acceptance',
    subjectFormat: 'Acceptance of [Role/Offer]',
    structure: [
      { id: 'subject', label: 'Subject', description: 'Formal acceptance of the offer.' },
      { id: 'greeting', label: 'Greeting', description: 'Dear [Recipient],' },
      { id: 'acceptance', label: 'Acceptance Statement', description: 'Express gratitude and formally accept.' },
      { id: 'details', label: 'Role & Joining', description: 'Role/programme and confirmed joining date.' },
      { id: 'request', label: 'Enthusiasm', description: 'Express excitement and next steps.' },
      COMMON_CLOSING,
    ],
    fieldGroups: [
      {
        sectionId: 'acceptance',
        title: 'Offer Details',
        hint: 'What you are accepting.',
        fields: [
          { key: 'offer_role', label: 'Role / programme being accepted', placeholder: 'Software Engineer, MBA…', type: 'text', required: true },
          { key: 'joining_date', label: 'Confirmed joining date', placeholder: 'July 1, 2025', type: 'text' },
        ],
      },
      {
        sectionId: 'request',
        title: 'Additional Notes',
        hint: 'Enthusiasm and any extra details for the closing.',
        fields: [
          { key: 'additional_context', label: 'Additional context', placeholder: 'Excited to join…', type: 'textarea', fullWidth: true },
        ],
      },
    ],
  },
  {
    value: 'Resignation',
    label: 'Resignation',
    badge: 'Resignation',
    subjectFormat: 'Resignation – [Role] – [Last Working Date]',
    structure: [
      { id: 'subject', label: 'Subject', description: 'Resignation with role and last day.' },
      { id: 'greeting', label: 'Greeting', description: 'Dear [Recipient],' },
      { id: 'opening', label: 'Resignation Statement', description: 'Clear, formal notice of resignation.' },
      { id: 'details', label: 'Dates & Notice', description: 'Last working day and notice period.' },
      { id: 'reason', label: 'Reason (Optional)', description: 'Brief, professional reason if provided.' },
      { id: 'handover', label: 'Handover & Gratitude', description: 'Offer to assist with transition; thank employer.' },
      COMMON_CLOSING,
    ],
    fieldGroups: [
      {
        sectionId: 'opening',
        title: 'Position Details',
        hint: 'Employer and role for the resignation statement.',
        fields: [
          { key: 'employer_name', label: 'Company / Organisation', placeholder: 'Acme Corp, XYZ Ltd…', type: 'text', required: true },
          { key: 'current_role', label: 'Your current role', placeholder: 'Software Engineer, Analyst…', type: 'text', required: true },
        ],
      },
      {
        sectionId: 'details',
        title: 'Dates & Notice',
        hint: 'Timeline details in the body.',
        fields: [
          { key: 'last_working_date', label: 'Last working day', placeholder: 'July 15, 2025', type: 'text', required: true },
          { key: 'notice_period', label: 'Notice period', placeholder: '2 weeks, 30 days…', type: 'text' },
        ],
      },
      {
        sectionId: 'handover',
        title: 'Reason & Handover',
        hint: 'Optional reason and transition plan.',
        fields: [
          { key: 'reason_for_leaving', label: 'Reason for leaving', placeholder: 'Career growth, relocation…', type: 'textarea', fullWidth: true },
          { key: 'additional_context', label: 'Handover plan / gratitude', placeholder: 'Handover plan, gratitude…', type: 'textarea', fullWidth: true },
        ],
      },
    ],
  },
];

export const MAIL_TYPES = MAIL_TYPE_CONFIGS.map(({ value, label }) => ({ value, label }));

export const MAIL_TYPE_CONFIG_MAP = Object.fromEntries(
  MAIL_TYPE_CONFIGS.map((c) => [c.value, c]),
) as Record<string, MailTypeConfig>;

export function getBadgeLabel(type: string): string {
  return MAIL_TYPE_CONFIG_MAP[type]?.badge ?? 'General';
}

export function getFieldsForType(type: string): FieldDef[] {
  const config = MAIL_TYPE_CONFIG_MAP[type];
  if (!config) return [];
  return config.fieldGroups.flatMap((g) => g.fields);
}

export function getFieldGroupsForType(type: string): FieldGroupDef[] {
  return MAIL_TYPE_CONFIG_MAP[type]?.fieldGroups ?? [];
}
