import { useAvatar } from "@/contexts/AvatarContext";

export interface PlanLimits {
  maxTasks: number;
  maxGoals: number;
  maxHabits: number;
  canAccessInsights: boolean;
  canAccessHistory: boolean;
  isFounder: boolean;
  isFree: boolean;
  planLabel: string;
}

const FREE_LIMITS: PlanLimits = {
  maxTasks: 5,
  maxGoals: 1,
  maxHabits: 3,
  canAccessInsights: false,
  canAccessHistory: false,
  isFounder: false,
  isFree: true,
  planLabel: "Gratuito",
};

const FOUNDER_LIMITS: PlanLimits = {
  maxTasks: Infinity,
  maxGoals: Infinity,
  maxHabits: Infinity,
  canAccessInsights: true,
  canAccessHistory: true,
  isFounder: true,
  isFree: false,
  planLabel: "Fundador",
};

export const usePlanLimits = (): PlanLimits => {
  const { plano } = useAvatar();
  return plano === "fundador" ? FOUNDER_LIMITS : FREE_LIMITS;
};

export const canCreate = (currentCount: number, max: number): boolean =>
  currentCount < max;
