import React, { useState, useEffect } from 'react';
import { useCafeOrder } from '../context/CafeOrderContext';
import { MenuItem, OrderItem, OrderItemOption, MenuCategory, Order } from '../types/cafe';
import { MenuMediaDisplay } from './MenuMediaDisplay';
import { ReceiptModal } from './ReceiptModal';
import {
  Smartphone,
  ShoppingBag,
  Coffee,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  BellRing,
  RotateCcw,
  X,
  MapPin,
  ChevronRight,
  FileText,
  ClipboardList,
  RotateCw,
  Check,
  AlertCircle,
} from 'lucide-react';

const STORAGE_MY_ORDERS_KEY = 'atelier_my_mobile_orders_ids';

export const MobileOrderView: React.FC = () => {
  const { menuItems, createOrder, orders } = useCafeOrder();

  const [deviceFrameMode, setDeviceFrameMode] = useState(true); // 스마트폰 외곽 프레임 모드
  const [mobileTab, setMobileTab] = useState<'menu' | 'history'>('menu'); // 상단 메인 탭: 메뉴 주문 vs 내 주문 내역
  const [orderType, setOrderType] = useState<'HERE' | 'TOGO'>('HERE');
  const [tableNumber, setTableNumber] = useState('');
  const [customerPhone, setCustomerPhone] = useState('7890');
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>('all');
  const [mobileCart, setMobileCart] = useState<OrderItem[]>([]);
  const [activeModalItem, setActiveModalItem] = useState<MenuItem | null>(null);

  // Modal customizer state (40-70대 시니어 맞춤)
  const [selectedTemp, setSelectedTemp] = useState<'HOT' | 'ICE'>('ICE');
  const [selectedSize, setSelectedSize] = useState<'Regular' | 'Large'>('Regular');
  const [shotCount, setShotCount] = useState<number>(0);
  const [itemQuantity, setItemQuantity] = useState<number>(1);

  // Checkout modal
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentVendor, setPaymentVendor] = useState<'kakaopay' | 'tosspay' | 'naverpay' | 'applepay' | 'card'>('kakaopay');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Active tracking order & receipt modal
  const [activeMobileOrder, setActiveMobileOrder] = useState<Order | null>(null);
  const [receiptModalOrder, setReceiptModalOrder] = useState<Order | null>(null);

  // Stored list of my mobile order IDs
  const [myOrderIds, setMyOrderIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_MY_ORDERS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Track active order in real-time if placed
  useEffect(() => {
    if (activeMobileOrder) {
      const live = orders.find((o) => o.id === activeMobileOrder.id);
      if (live) {
        setActiveMobileOrder(live);
      }
    }
  }, [orders, activeMobileOrder]);

  // Filtered orders for "내가 주문한 내역"
  const myOrders = orders.filter(
    (o) => myOrderIds.includes(o.id) || o.channel === 'MOBILE'
  );

  const filteredMenu = menuItems.filter((item) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'coffee') return item.category === 'coffee';
    if (selectedCategory === 'signature') return item.category === 'signature';
    if (selectedCategory === 'tea_beverage') return item.category === 'tea_beverage';
    if (selectedCategory === 'bakery') return item.category === 'bakery' || item.category === 'dessert';
    return true;
  });

  const openOptionModal = (item: MenuItem) => {
    if (item.isSoldOut) return;
    setActiveModalItem(item);
    setSelectedTemp(item.defaultTemp);
    setSelectedSize('Regular');
    setShotCount(0);
    setItemQuantity(1);
  };

  const calculateItemPrice = (item: MenuItem): number => {
    let p = item.price;
    if (selectedSize === 'Large') p += 700;
    p += shotCount * 500;
    return p;
  };

  const handleAddToCart = () => {
    if (!activeModalItem) return;

    const unitPrice = calculateItemPrice(activeModalItem);
    const newCartItem: OrderItem = {
      cartItemId: `mob-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      menuId: activeModalItem.id,
      menuName: activeModalItem.name,
      price: unitPrice,
      basePrice: activeModalItem.price,
      quantity: itemQuantity,
      temperature: selectedTemp,
      size: selectedSize,
      options: {
        shot: shotCount,
        iceAmount: selectedTemp === 'ICE' ? '얼음 보통' : undefined,
      },
      itemTotal: unitPrice * itemQuantity,
    };

    setMobileCart((prev) => [...prev, newCartItem]);
    setActiveModalItem(null);
  };

  const updateCartQty = (cartItemId: string, delta: number) => {
    setMobileCart((prev) =>
      prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const nextQ = item.quantity + delta;
            return { ...item, quantity: nextQ, itemTotal: item.price * nextQ };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const cartTotalPrice = mobileCart.reduce((sum, item) => sum + item.itemTotal, 0);
  const cartTotalQty = mobileCart.reduce((sum, item) => sum + item.quantity, 0);

  const handleProcessPayment = () => {
    setIsProcessingPayment(true);

    setTimeout(() => {
      const newOrder = createOrder({
        orderType,
        channel: 'MOBILE',
        tableNumber: tableNumber ? `테이블 ${tableNumber}` : undefined,
        customerPhone,
        items: mobileCart,
        totalPrice: cartTotalPrice,
        paymentMethod: paymentVendor === 'card' ? 'CARD' : 'EASY_PAY',
        customerNote: tableNumber ? `[모바일 QR] 테이블 ${tableNumber}번` : '[모바일 오더]',
      });

      // Save order id to local my orders list
      setMyOrderIds((prev) => {
        const next = [newOrder.id, ...prev];
        try {
          localStorage.setItem(STORAGE_MY_ORDERS_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });

      setActiveMobileOrder(newOrder);
      setMobileCart([]);
      setIsProcessingPayment(false);
      setIsCheckoutOpen(false);
      // Auto open tracking mode
      setMobileTab('history');
    }, 1200);
  };

  // Re-order historical order
  const handleReorder = (order: Order) => {
    const reorderedCart: OrderItem[] = order.items.map((it, idx) => ({
      ...it,
      cartItemId: `reorder-${Date.now()}-${idx}`,
    }));
    setMobileCart((prev) => [...prev, ...reorderedCart]);
    setMobileTab('menu');
  };

  // Status badge helper
  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>접수 대기 중</span>
          </span>
        );
      case 'COOKING':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-slate-950 flex items-center gap-1 animate-pulse shadow-sm">
            <Coffee className="w-3.5 h-3.5" />
            <span>바리스타 제조 중 ☕</span>
          </span>
        );
      case 'READY':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500 text-white flex items-center gap-1 animate-bounce shadow-md">
            <BellRing className="w-4 h-4" />
            <span>음료 나왔습니다! (수령대)</span>
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>수령 완료</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-950/80 text-rose-300 border border-rose-900 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>주문 취소</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 flex flex-col items-center justify-start p-2 sm:p-6 min-h-screen">
      {/* Top Controller Bar */}
      <div className="max-w-md w-full mb-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-white">스마트폰 모바일 오더 (시니어 맞춤 UI)</span>
        </div>

        <button
          type="button"
          onClick={() => setDeviceFrameMode((prev) => !prev)}
          className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 hover:text-white cursor-pointer"
        >
          {deviceFrameMode ? '스마트폰 외곽선 끄기' : '스마트폰 외곽선 켜기'}
        </button>
      </div>

      {/* Smartphone Device Mockup Wrapper */}
      <div
        className={`${
          deviceFrameMode
            ? 'w-[410px] max-w-full rounded-[44px] border-[10px] border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] ring-1 ring-slate-700/50 overflow-hidden'
            : 'max-w-lg w-full rounded-2xl border border-slate-800'
        } bg-slate-900 flex flex-col min-h-[780px] max-h-[890px] relative`}
      >
        {/* Phone Notch / Dynamic Island */}
        {deviceFrameMode && (
          <div className="bg-slate-950 pt-2 pb-1.5 px-6 flex items-center justify-between text-[11px] text-slate-400 font-mono select-none">
            <span>09:41</span>
            <div className="w-20 h-4 bg-slate-900 rounded-full mx-auto" />
            <span>5G 100%</span>
          </div>
        )}

        {/* Cafe Brand Top Bar */}
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Coffee className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white leading-tight">ATELIER CAFE</h3>
              <p className="text-[11px] text-slate-400">모바일 간편 주문</p>
            </div>
          </div>

          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            영업 중
          </span>
        </div>

        {/* 40-70대 시니어 맞춤 대형 2구 메인 네비게이션 탭 */}
        <div className="grid grid-cols-2 bg-slate-950 p-1.5 border-b border-slate-800 gap-1.5">
          <button
            type="button"
            onClick={() => setMobileTab('menu')}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              mobileTab === 'menu'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Coffee className="w-4 h-4" />
            <span>메뉴 주문하기</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab('history')}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer relative ${
              mobileTab === 'history'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>내가 주문한 내역</span>
            {myOrders.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] font-mono">
                {myOrders.length}
              </span>
            )}
          </button>
        </div>

        {/* ========================================================
            TAB 1: MENU BROWSING & ORDERING (키오스크처럼 2열 대형 이미지)
            ======================================================== */}
        {mobileTab === 'menu' && (
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            {/* Quick Dining Option Selection (40-70대 큰 버튼) */}
            <div className="bg-slate-950/70 p-3 border-b border-slate-800 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOrderType('HERE')}
                  className={`py-2 text-xs sm:text-sm font-bold rounded-xl border transition-all cursor-pointer ${
                    orderType === 'HERE'
                      ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  🪑 매장 테이블 식사
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('TOGO')}
                  className={`py-2 text-xs sm:text-sm font-bold rounded-xl border transition-all cursor-pointer ${
                    orderType === 'TOGO'
                      ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  🛍️ 포장 (테이크아웃)
                </button>
              </div>

              {orderType === 'HERE' && (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="테이블 번호 (예: 5번)"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500"
                  />
                  <span className="text-[11px] text-amber-400 font-semibold whitespace-nowrap">
                    * 테이블로 직접 서빙
                  </span>
                </div>
              )}
            </div>

            {/* Category Scroll Strip (큰 탭) */}
            <div className="flex items-center gap-1.5 p-2.5 overflow-x-auto bg-slate-950/40 border-b border-slate-800/80 scrollbar-none">
              {[
                { id: 'all', label: '전체 메뉴' },
                { id: 'coffee', label: '☕ 커피' },
                { id: 'signature', label: '⭐ 시그니처' },
                { id: 'tea_beverage', label: '🍵 티/에이드' },
                { id: 'bakery', label: '🥐 디저트/빵' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCategory(c.id as MenuCategory)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === c.id
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'bg-slate-900 text-slate-300 hover:text-white'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Menu Items Grid: 매장 키오스크처럼 한 줄에 2개, 이미지가 크게 (40-70대 시니어 맞춤) */}
            <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-3 sm:gap-3.5">
              {filteredMenu.map((item) => (
                <div
                  key={item.id}
                  onClick={() => !item.isSoldOut && openOptionModal(item)}
                  className={`bg-slate-950 rounded-2xl border p-2.5 flex flex-col justify-between transition-all group ${
                    item.isSoldOut
                      ? 'border-slate-800/60 opacity-60 cursor-not-allowed'
                      : 'border-slate-800 hover:border-amber-500/60 cursor-pointer active:scale-[0.98] shadow-sm hover:shadow-md'
                  }`}
                >
                  <div>
                    {/* 대형 이미지 / 비디오 영역 (키오스크 규격) */}
                    <div className="w-full h-32 sm:h-36 rounded-xl overflow-hidden relative bg-slate-900 mb-2 border border-slate-800/80">
                      <MenuMediaDisplay
                        item={item}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        iconClassName="w-14 h-14"
                      />

                      {/* 뱃지 */}
                      {item.badge && !item.isSoldOut && (
                        <span className="absolute top-1.5 left-1.5 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 shadow">
                          {item.badge}
                        </span>
                      )}

                      {/* 품절 오버레이 */}
                      {item.isSoldOut && (
                        <div className="absolute inset-0 bg-black/75 flex items-center justify-center p-2 text-center">
                          <span className="text-xs font-black text-rose-400 bg-rose-950/90 px-2.5 py-1 rounded-lg border border-rose-800">
                            품절 (SOLD OUT)
                          </span>
                        </div>
                      )}
                    </div>

                    {/* 메뉴명: 40-70대를 위한 큼직한 한글 글씨 */}
                    <h4 className="font-extrabold text-sm sm:text-base text-white line-clamp-1 group-hover:text-amber-400 transition-colors">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {item.description}
                    </p>
                  </div>

                  {/* 가격 및 대형 담기 버튼 */}
                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1">
                    <span className="text-sm sm:text-base font-black font-mono text-amber-400">
                      ₩{item.price.toLocaleString()}
                    </span>

                    {item.isSoldOut ? (
                      <span className="text-[11px] font-bold text-rose-400">
                        품절
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openOptionModal(item);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs flex items-center gap-1 shadow cursor-pointer active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>담기</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Sticky Mobile Cart Bar */}
            {mobileCart.length > 0 && (
              <div className="bg-slate-950 p-3.5 border-t border-slate-800 flex items-center justify-between shadow-2xl">
                <div>
                  <span className="text-xs text-slate-400 block font-medium">
                    총 <strong className="text-white">{cartTotalQty}개</strong> 선택됨
                  </span>
                  <span className="text-lg font-black font-mono text-amber-400">
                    ₩{cartTotalPrice.toLocaleString()}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(true)}
                  className="px-5 py-3 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>주문 및 결제하기</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 2: 내가 주문한 내역 (MY ORDER HISTORY - 40-70대 시니어 맞춤)
            ======================================================== */}
        {mobileTab === 'history' && (
          <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-1.5">
                  <ClipboardList className="w-4 h-4 text-amber-400" />
                  <h4 className="font-extrabold text-sm sm:text-base text-white">
                    내가 주문한 내역 ({myOrders.length}건)
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileTab('menu')}
                  className="text-xs text-amber-400 hover:text-white font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>새 메뉴 주문</span>
                </button>
              </div>

              {/* Active Tracking Spotlight (if any order is currently live) */}
              {activeMobileOrder && (
                <div className="bg-gradient-to-b from-amber-950/40 to-slate-950 rounded-2xl p-4 border border-amber-500/50 mb-5 shadow-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>현재 진행 중인 실시간 주문</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-300">
                      진동벨 {activeMobileOrder.vibratingBellNumber}번
                    </span>
                  </div>

                  <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 text-center">
                    <span className="text-xs text-slate-400 block mb-0.5">주문 번호</span>
                    <span className="text-3xl font-black font-mono text-amber-400 block">
                      #{activeMobileOrder.orderNumber}
                    </span>
                    <div className="mt-2 flex justify-center">
                      {getStatusBadge(activeMobileOrder.status)}
                    </div>
                  </div>

                  {/* 3-Step Live Progress Bar */}
                  <div className="grid grid-cols-3 gap-1 pt-1 text-center text-[11px]">
                    <div
                      className={`p-1.5 rounded-lg border ${
                        activeMobileOrder.status !== 'CANCELLED'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                          : 'bg-slate-900 text-slate-500 border-slate-800'
                      }`}
                    >
                      1. 접수 완료
                    </div>
                    <div
                      className={`p-1.5 rounded-lg border ${
                        activeMobileOrder.status === 'COOKING' ||
                        activeMobileOrder.status === 'READY' ||
                        activeMobileOrder.status === 'COMPLETED'
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold animate-pulse'
                          : 'bg-slate-900 text-slate-500 border-slate-800'
                      }`}
                    >
                      2. 음료 제조 중
                    </div>
                    <div
                      className={`p-1.5 rounded-lg border ${
                        activeMobileOrder.status === 'READY' || activeMobileOrder.status === 'COMPLETED'
                          ? 'bg-emerald-500 text-white border-emerald-400 font-extrabold animate-bounce'
                          : 'bg-slate-900 text-slate-500 border-slate-800'
                      }`}
                    >
                      3. 음료 완성 (픽업)
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setReceiptModalOrder(activeMobileOrder)}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-850 text-amber-300 border border-amber-500/30 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>실시간 전자 영수증 레이아웃 보기 (80mm)</span>
                  </button>
                </div>
              )}

              {/* Order History Cards List */}
              {myOrders.length === 0 ? (
                <div className="text-center py-16 bg-slate-950 rounded-2xl border border-slate-800 p-6 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-slate-900 text-slate-500 flex items-center justify-center mx-auto border border-slate-800">
                    <ClipboardList className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-base text-white">
                    아직 주문하신 내역이 없습니다
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                    원하시는 음료를 선택하시고 간편하게 스마트폰으로 결제해 보세요!
                  </p>
                  <button
                    type="button"
                    onClick={() => setMobileTab('menu')}
                    className="mt-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow"
                  >
                    <Coffee className="w-4 h-4" />
                    <span>메뉴 보러 가기</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {myOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-slate-950 rounded-2xl p-4 border border-slate-800 hover:border-slate-700 transition-all space-y-3 shadow-sm"
                    >
                      {/* Card Top: Order Number & Status */}
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black font-mono text-lg text-white">
                              주문 #{ord.orderNumber}
                            </span>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                              {ord.orderType === 'HERE' ? '매장 식사' : '포장'}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            {new Date(ord.createdAt).toLocaleDateString('ko-KR', {
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <div>{getStatusBadge(ord.status)}</div>
                      </div>

                      {/* Items List (40-70대 보기 쉬운 큰 폰트) */}
                      <div className="space-y-1.5 text-xs sm:text-sm">
                        {ord.items.map((it, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center text-slate-200"
                          >
                            <span className="font-semibold">
                              {it.menuName} ({it.temperature}) × {it.quantity}개
                            </span>
                            <span className="font-mono text-slate-400 font-bold">
                              ₩{it.itemTotal.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Total & Action Buttons */}
                      <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="text-xs text-slate-400">총 결제금액</span>
                        <span className="text-base font-black font-mono text-amber-400">
                          ₩{ord.totalPrice.toLocaleString()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setReceiptModalOrder(ord)}
                          className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-400" />
                          <span>영수증 보기</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleReorder(ord)}
                          className="py-2 px-3 rounded-xl bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                          <span>메뉴 다시 담기</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="text-center pt-3 text-[11px] text-slate-500">
              * 주문 내역은 고객님의 스마트폰에 안전하게 보관됩니다.
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          MODAL: 40-70대 시니어 맞춤 심플 옵션 선택 모달
          ======================================================== */}
      {activeModalItem && (
        <div className="fixed inset-0 bg-black/85 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom">
            {/* Header with media preview */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
                  <MenuMediaDisplay
                    item={activeModalItem}
                    className="w-full h-full object-cover"
                    iconClassName="w-10 h-10"
                  />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    {activeModalItem.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-1">
                    {activeModalItem.description}
                  </p>
                  <span className="text-sm text-amber-400 font-mono font-black block mt-0.5">
                    ₩{activeModalItem.price.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveModalItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 1. Temperature (큰 버튼) */}
            {activeModalItem.temperatures.length > 1 && (
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  온도 선택
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {activeModalItem.temperatures.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSelectedTemp(t)}
                      className={`py-3 rounded-xl text-xs sm:text-sm font-extrabold border transition-all cursor-pointer ${
                        selectedTemp === t
                          ? t === 'ICE'
                            ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                            : 'bg-rose-600 border-rose-500 text-white shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {t === 'ICE' ? '🧊 시원하게 (ICE)' : '♨️ 따뜻하게 (HOT)'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Size (큰 버튼) */}
            {activeModalItem.supportsSize && (
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  사이즈 선택
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedSize('Regular')}
                    className={`py-2.5 rounded-xl border text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                      selectedSize === 'Regular'
                        ? 'bg-amber-600 border-amber-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    보통 (Regular)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSize('Large')}
                    className={`py-2.5 rounded-xl border text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                      selectedSize === 'Large'
                        ? 'bg-amber-600 border-amber-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    큰 컵 (Large +700원)
                  </button>
                </div>
              </div>
            )}

            {/* 3. Extra Shot (커피일 경우) */}
            {activeModalItem.category === 'coffee' && (
              <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-slate-300">
                  샷 추가 (+500원)
                </span>
                <div className="flex items-center gap-1.5">
                  {[0, 1, 2].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setShotCount(s)}
                      className={`px-3 py-1 text-xs rounded-lg border font-bold transition-all cursor-pointer ${
                        shotCount === s
                          ? 'bg-amber-600 border-amber-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {s === 0 ? '기본' : `+${s}샷`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Quantity (큼직한 수량 조절 버튼) */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-xs font-bold text-slate-300">주문 수량</span>
              <div className="flex items-center gap-3 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setItemQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-base cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-mono font-black text-lg text-white px-2">
                  {itemQuantity}
                </span>
                <button
                  type="button"
                  onClick={() => setItemQuantity((q) => q + 1)}
                  className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-base cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 text-white font-black text-sm rounded-xl shadow-lg transition-all cursor-pointer active:scale-98"
            >
              장바구니 담기 (₩{(calculateItemPrice(activeModalItem) * itemQuantity).toLocaleString()})
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: 모바일 간편 결제 창
          ======================================================== */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-extrabold text-sm sm:text-base text-white">모바일 주문 및 결제</h3>
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart summary */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-2 max-h-36 overflow-y-auto">
              {mobileCart.map((item) => (
                <div key={item.cartItemId} className="flex justify-between items-center text-slate-300">
                  <span className="font-medium">
                    {item.menuName} ({item.temperature}) × {item.quantity}
                  </span>
                  <span className="font-mono text-amber-400 font-bold">
                    ₩{item.itemTotal.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Total Price */}
            <div className="flex justify-between items-center text-sm font-bold pt-1">
              <span className="text-slate-300">최종 결제 금액</span>
              <span className="text-xl font-black font-mono text-amber-400">
                ₩{cartTotalPrice.toLocaleString()}
              </span>
            </div>

            {/* Payment Vendor Selector */}
            <div>
              <span className="text-xs font-bold text-slate-300 block mb-2">간편 결제 수단</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentVendor('kakaopay')}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all cursor-pointer ${
                    paymentVendor === 'kakaopay'
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  🟡 카카오페이
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentVendor('tosspay')}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all cursor-pointer ${
                    paymentVendor === 'tosspay'
                      ? 'bg-blue-600 text-white border-blue-400 shadow'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  🔵 토스페이
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentVendor('naverpay')}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all cursor-pointer ${
                    paymentVendor === 'naverpay'
                      ? 'bg-emerald-600 text-white border-emerald-400 shadow'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  🟢 네이버페이
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentVendor('card')}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all cursor-pointer ${
                    paymentVendor === 'card'
                      ? 'bg-purple-600 text-white border-purple-400 shadow'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  💳 신용/체크카드
                </button>
              </div>
            </div>

            {/* Notification Phone input */}
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                완료 알림 수신 휴대폰 번호 뒷자리
              </label>
              <input
                type="text"
                maxLength={4}
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="7890"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
              />
            </div>

            <button
              type="button"
              disabled={isProcessingPayment}
              onClick={handleProcessPayment}
              className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 text-white font-black text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isProcessingPayment ? (
                <span>결제 승인 진행 중...</span>
              ) : (
                <span>결제 승인 및 주문 접수하기</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          RECEIPT MODAL POPUP
          ======================================================== */}
      <ReceiptModal
        order={receiptModalOrder}
        onClose={() => setReceiptModalOrder(null)}
        title="[모바일] 전자 영수증 미리보기"
      />
    </div>
  );
};
