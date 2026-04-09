import type { Plan, Destination } from './destination';

export interface Order {
  id: string;
  plan: Plan;
  destination: Destination;
  email: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}
