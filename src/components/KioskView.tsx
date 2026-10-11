import React, { useState } from 'react';
import { useCafeOrder } from '../context/CafeOrderContext';
import { MenuItem, OrderItem, OrderItemOption, MenuCategory, Order } from '../types/cafe';
import { MenuIcon } from './MenuIcon';
import { MenuMediaDisplay } from './MenuMediaDisplay';
import { ReceiptModal } from './ReceiptModal';
import { ShoppingBag, Coffee, Plus, Minus, Trash2, ArrowRight, Check, CreditCard, Smartphone, Banknote, Sparkles, FileText, Printer } from 'lucide-react';

export const KioskView: React.FC = () => {
  const { menuItems, createOrder } = useCafeOrder();

  const [orderType, setOrderType] = useState<'HERE' | 'TOGO'>('HERE');
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>('all');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [activeModalItem, setActiveModalItem] = useState<MenuItem | null>(null);

  // Item customization modal state
  const [selectedTemp, setSelectedTemp] = useState<'HOT' | 'ICE'>('ICE');
  const [selectedSize, setSelectedSize] = useState<'Regular' | 'Large'>('Regular');
  const [shotCount, setShotCount] = useState<number>(0);
  const [selectedMilk, setSelectedMilk] = useState<OrderItemOption['milkType']>('일반우유');
  const [selectedSyrup, setSelectedSyrup] = useState<OrderItemOption['syrup']>('기본');
  const [selectedIce, setSelectedIce] = useState<OrderItemOption['iceAmount']>('얼음 보통');
  const [selectedSweetness, setSelectedSweetness] = useState<OrderItemOption['sweetness']>('기본(100%)');
  const [itemQuantity, setItemQuantity] = useState<number>(1);

  // Checkout modal
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'EASY_PAY' | 'CASH'>('CARD');
  const [customerNote, setCustomerNote] = useState('');
  const [completedOrderNumber, setCompletedOrderNumber] = useState<number | null>(null);
  const [completedBellNumber, setCompletedBellNumber] = useState<number | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);

  // Category filter
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
    setSelectedMilk('일반우유');
    setSelectedSyrup('기본');
    setSelectedIce('얼음 보통');
    setSelectedSweetness('기본(100%)');
    setItemQuantity(1);
  };

  // Calculate current modal unit price
  const calculateModalUnitPrice = (item: MenuItem): number => {
    let price = item.price;
    if (selectedSize === 'Large') price += 700;
    price += shotCount * 500;
    if (selectedMilk === '오트(귀리)밀크 (+700)') price += 700;
    if (selectedMilk === '두유 (+500)') price += 500;
    if (selectedSyrup && selectedSyrup !== '기본') price += 500;
    return price;
  };

  const handleAddToCart = () => {
    if (!activeModalItem) return;

    const unitPrice = calculateModalUnitPrice(activeModalItem);
    const newCartItem: OrderItem = {
      cartItemId: `cart-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      menuId: activeModalItem.id,
      menuName: activeModalItem.name,
      price: unitPrice,
      basePrice: activeModalItem.price,
      quantity: itemQuantity,
      temperature: selectedTemp,
      size: selectedSize,
      options: {
        shot: shotCount,
        milkType: selectedMilk,
        syrup: selectedSyrup,
        iceAmount: selectedTemp === 'ICE' ? selectedIce : undefined,
        sweetness: selectedSweetness,
      },
      itemTotal: unitPrice * itemQuantity,
    };

    setCart((prev) => [...prev, newCartItem]);
    setActiveModalItem(null);
  };

  const updateCartQty = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            return {
              ...item,
              quantity: newQty,
              itemTotal: item.price * newQty,
            };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const cartTotalPrice = cart.reduce((sum, item) => sum + item.itemTotal, 0);
  const cartTotalQty = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleFinalOrderSubmit = () => {
    if (cart.length === 0) return;

    const newOrder = createOrder({
      orderType,
      items: cart,
      totalPrice: cartTotalPrice,
      paymentMethod,
      customerNote: customerNote.trim() || undefined,
    });

    setCompletedOrder(newOrder);
    setCompletedOrderNumber(newOrder.orderNumber);
    setCompletedBellNumber(newOrder.vibratingBellNumber);
    setCart([]);
    setIsCheckoutOpen(false);
    setCustomerNote('');
  };

  return (
    <div className="flex-1 bg-slate-900 text-slate-100 flex flex-col min-h-screen">
      {/* Top Bar for Kiosk: Order Type & Brand */}
      <div className="bg-slate-950 border-b border-slate-800 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-600 flex items-center justify-center text-white shadow-sm font-bold">
            ☕
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">
              셀프 주문 키오스크 (KIOSK)
            </h1>
            <p className="text-xs text-slate-400">
              원하시는 메뉴와 옵션을 선택하여 간편하게 주문하세요
            </p>
          </div>
        </div>

        {/* Dine-in vs Take-out toggle buttons */}
        <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => setOrderType('HERE')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              orderType === 'HERE'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Coffee className="w-4 h-4" />
            <span>매장 식사 (HERE)</span>
          </button>
          <button
            type="button"
            onClick={() => setOrderType('TOGO')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              orderType === 'TOGO'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>포장하기 (TOGO)</span>
          </button>
        </div>
      </div>

      {/* Main Kiosk Content */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto p-4 sm:p-6 gap-6">
        {/* Left Column: Menu Browsing */}
        <div className="flex-1 flex flex-col">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 border-b border-slate-800">
            {[
              { id: 'all', label: '전체 메뉴' },
              { id: 'coffee', label: '에스프레소 & 커피' },
              { id: 'signature', label: '시그니처 라떼' },
              { id: 'tea_beverage', label: '티 & 에이드' },
              { id: 'bakery', label: '베이커리 & 디저트' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id as MenuCategory)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-white text-slate-950 shadow'
                    : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {filteredMenu.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => openOptionModal(item)}
                disabled={item.isSoldOut}
                className={`relative bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 text-left transition-all duration-200 flex flex-col justify-between group cursor-pointer ${
                  item.isSoldOut ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <div>
                  {/* Visual Illustration / Media */}
                  <div className="w-full h-28 bg-slate-900 rounded-lg flex items-center justify-center mb-3 relative overflow-hidden group-hover:scale-[1.02] transition-transform">
                    <MenuMediaDisplay item={item} className="w-full h-full object-cover" iconClassName="w-16 h-16 drop-shadow" />

                    {/* Badge */}
                    {item.badge && !item.isSoldOut && (
                      <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                        {item.badge}
                      </span>
                    )}

                    {/* Sold out badge */}
                    {item.isSoldOut && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <span className="text-xs font-bold text-rose-400 bg-rose-950/80 px-2 py-1 rounded border border-rose-800">
                          품절 (SOLD OUT)
                        </span>
                      </div>
                    )}
                  </div>

                  <h3 className="font-bold text-sm text-white line-clamp-1 group-hover:text-amber-400 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 mb-1">{item.nameEn}</p>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-sm font-extrabold font-mono text-amber-400">
                    ₩{item.price.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-slate-400 group-hover:text-amber-300 flex items-center gap-0.5">
                    선택 <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Floating Cart Panel */}
        <div className="w-full lg:w-80 bg-slate-950 rounded-xl border border-slate-800 p-4 flex flex-col justify-between h-[580px] sticky top-20">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <h2 className="font-bold text-sm text-white">주문 장바구니</h2>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {cartTotalQty}개 선택됨
              </span>
            </div>

            {/* Cart Items List */}
            <div className="overflow-y-auto max-h-[380px] space-y-2.5 my-3 pr-1">
              {cart.length === 0 ? (
                <div className="h-44 flex flex-col items-center justify-center text-slate-500 text-xs text-center">
                  <ShoppingBag className="w-8 h-8 mb-2 stroke-slate-600" />
                  담긴 메뉴가 없습니다
                  <span className="text-[11px] text-slate-500 mt-1">원하시는 음료를 터치해 담아보세요</span>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.cartItemId}
                    className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs"
                  >
                    <div className="flex justify-between items-start gap-1">
                      <div className="flex-1">
                        <div className="font-semibold text-white">
                          <span
                            className={`text-[10px] px-1 rounded mr-1 ${
                              item.temperature === 'ICE'
                                ? 'bg-blue-900/60 text-blue-300'
                                : 'bg-rose-900/60 text-rose-300'
                            }`}
                          >
                            {item.temperature}
                          </span>
                          {item.menuName}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 space-x-1">
                          {item.size === 'Large' && <span>(L)</span>}
                          {item.options.shot > 0 && <span>+{item.options.shot}샷</span>}
                          {item.options.milkType && item.options.milkType !== '일반우유' && (
                            <span>{item.options.milkType}</span>
                          )}
                          {item.options.syrup && item.options.syrup !== '기본' && (
                            <span>{item.options.syrup}</span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.cartItemId)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        title="삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-2 bg-slate-800 rounded px-1.5 py-0.5">
                        <button
                          type="button"
                          onClick={() => updateCartQty(item.cartItemId, -1)}
                          className="text-slate-300 hover:text-white p-0.5"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono font-bold text-white px-1">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQty(item.cartItemId, 1)}
                          className="text-slate-300 hover:text-white p-0.5"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-mono font-bold text-amber-400 text-xs">
                        ₩{item.itemTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Cart Bottom Summary & Checkout Button */}
          <div className="pt-3 border-t border-slate-800">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs text-slate-400">총 결제금액</span>
              <span className="text-lg font-black font-mono text-amber-400">
                ₩{cartTotalPrice.toLocaleString()}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsCheckoutOpen(true)}
              disabled={cart.length === 0}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm text-white transition-all flex items-center justify-center gap-2 cursor-pointer ${
                cart.length > 0
                  ? 'bg-amber-600 hover:bg-amber-500 shadow-lg shadow-amber-600/30'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>주문하기 ({cartTotalQty}잔)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Menu Options Customizer Modal */}
      {activeModalItem && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-lg text-white">{activeModalItem.name}</h3>
                <p className="text-xs text-slate-400">{activeModalItem.description}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalItem(null)}
                className="text-slate-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            {/* Customization Options */}
            <div className="py-4 space-y-4">
              {/* 1. Temperature */}
              {activeModalItem.temperatures.length > 1 && (
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-2">온도 선택</label>
                  <div className="grid grid-cols-2 gap-2">
                    {activeModalItem.temperatures.map((temp) => (
                      <button
                        key={temp}
                        type="button"
                        onClick={() => setSelectedTemp(temp)}
                        className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                          selectedTemp === temp
                            ? temp === 'ICE'
                              ? 'bg-blue-600 border-blue-500 text-white'
                              : 'bg-rose-600 border-rose-500 text-white'
                            : 'bg-slate-800 border-slate-700 text-slate-300'
                        }`}
                      >
                        {temp === 'ICE' ? '🧊 ICE (차갑게)' : '♨️ HOT (따뜻하게)'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Size */}
              {activeModalItem.supportsSize && (
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-2">사이즈 선택</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedSize('Regular')}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        selectedSize === 'Regular'
                          ? 'bg-amber-600 border-amber-500 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      Regular (기본)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedSize('Large')}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        selectedSize === 'Large'
                          ? 'bg-amber-600 border-amber-500 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      Large (+700원)
                    </button>
                  </div>
                </div>
              )}

              {/* 3. Espresso Shots (Coffee items) */}
              {activeModalItem.category === 'coffee' && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold text-slate-300">에스프레소 샷 추가 (+500원/샷)</label>
                    <span className="text-xs font-mono text-amber-400">+{shotCount} 샷</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {[0, 1, 2].map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => setShotCount(cnt)}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                          shotCount === cnt
                            ? 'bg-amber-600 border-amber-500 text-white'
                            : 'bg-slate-800 border-slate-700 text-slate-300'
                        }`}
                      >
                        {cnt === 0 ? '기본 (추가없음)' : `+${cnt}샷`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Milk Type (Latte / Coffee) */}
              {(activeModalItem.category === 'coffee' || activeModalItem.category === 'signature') && (
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-2">우유 종류 선택</label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {(['일반우유', '저지방우유', '오트(귀리)밀크 (+700)', '두유 (+500)'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setSelectedMilk(m)}
                        className={`py-1.5 px-2 text-xs rounded-lg border transition-all cursor-pointer ${
                          selectedMilk === m
                            ? 'bg-amber-600 border-amber-500 text-white'
                            : 'bg-slate-800 border-slate-700 text-slate-300'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Quantity */}
              <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-300">수량</span>
                <div className="flex items-center gap-3 bg-slate-800 rounded-lg px-2 py-1">
                  <button
                    type="button"
                    onClick={() => setItemQuantity((q) => Math.max(1, q - 1))}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-bold font-mono text-sm px-2 text-white">{itemQuantity}</span>
                  <button
                    type="button"
                    onClick={() => setItemQuantity((q) => q + 1)}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Add to Cart Button */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
              <div>
                <span className="text-[11px] text-slate-400 block">금액 합계</span>
                <span className="text-lg font-bold font-mono text-amber-400">
                  ₩{(calculateModalUnitPrice(activeModalItem) * itemQuantity).toLocaleString()}
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 py-3 px-4 bg-amber-600 hover:bg-amber-500 font-bold text-sm text-white rounded-xl shadow-md transition-colors cursor-pointer"
              >
                장바구니 담기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout & Payment Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="font-bold text-lg text-white mb-1">주문 및 결제 확인</h3>
            <p className="text-xs text-slate-400 mb-4">
              주문 내용과 결제 수단을 확인해주세요.
            </p>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 mb-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>이용 형태</span>
                <span className="font-bold text-white">
                  {orderType === 'HERE' ? '매장 식사 (HERE)' : '포장하기 (TOGO)'}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>주문 메뉴</span>
                <span className="font-mono text-white">{cartTotalQty}잔</span>
              </div>
              <div className="flex justify-between text-slate-300 font-bold pt-2 border-t border-slate-800 text-sm">
                <span>최종 결제 금액</span>
                <span className="text-amber-400 font-mono">₩{cartTotalPrice.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-300 block mb-2">결제 수단 선택</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'CARD'
                      ? 'bg-amber-600/20 border-amber-500 text-amber-300 font-bold'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span className="text-[11px]">신용/체크카드</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('EASY_PAY')}
                  className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'EASY_PAY'
                      ? 'bg-amber-600/20 border-amber-500 text-amber-300 font-bold'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  <Smartphone className="w-5 h-5" />
                  <span className="text-[11px]">간편결제/페이</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'CASH'
                      ? 'bg-amber-600/20 border-amber-500 text-amber-300 font-bold'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  <Banknote className="w-5 h-5" />
                  <span className="text-[11px]">카운터 현금</span>
                </button>
              </div>
            </div>

            {/* Customer Special Note */}
            <div className="mb-5">
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">요청사항 (선택)</label>
              <input
                type="text"
                placeholder="예: 얼음 많이 주세요, 캐리어 담아주세요"
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="flex-1 py-2.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleFinalOrderSubmit}
                className="flex-2 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow transition-colors cursor-pointer"
              >
                결제 승인 및 주문 접수
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Complete Success Overlay */}
      {completedOrderNumber !== null && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-amber-500/50 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl animate-in fade-in zoom-in-95 space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/60 rounded-full flex items-center justify-center mx-auto text-emerald-400">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">주문 및 결제가 완료되었습니다!</h3>
              <p className="text-xs text-slate-400 mt-1">
                주방 KDS에 주문이 즉시 전송되었습니다.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-left">
              <div className="text-center pb-3 border-b border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-0.5">고객 주문 번호</span>
                <span className="text-4xl font-black font-mono text-amber-400 tracking-tight block">
                  #{completedOrderNumber}
                </span>
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-300 rounded-full text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>진동벨 번호 : <strong>{completedBellNumber}번</strong></span>
                </div>
              </div>

              {completedOrder && (
                <div className="pt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>주문 구분:</span>
                    <span className="text-white font-medium">
                      {completedOrder.orderType === 'HERE' ? '매장 식사 (HERE)' : '포장하기 (TOGO)'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>결제 금액:</span>
                    <span className="text-amber-400 font-mono font-bold">
                      ₩{completedOrder.totalPrice.toLocaleString()} ({completedOrder.paymentMethod === 'CARD' ? '카드' : completedOrder.paymentMethod === 'EASY_PAY' ? '간편페이' : '현금'})
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate pt-0.5">
                    {completedOrder.items.map((i) => `${i.menuName} x${i.quantity}`).join(', ')}
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons including receipt preview modal */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => setShowReceiptModal(true)}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white border border-amber-500/40 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-[0.99]"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span>실제 영수증 레이아웃 미리보기 (80mm 규격)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCompletedOrderNumber(null);
                  setCompletedBellNumber(null);
                  setCompletedOrder(null);
                  setShowReceiptModal(false);
                }}
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 font-bold text-xs text-white rounded-xl shadow transition-colors cursor-pointer"
              >
                확인 (새 주문하기)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Actual Thermal Receipt Modal Popup */}
      <ReceiptModal
        order={showReceiptModal ? completedOrder : null}
        onClose={() => setShowReceiptModal(false)}
        title="[키오스크] 주문 완료 영수증 미리보기"
      />
    </div>
  );
};
