import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Order, OrderType, OrderStatus, OrderPriority } from '@/types/order';
import { orders as initialOrders } from '@/mocks/orders';

interface OrderState {
  orders: Order[];
  
  // Actions
  createOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateOrderNotes: (orderId: string, notes: string) => void;
  deleteOrder: (orderId: string) => void;
  getOrdersByStatus: (status: OrderStatus) => Order[];
  getOrdersByPriority: (priority: OrderPriority) => Order[];
  getOrderById: (id: string) => Order | undefined;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: initialOrders,

      createOrder: (orderData) => {
        const newOrder: Order = {
          ...orderData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set((state) => ({
          orders: [newOrder, ...state.orders],
        }));
      },

      updateOrderStatus: (orderId, status) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  status,
                  updatedAt: new Date().toISOString(),
                  completedAt: status === 'completed' ? new Date().toISOString() : order.completedAt,
                }
              : order
          ),
        }));
      },

      updateOrderNotes: (orderId, notes) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId
              ? { ...order, notes, updatedAt: new Date().toISOString() }
              : order
          ),
        }));
      },

      deleteOrder: (orderId) => {
        set((state) => ({
          orders: state.orders.filter((order) => order.id !== orderId),
        }));
      },

      getOrdersByStatus: (status) => {
        return get().orders.filter((order) => order.status === status);
      },

      getOrdersByPriority: (priority) => {
        return get().orders.filter((order) => order.priority === priority);
      },

      getOrderById: (id) => {
        return get().orders.find((order) => order.id === id);
      },
    }),
    {
      name: 'order-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);