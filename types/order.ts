export type OrderType = 'regroup' | 'move' | 'clean' | 'repair' | 'regrip' | 'ship' | 'storage' | 'maintenance';
export type OrderStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type OrderPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Order {
  id: string;
  bagId: string;
  memberId: string;
  type: OrderType;
  status: OrderStatus;
  priority: OrderPriority;
  description: string;
  requestedBy: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  notes?: string;
  targetLocation?: string;
  estimatedCost?: number;
  dueDate?: string;
}