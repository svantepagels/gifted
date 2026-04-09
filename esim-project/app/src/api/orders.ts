import type { Order, Plan, Destination } from '../types';
import { delay } from './client';
import { generateOrderId } from '../utils/format';

interface CreateOrderParams {
  plan: Plan;
  destination: Destination;
  email: string;
}

export async function createOrder(params: CreateOrderParams): Promise<Order> {
  await delay(1500);

  const order: Order = {
    id: generateOrderId(),
    plan: params.plan,
    destination: params.destination,
    email: params.email,
    status: 'completed',
    createdAt: new Date().toISOString(),
  };

  return order;
}
