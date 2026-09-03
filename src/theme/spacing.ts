export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
};

export type ShadowLevel = 'none' | 'sm' | 'md' | 'lg';

export function shadow(level: ShadowLevel, color = '#1B1B22') {
  if (level === 'none') return {};
  const map = {
    sm: { elevation: 2, offset: 2, radius: 6, opacity: 0.06 },
    md: { elevation: 6, offset: 4, radius: 12, opacity: 0.1 },
    lg: { elevation: 12, offset: 8, radius: 24, opacity: 0.16 },
  } as const;
  const cfg = map[level];
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: cfg.offset },
    shadowOpacity: cfg.opacity,
    shadowRadius: cfg.radius,
    elevation: cfg.elevation,
  };
}
