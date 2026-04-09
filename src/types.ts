export type ServiceType = 'reboco' | 'contrapiso' | 'alvenaria';

export interface CalcInputs {
  service: ServiceType;
  width: number;
  heightOrLength: number;
  thickness: number;
  waste: number; // percentage (e.g., 10)
  useCustomRatio?: boolean;
  customRatio?: number;
  // Cost fields
  cementPrice?: number;
  sandPrice?: number;
}

export interface CalcResults {
  area: number;
  thicknessM: number;
  volumeTotal: number;
  volumeWithWaste: number;
  trace: string;
  sandM3: number;
  cementBags: number;
  // Cost results
  totalCost?: number;
  memory: string;
}

export interface Project {
  id?: string;
  uid: string;
  name: string;
  inputs: CalcInputs;
  results: CalcResults;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'user';
  status: 'trial' | 'liberado' | 'bloqueado';
  createdAt: any;
  trialEndsAt: any;
}

export interface LoginLog {
  uid: string;
  email: string;
  displayName: string;
  timestamp: string;
}
