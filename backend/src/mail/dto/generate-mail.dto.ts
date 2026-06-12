import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GenerateMailDto {
  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsString()
  tone: string;

  // Legacy generic description (optional – kept for backward compat)
  @IsOptional()
  @IsString()
  description?: string;

  // ── Shared contextual fields ─────────────────────────────────────────────
  @IsOptional()
  @IsString()
  recipient?: string; // e.g. "Professor", "Hiring Manager", "HR Department"

  @IsOptional()
  @IsString()
  sender_role?: string; // e.g. "Student", "Intern", "Employee"

  @IsOptional()
  @IsString()
  additional_context?: string;

  @IsOptional()
  @IsString()
  word_limit?: string; // e.g. "100", "200", "350" or any custom number

  // ── Leave Request ────────────────────────────────────────────────────────
  @IsOptional()
  @IsString()
  reason?: string; // e.g. "Fever", "Family emergency"

  @IsOptional()
  @IsString()
  duration?: string; // e.g. "3 days", "1 week"

  @IsOptional()
  @IsString()
  leave_date?: string; // e.g. "June 15–17"

  // ── Internship Application ───────────────────────────────────────────────
  @IsOptional()
  @IsString()
  company_name?: string;

  @IsOptional()
  @IsString()
  role_applied?: string;

  @IsOptional()
  @IsString()
  academic_background?: string;

  @IsOptional()
  @IsString()
  skills?: string;

  @IsOptional()
  @IsString()
  why_this_internship?: string;

  // ── Complaint Letter ─────────────────────────────────────────────────────
  @IsOptional()
  @IsString()
  issue?: string;

  @IsOptional()
  @IsString()
  incident_date?: string;

  @IsOptional()
  @IsString()
  previous_action?: string; // Previous attempts to resolve

  // ── Apology Mail ─────────────────────────────────────────────────────────
  @IsOptional()
  @IsString()
  apology_for?: string; // What are you apologizing for?

  @IsOptional()
  @IsString()
  corrective_action?: string; // What steps are being taken?

  // ── Follow-up Mail ────────────────────────────────────────────────────────
  @IsOptional()
  @IsString()
  previous_communication?: string; // Topic of previous email/meeting

  @IsOptional()
  @IsString()
  follow_up_ask?: string; // What update/response do you need?

  // ── Offer Acceptance ─────────────────────────────────────────────────────
  @IsOptional()
  @IsString()
  offer_role?: string; // Role/programme being accepted

  @IsOptional()
  @IsString()
  joining_date?: string; // Confirmed joining date if known
}
