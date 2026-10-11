export type OrderStatus = 'PENDING' | 'COOKING' | 'READY' | 'COMPLETED' | 'CANCELLED';

export type MenuCategory = 'all' | 'coffee' | 'signature' | 'tea_beverage' | 'bakery' | 'dessert';

export interface MenuItem {
  id: string;
  name: string;
  nameEn: string;
  category: 'coffee' | 'signature' | 'tea_beverage' | 'bakery' | 'dessert';
  price: number;
  description: string;
  temperatures: ('HOT' | 'ICE')[];
  defaultTemp: 'HOT' | 'ICE';
  supportsSize: boolean;
  isSoldOut: boolean;
  badge?: 'BEST' | 'SIGNATURE' | 'NEW' | 'SEASON';
  prepTimeMin: number;
  iconType: 'espresso' | 'latte' | 'coldbrew' | 'tea' | 'ade' | 'bakery' | 'cake';
  mediaType?: 'image' | 'video' | 'icon';
  imageUrl?: string;
  videoUrl?: string;
}

export interface OrderItemOption {
  shot: number; // 샷 추가 (+500원)
  syrup?: '기본' | '바닐라시럽 (+500)' | '헤이즐넛시럽 (+500)' | '카라멜시럽 (+500)';
  milkType?: '일반우유' | '저지방우유' | '오트(귀리)밀크 (+700)' | '두유 (+500)';
  iceAmount?: '얼음 보통' | '얼음 적게' | '얼음 많이';
  sweetness?: '기본(100%)' | '덜 달게(50%)' | '시럽 없이(0%)';
  togoBag?: boolean;
}

export interface OrderItem {
  cartItemId: string;
  menuId: string;
  menuName: string;
  price: number; // 단가 (옵션 포함)
  basePrice: number;
  quantity: number;
  temperature: 'HOT' | 'ICE';
  size: 'Regular' | 'Large';
  options: OrderItemOption;
  itemTotal: number;
}

export interface Order {
  id: string;
  orderNumber: number; // 101, 102...
  vibratingBellNumber: number;
  createdAt: number; // timestamp
  orderType: 'HERE' | 'TOGO'; // 매장 or 포장
  channel?: 'KIOSK' | 'MOBILE' | 'POS'; // 주문 접수 채널
  tableNumber?: string; // 모바일 테이블 QR 주문 시 테이블 번호
  customerPhone?: string; // 모바일 픽업 알림용 연락처 뒷자리
  items: OrderItem[];
  totalPrice: number;
  paymentMethod: 'CARD' | 'EASY_PAY' | 'CASH';
  status: OrderStatus;
  customerNote?: string;
  cookingStartedAt?: number;
  readyAt?: number;
  completedAt?: number;
  cancelledAt?: number;
  cancelReason?: string;
}

export interface CafeStats {
  totalRevenue: number;
  totalOrdersCount: number;
  completedCount: number;
  pendingCount: number;
  cookingCount: number;
  readyCount: number;
  cancelledCount: number;
  avgPrepTimeMin: number;
  hereRatio: number; // 매장 비율 %
  togoRatio: number; // 포장 비율 %
}
