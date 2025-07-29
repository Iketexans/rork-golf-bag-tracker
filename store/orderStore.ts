import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Order, OrderType, OrderStatus, OrderPriority } from '@/types/order';
import { orders as initialOrders } from '@/mocks/orders';

interface OrderState {
  orders: Record<string, Order[]>; // userId -> orders
  currentUserId: string | null;
  
  // Actions
  setCurrentUser: (userId: string) => void;
  createOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateOrderNotes: (orderId: string, notes: string) => void;
  deleteOrder: (orderId: string) => void;
  getOrdersByStatus: (status: OrderStatus) => Order[];
  getOrdersByPriority: (priority: OrderPriority) => Order[];
  getOrderById: (id: string) => Order | undefined;
  getCurrentUserOrders: () => Order[];
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: {},
      currentUserId: null,

      setCurrentUser: (userId) => {
        set({ currentUserId: userId });
        // Initialize data for new user if not exists
        const { orders } = get();
        if (!orders[userId]) {
          set({
            orders: { ...orders, [userId]: userId === 'owner' ? initialOrders : [] },
          });
        }
      },

      getCurrentUserOrders: () => {
        const { orders, currentUserId } = get();
        return currentUserId ? (orders[currentUserId] || []) : [];
      },

      createOrder: (orderData) => {
        const { orders, currentUserId } = get();
        if (!currentUserId) return;
        
        const newOrder: Order = {
          ...orderData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        const userOrders = orders[currentUserId] || [];
        set({
          orders: {
            ...orders,
            [currentUserId]: [newOrder, ...userOrders],
          },
        });
      },

      updateOrderStatus: (orderId, status) => {
        const { orders, currentUserId } = get();
        if (!currentUserId) return;
        
        const userOrders = orders[currentUserId] || [];
        set({
          orders: {
            ...orders,
            [currentUserId]: userOrders.map((order) =>
              order.id === orderId
                ? {
                    ...order,
                    status,
                    updatedAt: new Date().toISOString(),
                    completedAt: status === 'completed' ? new Date().toISOString() : order.completedAt,
                  }
                : order
            ),
          },
        });
      },

      updateOrderNotes: (orderId, notes) => {
        const { orders, currentUserId } = get();
        if (!currentUserId) return;
        
        const userOrders = orders[currentUserId] || [];
        set({
          orders: {
            ...orders,
            [currentUserId]: userOrders.map((order) =>
              order.id === orderId
                ? { ...order, notes, updatedAt: new Date().toISOString() }
                : order
            ),
          },
        });
      },

      deleteOrder: (orderId) => {
        const { orders, currentUserId } = get();
        if (!currentUserId) return;
        
        const userOrders = orders[currentUserId] || [];
        set({
          orders: {
            ...orders,
            [currentUserId]: userOrders.filter((order) => order.id !== orderId),
          },
        });
      },

      getOrdersByStatus: (status) => {
        const { getCurrentUserOrders } = get();
        return getCurrentUserOrders().filter((order) => order.status === status);
      },

      getOrdersByPriority: (priority) => {
        const { getCurrentUserOrders } = get();
        return getCurrentUserOrders().filter((order) => order.priority === priority);
      },

      getOrderById: (id) => {
        const { getCurrentUserOrders } = get();
        return getCurrentUserOrders().find((order) => order.id === id);
      },
    }),
    {
      name: 'order-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);