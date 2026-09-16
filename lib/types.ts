export type StoryStage = "foundations" | "stress_test" | "verification" | "complete";

export type ViabilityVerdict = "GO" | "PIVOT" | "ABANDON";

export interface AuditedState {
  genre: string;
  premise: string;
  character: string;
  setting: string;
  theme: string;
  scope: string;
}

export interface TurnOption {
  id: string;
  label: string;
  text: string;
}

export interface DiagnosticQuestion {
  id: string;
  question: string;
  explanation?: string;
  options: TurnOption[];
}

export interface TurnResponse {
  turn: number;
  stage: StoryStage;
  assessment?: string; // 2-sentence initial sweep in Turn 1
  analysis: string; // Flowing structural stress-test / commentary
  primary_risk_flag?: string; // Turn 2 danger area
  what_im_reading?: string; // Turn 3 summary
  what_i_need?: string; // Turn 3 remaining gaps
  proposed_scope?: string; // Turn 3 scope & rationale
  comp_titles?: string; // Turn 3 comp titles "X meets Y"
  target_reader?: string; // Turn 3 reader demographic
  whats_fresh?: string; // Turn 3 unique angle
  questions: DiagnosticQuestion[];
  state_audit?: Partial<AuditedState>;
  is_final_turn?: boolean;
}

export interface ScorecardMetrics {
  emotional_promise: number;
  central_conflict: number;
  character_agency: number;
  distinctiveness: number;
}

export interface ViabilityReport {
  working_title: string;
  one_line_hook: string;
  logline_summary: string;
  comp_titles: string;
  genre_subgenre: string;
  target_audience: string;
  verdict: ViabilityVerdict;
  verdict_subtitle: string;
  viability_score: number; // 0-100
  overall_score_label: "High" | "Medium" | "Low";
  recommended_scope: string;
  verdict_statement: string;
  target_demographic: string;
  tropes_analysis: {
    core_tropes: string[];
    market_saturation: "Low" | "Medium" | "High";
    unique_gap: string;
  };
  commercial_potential: "High" | "Medium" | "Low";
  writer_resonance: string;
  narrative_engine: {
    hook_strength: string;
    conflict_density: string;
    stakes_integrity: string;
    protagonist_flaw: string;
    setting_feasibility: string;
    engine_capacity: string;
  };
  scorecard: ScorecardMetrics;
  primary_fatal_flaw: string;
  critical_gaps: string[];
  visual_tone_anchor: string;
  strategic_action_items: {
    required_before_bible: string[];
    important_during_development: string[];
    optional_enhancements: string[];
  };
  report_markdown: string;
  story_bible_payload: string;
}

export interface SessionMessage {
  id: string;
  role: "user" | "model";
  turn: number;
  content: string;
  timestamp: string;
  structured_data?: TurnResponse | ViabilityReport;
}

export interface StorySession {
  id: string;
  createdAt: string;
  updatedAt: string;
  turnCount: number;
  stage: StoryStage;
  initialSeed: string;
  auditedState: AuditedState;
  messages: SessionMessage[];
  report?: ViabilityReport;
}
