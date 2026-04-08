import { ServiceType } from './types';

export const TRACES: Record<string, { ratio: number; label: string }> = {
  reboco: { ratio: 3, label: '1:3 (Cimento : Areia)' },
  contrapiso: { ratio: 4, label: '1:4 (Cimento : Areia)' },
  alvenaria: { ratio: 5, label: '1:5 (Cimento : Areia)' },
};

export const CEMENT_BAG_WEIGHT = 50; // kg
export const CEMENT_DENSITY = 1440; // kg/m3
export const ADMIN_EMAIL = 'patricioaug@gmail.com';
export const TRIAL_DAYS = 7;
