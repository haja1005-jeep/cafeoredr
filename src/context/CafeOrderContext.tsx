import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Order, MenuItem, OrderStatus, CafeStats } from '../types/cafe';
import { INITIAL_MENU_ITEMS } from '../data/defaultMenu';
import { INITIAL_SAMPLE_ORDERS } from '../data/sampleOrders';
import { soundEffects } from '../utils/sound';
import { voiceAnnouncer, VoiceStyle } from '../utils/voice';

export type CafeActiveTab = 'kds' | 'pos' | 'kiosk' | 'mobile' | 'pickup' | 'menu_manage' | 'analytics';

interface CreateOrderInput {
  orderType: 'HERE' | 'TOGO';
  channel?: 'KIOSK' | 'MOBILE' | 'POS';
  tableNumber?: string;
  customerPhone?: string;
  items: Order['items'];
  totalPrice: number;
  paymentMethod: 'CARD' | 'EASY_PAY' | 'CASH';
  customerNote?: string;
  vibratingBellNumber?: number;
}

interface CafeOrderContextType {
  orders: Order[];
  menuItems: MenuItem[];
  activeTab: CafeActiveTab;
  setActiveTab: (tab: CafeActiveTab) => void;
  splitView: boolean;
  setSplitView: React.Dispatch<React.SetStateAction<boolean>>;
  soundEnabled: boolean;
  toggleSound: () => void;
  voiceEnabled: boolean;
  toggleVoice: () => void;
  voiceStyle: VoiceStyle;
  setVoiceStyle: (style: VoiceStyle) => void;
  callVoiceOrder: (orderId: string) => void;
  testVoiceAnnouncement: () => void;
  isSimulationActive: boolean;
  toggleSimulation: () => void;
  isSimpleMode: boolean;
  toggleSimpleMode: () => void;
  addOneQuickOrder: () => void;
  stats: CafeStats;
  createOrder: (input: CreateOrderInput) => Order;
  updateOrderStatus: (orderId: string, nextStatus: OrderStatus) => void;
  cancelOrder: (orderId: string, reason?: string) => void;
  toggleItemSoldOut: (menuId: string) => void;
  updateMenuItemPrice: (menuId: string, newPrice: number) => void;
  updateMenuItem: (menuId: string, updates: Partial<MenuItem>) => void;
  addMenuItem: (newItem: Omit<MenuItem, 'id'>) => void;
  deleteMenuItem: (menuId: string) => void;
  setAllItemsInStock: () => void;
  resetSampleOrders: () => void;
  clearCompleted: () => void;
  lastUpdatedOrderId: string | null;
}

const CafeOrderContext = createContext<CafeOrderContextType | null>(null);

const STORAGE_ORDERS_KEY = 'cafe_orders_storage_v1';
const STORAGE_MENU_KEY = 'cafe_menu_storage_v1';
const STORAGE_SOUND_KEY = 'cafe_sound_storage_v1';
const BROADCAST_CHANNEL_NAME = 'cafe_order_realtime_sync';

export const CafeOrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State for Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ORDERS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_SAMPLE_ORDERS;
  });

  // State for Menu
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_MENU_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((p: MenuItem) => {
            const def = INITIAL_MENU_ITEMS.find((d) => d.id === p.id);
            if (def && !p.imageUrl && !p.videoUrl) {
              return {
                ...p,
                mediaType: def.mediaType,
                imageUrl: def.imageUrl,
                videoUrl: def.videoUrl,
              };
            }
            return p;
          });
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_MENU_ITEMS;
  });

  const [activeTab, setActiveTab] = useState<CafeActiveTab>('kds');
  const [splitView, setSplitView] = useState<boolean>(false);
  const [isSimpleMode, setIsSimpleMode] = useState<boolean>(true); // 기본을 직관적이고 쉬운 간편 모드로 설정
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SOUND_KEY);
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });
  const [isSimulationActive, setIsSimulationActive] = useState<boolean>(false);
  const [lastUpdatedOrderId, setLastUpdatedOrderId] = useState<string | null>(null);

  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(() => voiceAnnouncer.getEnabled());
  const [voiceStyle, setVoiceStyleState] = useState<VoiceStyle>(() => voiceAnnouncer.getVoiceStyle());

  const toggleVoice = useCallback(() => {
    setVoiceEnabled((prev) => {
      const next = !prev;
      voiceAnnouncer.setEnabled(next);
      return next;
    });
  }, []);

  const setVoiceStyle = useCallback((style: VoiceStyle) => {
    setVoiceStyleState(style);
    voiceAnnouncer.setVoiceStyle(style);
  }, []);

  const testVoiceAnnouncement = useCallback(() => {
    voiceAnnouncer.testSampleAnnouncement(101);
  }, []);

  // Broadcast Channel reference for multi-tab real-time sync
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    soundEffects.setMuted(!soundEnabled);
    voiceAnnouncer.setEnabled(voiceEnabled && soundEnabled);
    try {
      localStorage.setItem(STORAGE_SOUND_KEY, String(soundEnabled));
    } catch {
      // ignore
    }
  }, [soundEnabled, voiceEnabled]);

  // Save orders to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
    } catch {
      // ignore
    }
  }, [orders]);

  // Save menu to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_MENU_KEY, JSON.stringify(menuItems));
    } catch {
      // ignore
    }
  }, [menuItems]);

  // Broadcast Channel setup for multi-window / multi-device synchronization
  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      channelRef.current = channel;

      channel.onmessage = (event) => {
        const { type, payload } = event.data;
        if (type === 'ORDERS_SYNC') {
          setOrders(payload.orders);
          if (payload.action === 'NEW_ORDER') {
            soundEffects.playNewOrder();
          } else if (payload.action === 'ORDER_READY') {
            const readyOrder =
              payload.orders.find((o: Order) => o.id === payload.orderId) ||
              payload.orders.find((o: Order) => o.status === 'READY');
            if (readyOrder) {
              voiceAnnouncer.announceOrderReady(readyOrder);
            } else {
              soundEffects.playOrderReady();
            }
          }
        } else if (type === 'MENU_SYNC') {
          setMenuItems(payload.menuItems);
        }
      };

      return () => {
        channel.close();
      };
    }
  }, []);

  const broadcastOrders = useCallback((updatedOrders: Order[], action?: string) => {
    if (channelRef.current) {
      try {
        channelRef.current.postMessage({
          type: 'ORDERS_SYNC',
          payload: { orders: updatedOrders, action },
        });
      } catch {
        // ignore
      }
    }
  }, []);

  const broadcastMenu = useCallback((updatedMenu: MenuItem[]) => {
    if (channelRef.current) {
      try {
        channelRef.current.postMessage({
          type: 'MENU_SYNC',
          payload: { menuItems: updatedMenu },
        });
      } catch {
        // ignore
      }
    }
  }, []);

  // Create Order
  const createOrder = useCallback((input: CreateOrderInput): Order => {
    const nextOrderNum = (orders.reduce((max, o) => Math.max(max, o.orderNumber), 100) || 100) + 1;
    const nextBellNum = input.vibratingBellNumber || ((nextOrderNum % 20) + 1);

    const newOrder: Order = {
      id: `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      orderNumber: nextOrderNum,
      vibratingBellNumber: nextBellNum,
      createdAt: Date.now(),
      orderType: input.orderType,
      channel: input.channel || 'KIOSK',
      tableNumber: input.tableNumber,
      customerPhone: input.customerPhone,
      items: input.items,
      totalPrice: input.totalPrice,
      paymentMethod: input.paymentMethod,
      customerNote: input.customerNote,
      status: 'PENDING',
    };

    setOrders((prev) => {
      const updated = [newOrder, ...prev];
      broadcastOrders(updated, 'NEW_ORDER');
      return updated;
    });

    setLastUpdatedOrderId(newOrder.id);
    soundEffects.playNewOrder();
    return newOrder;
  }, [orders, broadcastOrders]);

  // Update Order Status
  const updateOrderStatus = useCallback((orderId: string, nextStatus: OrderStatus) => {
    const now = Date.now();
    let actionType: string | undefined;

    if (nextStatus === 'READY') {
      actionType = 'ORDER_READY';
      const existing = orders.find((o) => o.id === orderId);
      if (existing) {
        voiceAnnouncer.announceOrderReady({ ...existing, status: 'READY' });
      } else {
        soundEffects.playOrderReady();
      }
    } else {
      soundEffects.playClick();
    }

    setOrders((prev) => {
      const updated = prev.map((order) => {
        if (order.id !== orderId) return order;

        const updatedOrder: Order = { ...order, status: nextStatus };
        if (nextStatus === 'COOKING' && !order.cookingStartedAt) {
          updatedOrder.cookingStartedAt = now;
        } else if (nextStatus === 'READY' && !order.readyAt) {
          updatedOrder.readyAt = now;
        } else if (nextStatus === 'COMPLETED' && !order.completedAt) {
          updatedOrder.completedAt = now;
        }
        return updatedOrder;
      });

      broadcastOrders(updated, actionType);
      return updated;
    });

    setLastUpdatedOrderId(orderId);
  }, [orders, broadcastOrders]);

  // Explicit re-call with voice
  const callVoiceOrder = useCallback((orderId: string) => {
    const target = orders.find((o) => o.id === orderId);
    if (target) {
      voiceAnnouncer.announceOrderReady(target);
    }
  }, [orders]);

  // Cancel Order
  const cancelOrder = useCallback((orderId: string, reason?: string) => {
    soundEffects.playCancel();
    setOrders((prev) => {
      const updated = prev.map((order) => {
        if (order.id !== orderId) return order;
        return {
          ...order,
          status: 'CANCELLED' as OrderStatus,
          cancelledAt: Date.now(),
          cancelReason: reason || '고객 요청 취소',
        };
      });
      broadcastOrders(updated, 'ORDER_CANCELLED');
      return updated;
    });
  }, [broadcastOrders]);

  // Toggle Item Sold Out
  const toggleItemSoldOut = useCallback((menuId: string) => {
    soundEffects.playClick();
    setMenuItems((prev) => {
      const updated = prev.map((item) =>
        item.id === menuId ? { ...item, isSoldOut: !item.isSoldOut } : item
      );
      broadcastMenu(updated);
      return updated;
    });
  }, [broadcastMenu]);

  // Update Menu Item Price
  const updateMenuItemPrice = useCallback((menuId: string, newPrice: number) => {
    soundEffects.playClick();
    setMenuItems((prev) => {
      const updated = prev.map((item) =>
        item.id === menuId ? { ...item, price: Math.max(0, newPrice) } : item
      );
      broadcastMenu(updated);
      return updated;
    });
  }, [broadcastMenu]);

  // Update Menu Item general fields
  const updateMenuItem = useCallback((menuId: string, updates: Partial<MenuItem>) => {
    soundEffects.playClick();
    setMenuItems((prev) => {
      const updated = prev.map((item) =>
        item.id === menuId ? { ...item, ...updates } : item
      );
      broadcastMenu(updated);
      return updated;
    });
  }, [broadcastMenu]);

  // Add new Menu Item
  const addMenuItem = useCallback((newItem: Omit<MenuItem, 'id'>) => {
    soundEffects.playClick();
    const created: MenuItem = {
      ...newItem,
      id: `menu-custom-${Date.now()}`,
    };
    setMenuItems((prev) => {
      const updated = [created, ...prev];
      broadcastMenu(updated);
      return updated;
    });
  }, [broadcastMenu]);

  // Delete Menu Item
  const deleteMenuItem = useCallback((menuId: string) => {
    soundEffects.playCancel();
    setMenuItems((prev) => {
      const updated = prev.filter((item) => item.id !== menuId);
      broadcastMenu(updated);
      return updated;
    });
  }, [broadcastMenu]);

  // Set all items in stock
  const setAllItemsInStock = useCallback(() => {
    soundEffects.playClick();
    setMenuItems((prev) => {
      const updated = prev.map((item) => ({ ...item, isSoldOut: false }));
      broadcastMenu(updated);
      return updated;
    });
  }, [broadcastMenu]);

  // Sound toggle
  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => !prev);
  }, []);

  // Clear completed orders
  const clearCompleted = useCallback(() => {
    soundEffects.playClick();
    setOrders((prev) => {
      const updated = prev.filter((o) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED');
      broadcastOrders(updated);
      return updated;
    });
  }, [broadcastOrders]);

  // Reset sample orders
  const resetSampleOrders = useCallback(() => {
    soundEffects.playClick();
    setOrders(INITIAL_SAMPLE_ORDERS);
    setMenuItems(INITIAL_MENU_ITEMS);
    broadcastOrders(INITIAL_SAMPLE_ORDERS);
    broadcastMenu(INITIAL_MENU_ITEMS);
  }, [broadcastOrders, broadcastMenu]);

  // Simulation: Generate random orders periodically when activated
  useEffect(() => {
    if (!isSimulationActive) return;

    const availableItems = menuItems.filter((m) => !m.isSoldOut);
    if (availableItems.length === 0) return;

    const interval = setInterval(() => {
      // Pick 1-3 random items
      const count = Math.random() > 0.6 ? 2 : 1;
      const orderItems: Order['items'] = [];
      let total = 0;

      for (let i = 0; i < count; i++) {
        const item = availableItems[Math.floor(Math.random() * availableItems.length)];
        const temp = item.temperatures[Math.floor(Math.random() * item.temperatures.length)] || 'ICE';
        const isLarge = item.supportsSize && Math.random() > 0.6;
        const addShot = item.category === 'coffee' && Math.random() > 0.7 ? 1 : 0;
        const unitPrice = item.price + (isLarge ? 700 : 0) + (addShot * 500);

        orderItems.push({
          cartItemId: `sim-${Date.now()}-${i}`,
          menuId: item.id,
          menuName: item.name,
          price: unitPrice,
          basePrice: item.price,
          quantity: 1,
          temperature: temp,
          size: isLarge ? 'Large' : 'Regular',
          options: {
            shot: addShot,
            iceAmount: temp === 'ICE' ? '얼음 보통' : undefined,
          },
          itemTotal: unitPrice,
        });
        total += unitPrice;
      }

      const orderTypes: ('HERE' | 'TOGO')[] = ['HERE', 'TOGO'];
      const orderType = orderTypes[Math.floor(Math.random() * orderTypes.length)];
      const notes = [
        undefined,
        undefined,
        '얼음 가득 채워주세요',
        '포장 꼼꼼히 부탁드립니다',
        '빨대 2개 챙겨주세요',
      ];
      const customerNote = notes[Math.floor(Math.random() * notes.length)];

      createOrder({
        orderType,
        items: orderItems,
        totalPrice: total,
        paymentMethod: Math.random() > 0.3 ? 'CARD' : 'EASY_PAY',
        customerNote,
      });
    }, 9000); // every 9 seconds

    return () => clearInterval(interval);
  }, [isSimulationActive, menuItems, createOrder]);

  const toggleSimulation = useCallback(() => {
    soundEffects.playClick();
    setIsSimulationActive((prev) => !prev);
  }, []);

  // Compute live statistics
  const stats: CafeStats = useMemo(() => {
    const validOrders = orders.filter((o) => o.status !== 'CANCELLED');
    const totalRevenue = validOrders.reduce((sum, o) => sum + o.totalPrice, 0);
    const totalOrdersCount = orders.length;
    const completedCount = orders.filter((o) => o.status === 'COMPLETED').length;
    const pendingCount = orders.filter((o) => o.status === 'PENDING').length;
    const cookingCount = orders.filter((o) => o.status === 'COOKING').length;
    const readyCount = orders.filter((o) => o.status === 'READY').length;
    const cancelledCount = orders.filter((o) => o.status === 'CANCELLED').length;

    // Average prep time from cookingStartedAt to readyAt
    const ordersWithPrep = orders.filter((o) => o.cookingStartedAt && o.readyAt);
    let avgPrepTimeMin = 3.5;
    if (ordersWithPrep.length > 0) {
      const totalPrepMs = ordersWithPrep.reduce((sum, o) => sum + ((o.readyAt || 0) - (o.cookingStartedAt || 0)), 0);
      avgPrepTimeMin = Math.round((totalPrepMs / ordersWithPrep.length / 1000 / 60) * 10) / 10;
      if (avgPrepTimeMin <= 0) avgPrepTimeMin = 2.8;
    }

    const hereCount = validOrders.filter((o) => o.orderType === 'HERE').length;
    const togoCount = validOrders.filter((o) => o.orderType === 'TOGO').length;
    const hereRatio = validOrders.length > 0 ? Math.round((hereCount / validOrders.length) * 100) : 50;
    const togoRatio = 100 - hereRatio;

    return {
      totalRevenue,
      totalOrdersCount,
      completedCount,
      pendingCount,
      cookingCount,
      readyCount,
      cancelledCount,
      avgPrepTimeMin,
      hereRatio,
      togoRatio,
    };
  }, [orders]);

  const toggleSimpleMode = useCallback(() => {
    soundEffects.playClick();
    setIsSimpleMode((prev) => !prev);
  }, []);

  const addOneQuickOrder = useCallback(() => {
    soundEffects.playClick();
    const americano = menuItems.find((m) => m.name.includes('아메리카노')) || menuItems[0];
    const orderTypes: ('HERE' | 'TOGO')[] = ['HERE', 'TOGO'];
    const chosenType = orderTypes[Math.floor(Math.random() * 2)];

    createOrder({
      orderType: chosenType,
      items: [
        {
          cartItemId: `quick-${Date.now()}`,
          menuId: americano.id,
          menuName: americano.name,
          price: americano.price,
          basePrice: americano.price,
          quantity: 1,
          temperature: 'ICE',
          size: 'Regular',
          options: { shot: 0, iceAmount: '얼음 보통' },
          itemTotal: americano.price,
        },
      ],
      totalPrice: americano.price,
      paymentMethod: 'CARD',
      customerNote: '얼음 시원하게 가득이요!',
    });
  }, [menuItems, createOrder]);

  const value = {
    orders,
    menuItems,
    activeTab,
    setActiveTab,
    splitView,
    setSplitView,
    soundEnabled,
    toggleSound,
    voiceEnabled,
    toggleVoice,
    voiceStyle,
    setVoiceStyle,
    callVoiceOrder,
    testVoiceAnnouncement,
    isSimulationActive,
    toggleSimulation,
    isSimpleMode,
    toggleSimpleMode,
    addOneQuickOrder,
    stats,
    createOrder,
    updateOrderStatus,
    cancelOrder,
    toggleItemSoldOut,
    updateMenuItemPrice,
    updateMenuItem,
    addMenuItem,
    deleteMenuItem,
    setAllItemsInStock,
    resetSampleOrders,
    clearCompleted,
    lastUpdatedOrderId,
  };

  return <CafeOrderContext.Provider value={value}>{children}</CafeOrderContext.Provider>;
};

export const useCafeOrder = (): CafeOrderContextType => {
  const context = useContext(CafeOrderContext);
  if (!context) {
    throw new Error('useCafeOrder must be used within a CafeOrderProvider');
  }
  return context;
};
