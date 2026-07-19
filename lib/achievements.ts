// Real achievements only — every condition is computed live from actual
// player state (xp/level/solved cases). No mock unlock flags, no currencies
// that don't exist elsewhere in the app.

export interface AchievementState {
  level: number;
  caseHistoryCount: number;
  totalCases: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  isUnlocked: (s: AchievementState) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-blood",
    title: "First Blood",
    description: "Solve your first case.",
    isUnlocked: (s) => s.caseHistoryCount >= 1,
  },
  {
    id: "level-2",
    title: "Field Promotion",
    description: "Reach Level 2.",
    isUnlocked: (s) => s.level >= 2,
  },
  {
    id: "level-3",
    title: "Senior Investigator",
    description: "Reach Level 3.",
    isUnlocked: (s) => s.level >= 3,
  },
  {
    id: "case-closer",
    title: "Case Closer",
    description: "Solve every case file in the agency.",
    isUnlocked: (s) => s.caseHistoryCount >= s.totalCases,
  },
  {
    id: "master-detective",
    title: "Master Detective",
    description: "Reach Level 5.",
    isUnlocked: (s) => s.level >= 5,
  },
];
