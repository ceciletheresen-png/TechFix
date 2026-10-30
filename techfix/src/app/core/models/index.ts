export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type Platform = 'windows' | 'macos' | 'android' | 'ios' | 'any';

export const DIFFICULTIES: readonly Difficulty[] = ['beginner', 'intermediate', 'advanced'];
export const PLATFORMS: readonly Platform[] = ['windows', 'macos', 'android', 'ios', 'any'];

export const PLATFORM_LABELS: Record<Platform, string> = {
  windows: 'Windows',
  macos: 'macOS',
  android: 'Android',
  ios: 'iPhone / iOS',
  any: 'Any device',
};

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  /** Key into the icon map in shared/components/icon.component.ts */
  icon: string;
  /** Guides that support this platform are also listed in this category. */
  platform?: Platform;
}

export interface TroubleshootingStep {
  title: string;
  instruction: string;
  expected: string;
  warning?: string;
}

export interface TroubleshootingGuide {
  id: string;
  title: string;
  slug: string;
  description: string;
  categoryId: string;
  platforms: Platform[];
  symptoms: string[];
  causes: string[];
  difficulty: Difficulty;
  minutes: number;
  tools?: string[];
  prerequisites?: string[];
  steps: TroubleshootingStep[];
  warnings?: string[];
  recovery?: string[];
  alternatives?: string[];
  relatedIds: string[];
  lastReviewed: string;
  keywords: string[];
  popular?: boolean;
}

export interface DiagnosticOption {
  label: string;
  /** id of another node in the same flow */
  next: string;
}

export interface DiagnosticQuestion {
  type: 'question';
  id: string;
  text: string;
  help?: string;
  options: DiagnosticOption[];
}

export interface SolutionOutcome {
  type: 'outcome';
  id: string;
  title: string;
  summary: string;
  guideIds: string[];
  professionalHelp?: string;
}

export type DiagnosticNode = DiagnosticQuestion | SolutionOutcome;

export interface DiagnosticFlow {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  startId: string;
  nodes: DiagnosticNode[];
}

export interface Bookmark {
  guideId: string;
  savedAt: string;
}

export interface HistoryEntry {
  guideId: string;
  viewedAt: string;
}

export type LoadStatus = 'loading' | 'ready' | 'error';
