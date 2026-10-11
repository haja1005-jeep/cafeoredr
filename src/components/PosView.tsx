import React, { useState } from 'react';
import { useCafeOrder } from '../context/CafeOrderContext';
import { MenuItem, OrderItem, MenuCategory, Order, OrderStatus } from '../types/cafe';
import { ReceiptModal } from './ReceiptModal';
import { Plus, Minus, Trash2, Printer, Search, RefreshCw, CheckCircle2, XCircle, ArrowRight, FileText, X } from 'lucide-react';

export const PosView: React.FC = () => {
  const {
    menuItems,
    orders,
    createOrder,
    updateOrderStatus,
    cancelOrder,
    toggleItemSoldOut,
  } = useCafeOrder();

  const [posTab, setPosTab] = useState<'REGISTER' | 'ORDERS_LEDGER' | 'INVENTORY'>('REGISTER');

  // Fast POS Register State
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>('all');
  const [registerItems, setRegisterItems] = useState<OrderItem[]>([]);
  const [orderType, setOrderType] = useState<'HERE' | 'TOGO'>('HERE');
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'EASY_PAY' | 'CASH'>('CARD');
  const [quickTemp, setQuickTemp] = useState<'HOT' | 'ICE'>('ICE');
  const [vibratingBellInput, setVibratingBellInput] = useState<string>('');
  const [posCustomerNote, setPosCustomerNote] = useState<string>('');
  const [lastCompletedOrder, setLastCompletedOrder] = useState<Order | null>(null);

  // Orders Ledger State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | OrderStatus>('ALL');
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);

  // Fast add item to register
  const handleQuickAddItem = (item: MenuItem) => {
    if (item.isSoldOut) return;

    const temp = item.temperatures.includes(quickTemp) ? quickTemp : item.defaultTemp;
    const existingIndex = registerItems.findIndex(
      (ri) => ri.menuId === item.id && ri.temperature === temp && ri.size === 'Regular' && ri.options.shot === 0
    );

    if (existingIndex > -1) {
      setRegisterItems((prev) =>
        prev.map((ri, idx) =>
          idx === existingIndex
            ? { ...ri, quantity: ri.quantity + 1, itemTotal: ri.price * (ri.quantity + 1) }
            : ri
        )
      );
    } else {
      const newItem: OrderItem = {
        cartItemId: `pos-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        menuId: item.id,
        menuName: item.name,
        price: item.price,
        basePrice: item.price,
        quantity: 1,
        temperature: temp,
        size: 'Regular',
        options: { shot: 0 },
        itemTotal: item.price,
      };
      setRegisterItems((prev) => [...prev, newItem]);
    }
  };

  const updateRegisterQty = (cartItemId: string, delta: number) => {
    setRegisterItems((prev) =>
      prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const nextQty = item.quantity + delta;
            return { ...item, quantity: nextQty, itemTotal: item.price * nextQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const addExtraShot = (cartItemId: string) => {
    setRegisterItems((prev) =>
      prev.map((item) => {
        if (item.cartItemId === cartItemId) {
          const nextShots = item.options.shot + 1;
          const nextUnitPrice = item.basePrice + nextShots * 500;
          return {
            ...item,
            price: nextUnitPrice,
            options: { ...item.options, shot: nextShots },
            itemTotal: nextUnitPrice * item.quantity,
          };
        }
        return item;
      })
    );
  };

  const registerTotalPrice = registerItems.reduce((sum, item) => sum + item.itemTotal, 0);
  const registerTotalQty = registerItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleCompleteRegisterOrder = () => {
    if (registerItems.length === 0) return;

    const bellNum = vibratingBellInput ? parseInt(vibratingBellInput, 10) : undefined;
    const newOrder = createOrder({
      orderType,
      items: registerItems,
      totalPrice: registerTotalPrice,
      paymentMethod,
      customerNote: posCustomerNote || undefined,
      vibratingBellNumber: bellNum,
    });

    setRegisterItems([]);
    setVibratingBellInput('');
    setPosCustomerNote('');
    setLastCompletedOrder(newOrder);
    setSelectedReceiptOrder(newOrder); // Open receipt preview immediately
  };

  // Filtered Ledger Orders
  const ledgerOrders = orders.filter((order) => {
    if (statusFilter !== 'ALL' && order.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchNum = String(order.orderNumber).includes(q);
      const matchItems = order.items.some((i) => i.menuName.toLowerCase().includes(q));
      const matchNote = order.customerNote?.toLowerCase().includes(q);
      return matchNum || matchItems || matchNote;
    }
    return true;
  });

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 flex flex-col min-h-screen">
      {/* Sub-header Navigation */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center font-bold text-white shadow-sm">
            🖥️
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">
              카운터 POS & 통합 주문 관리
            </h1>
            <p className="text-xs text-slate-400">
              오프라인 주문 접수, 영수증 발행 및 메뉴 품절 실시간 제어
            </p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center p-1 bg-slate-800 rounded-lg border border-slate-700/60">
          <button
            type="button"
            onClick={() => setPosTab('REGISTER')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
              posTab === 'REGISTER'
                ? 'bg-amber-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            현장 주문 접수 (POS)
          </button>
          <button
            type="button"
            onClick={() => setPosTab('ORDERS_LEDGER')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
              posTab === 'ORDERS_LEDGER'
                ? 'bg-amber-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            전체 주문 내역 ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setPosTab('INVENTORY')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
              posTab === 'INVENTORY'
                ? 'bg-amber-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            품절 ON/OFF 관리
          </button>
        </div>
      </div>

      {/* POS View Content */}
      <div className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
        {/* TAB 1: FAST REGISTER */}
        {posTab === 'REGISTER' && (
          <div className="flex flex-col gap-4">
            {/* Last Completed Order Quick Bar */}
            {lastCompletedOrder && (
              <div className="p-3 bg-amber-500/15 border border-amber-500/40 rounded-2xl flex items-center justify-between animate-in fade-in">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs text-white">
                    최근 주문 <strong className="text-amber-400 font-mono font-bold text-sm">#{lastCompletedOrder.orderNumber}</strong> 정상 등록 완료!
                    <span className="text-slate-400 ml-2">
                      (진동벨: {lastCompletedOrder.vibratingBellNumber}번 · ₩{lastCompletedOrder.totalPrice.toLocaleString()})
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedReceiptOrder(lastCompletedOrder)}
                    className="px-3 py-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white rounded-xl flex items-center gap-1.5 shadow transition-all cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>영수증 보기 / 재인쇄</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLastCompletedOrder(null)}
                    className="text-slate-400 hover:text-white p-1 cursor-pointer"
                    title="닫기"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column: Menu Pad */}
            <div className="flex-1 flex flex-col bg-slate-900 rounded-2xl border border-slate-800 p-4">
              {/* Top Filters: Quick Temp & Category */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-800">
                {/* Temp preset */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setQuickTemp('ICE')}
                    className={`px-3 py-1 text-xs font-bold rounded cursor-pointer ${
                      quickTemp === 'ICE' ? 'bg-blue-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    🧊 ICE 기본
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickTemp('HOT')}
                    className={`px-3 py-1 text-xs font-bold rounded cursor-pointer ${
                      quickTemp === 'HOT' ? 'bg-rose-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    ♨️ HOT 기본
                  </button>
                </div>

                {/* Categories */}
                <div className="flex items-center gap-1 overflow-x-auto">
                  {[
                    { id: 'all', label: '전체' },
                    { id: 'coffee', label: '커피' },
                    { id: 'signature', label: '시그니처' },
                    { id: 'tea_beverage', label: '티/에이드' },
                    { id: 'bakery', label: '베이커리/디저트' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id as MenuCategory)}
                      className={`px-2.5 py-1 text-xs rounded transition-colors whitespace-nowrap cursor-pointer ${
                        selectedCategory === cat.id
                          ? 'bg-amber-600 text-white font-bold'
                          : 'bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Menu Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 flex-1 overflow-y-auto max-h-[560px] pr-1">
                {menuItems
                  .filter((m) => {
                    if (selectedCategory === 'all') return true;
                    if (selectedCategory === 'bakery') return m.category === 'bakery' || m.category === 'dessert';
                    return m.category === selectedCategory;
                  })
                  .map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      disabled={item.isSoldOut}
                      onClick={() => handleQuickAddItem(item)}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        item.isSoldOut
                          ? 'bg-slate-950/40 border-slate-800 opacity-50 cursor-not-allowed'
                          : 'bg-slate-950 hover:bg-slate-800 border-slate-800 hover:border-amber-500/50'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-xs text-white line-clamp-1">
                            {item.name}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 line-clamp-1 block">
                          {item.description}
                        </span>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-800/80 flex justify-between items-center">
                        <span className="text-xs font-mono font-bold text-amber-400">
                          ₩{item.price.toLocaleString()}
                        </span>
                        {item.isSoldOut ? (
                          <span className="text-[10px] text-rose-400">품절</span>
                        ) : (
                          <span className="text-[10px] text-slate-400">+ 담기</span>
                        )}
                      </div>
                    </button>
                  ))}
              </div>
            </div>

            {/* Right Column: POS Register Ticket */}
            <div className="w-full lg:w-96 bg-slate-900 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h2 className="font-bold text-sm text-white">현장 전표 등록</h2>
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setOrderType('HERE')}
                      className={`px-2.5 py-1 text-xs rounded font-bold cursor-pointer ${
                        orderType === 'HERE' ? 'bg-amber-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      매장
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType('TOGO')}
                      className={`px-2.5 py-1 text-xs rounded font-bold cursor-pointer ${
                        orderType === 'TOGO' ? 'bg-amber-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      포장
                    </button>
                  </div>
                </div>

                {/* Items in ticket */}
                <div className="overflow-y-auto max-h-[280px] space-y-2 my-3 pr-1">
                  {registerItems.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center text-slate-500 text-xs">
                      좌측 메뉴를 터치하여 전표에 추가하세요
                    </div>
                  ) : (
                    registerItems.map((item) => (
                      <div
                        key={item.cartItemId}
                        className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs space-y-1.5"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span
                              className={`text-[10px] px-1 rounded mr-1 font-bold ${
                                item.temperature === 'ICE' ? 'bg-blue-900/60 text-blue-300' : 'bg-rose-900/60 text-rose-300'
                              }`}
                            >
                              {item.temperature}
                            </span>
                            <span className="font-semibold text-white">{item.menuName}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => updateRegisterQty(item.cartItemId, -item.quantity)}
                            className="text-slate-500 hover:text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Modifiers & shot add */}
                        <div className="flex items-center justify-between text-[11px] pt-1">
                          <button
                            type="button"
                            onClick={() => addExtraShot(item.cartItemId)}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 hover:bg-slate-700 border border-slate-700"
                          >
                            +샷 추가 {item.options.shot > 0 && `(${item.options.shot})`}
                          </button>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 bg-slate-800 rounded px-1.5 py-0.5">
                              <button
                                type="button"
                                onClick={() => updateRegisterQty(item.cartItemId, -1)}
                                className="text-slate-400 hover:text-white"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="font-mono font-bold text-white px-1">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateRegisterQty(item.cartItemId, 1)}
                                className="text-slate-400 hover:text-white"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <span className="font-mono font-bold text-amber-400 text-xs">
                              ₩{item.itemTotal.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Additional Inputs: Vibrating bell & Note */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="진동벨 번호 (선택)"
                      value={vibratingBellInput}
                      onChange={(e) => setVibratingBellInput(e.target.value)}
                      className="w-1/2 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500"
                    />
                    <input
                      type="text"
                      placeholder="주방 요청 메모"
                      value={posCustomerNote}
                      onChange={(e) => setPosCustomerNote(e.target.value)}
                      className="w-1/2 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500"
                    />
                  </div>

                  {/* Payment selector */}
                  <div className="grid grid-cols-3 gap-1.5 text-xs">
                    {(['CARD', 'EASY_PAY', 'CASH'] as const).map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`py-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                          paymentMethod === method
                            ? 'bg-amber-600/30 border-amber-500 text-amber-300 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        {method === 'CARD' ? '카드' : method === 'EASY_PAY' ? '간편페이' : '현금'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Submit */}
              <div className="pt-3 border-t border-slate-800">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-slate-400">합계 ({registerTotalQty}잔)</span>
                  <span className="text-xl font-black font-mono text-amber-400">
                    ₩{registerTotalPrice.toLocaleString()}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCompleteRegisterOrder}
                  disabled={registerItems.length === 0}
                  className={`w-full py-3 rounded-xl font-bold text-xs text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    registerItems.length > 0
                      ? 'bg-amber-600 hover:bg-amber-500 shadow-md'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <span>결제 승인 및 영수증 발행</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* TAB 2: ORDERS LEDGER & HISTORY */}
        {posTab === 'ORDERS_LEDGER' && (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 flex flex-col space-y-4">
            {/* Filter & Search Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="relative w-72">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="주문번호 또는 메뉴명 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Status Filters */}
              <div className="flex items-center gap-1 overflow-x-auto">
                {(['ALL', 'PENDING', 'COOKING', 'READY', 'COMPLETED', 'CANCELLED'] as const).map(
                  (st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusFilter(st)}
                      className={`px-2.5 py-1 text-xs rounded transition-colors whitespace-nowrap cursor-pointer ${
                        statusFilter === st
                          ? 'bg-amber-600 text-white font-bold'
                          : 'bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      {st === 'ALL'
                        ? '전체'
                        : st === 'PENDING'
                        ? '접수대기'
                        : st === 'COOKING'
                        ? '제조중'
                        : st === 'READY'
                        ? '픽업호출'
                        : st === 'COMPLETED'
                        ? '수령완료'
                        : '취소'}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] text-slate-400 uppercase bg-slate-950 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">주문번호</th>
                    <th className="px-4 py-3">접수시각</th>
                    <th className="px-4 py-3">유형</th>
                    <th className="px-4 py-3">품목 내역</th>
                    <th className="px-4 py-3 text-right">금액</th>
                    <th className="px-4 py-3 text-center">상태</th>
                    <th className="px-4 py-3 text-center">관리 액션</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {ledgerOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-500">
                        일치하는 주문 내역이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    ledgerOrders.map((order) => {
                      const timeStr = new Date(order.createdAt).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      });

                      const statusLabels = {
                        PENDING: { label: '접수대기', color: 'bg-rose-500/20 text-rose-300' },
                        COOKING: { label: '제조중', color: 'bg-amber-500/20 text-amber-300' },
                        READY: { label: '픽업호출', color: 'bg-emerald-500/20 text-emerald-300' },
                        COMPLETED: { label: '완료됨', color: 'bg-slate-800 text-slate-400' },
                        CANCELLED: { label: '주문취소', color: 'bg-rose-950 text-rose-400' },
                      }[order.status];

                      return (
                        <tr key={order.id} className="hover:bg-slate-950/60 transition-colors">
                          <td className="px-4 py-3 font-mono font-bold text-white text-sm">
                            #{order.orderNumber}
                            <span className="block text-[10px] text-slate-400 font-normal">
                              벨 {order.vibratingBellNumber}번
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-400">{timeStr}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                order.orderType === 'HERE'
                                  ? 'bg-blue-900/60 text-blue-200'
                                  : 'bg-emerald-900/60 text-emerald-200'
                              }`}
                            >
                              {order.orderType === 'HERE' ? '매장' : '포장'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-300">
                            <div className="space-y-0.5">
                              {order.items.map((item, idx) => (
                                <div key={idx}>
                                  <span className="font-medium text-white">{item.menuName}</span>{' '}
                                  <span className="font-mono text-amber-400">×{item.quantity}</span>
                                  {item.options.shot > 0 && (
                                    <span className="text-[10px] text-slate-400 ml-1">
                                      (+{item.options.shot}샷)
                                    </span>
                                  )}
                                </div>
                              ))}
                              {order.customerNote && (
                                <div className="text-[10px] text-amber-300">
                                  💬 {order.customerNote}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-white">
                            ₩{order.totalPrice.toLocaleString()}
                            <span className="block text-[10px] text-slate-400 font-normal">
                              {order.paymentMethod === 'CARD'
                                ? '카드'
                                : order.paymentMethod === 'EASY_PAY'
                                ? '페이'
                                : '현금'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusLabels.color}`}
                            >
                              {statusLabels.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center space-x-1.5">
                            {/* Receipt button */}
                            <button
                              type="button"
                              onClick={() => setSelectedReceiptOrder(order)}
                              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                              title="영수증 출력"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>

                            {/* Quick status progress */}
                            {order.status === 'PENDING' && (
                              <button
                                type="button"
                                onClick={() => updateOrderStatus(order.id, 'COOKING')}
                                className="px-2 py-1 text-[11px] rounded bg-amber-600 hover:bg-amber-500 text-white font-medium cursor-pointer"
                              >
                                조리시작
                              </button>
                            )}
                            {order.status === 'COOKING' && (
                              <button
                                type="button"
                                onClick={() => updateOrderStatus(order.id, 'READY')}
                                className="px-2 py-1 text-[11px] rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium cursor-pointer"
                              >
                                호출
                              </button>
                            )}
                            {order.status === 'READY' && (
                              <button
                                type="button"
                                onClick={() => updateOrderStatus(order.id, 'COMPLETED')}
                                className="px-2 py-1 text-[11px] rounded bg-slate-700 hover:bg-slate-600 text-white font-medium cursor-pointer"
                              >
                                완료
                              </button>
                            )}
                            {order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && (
                              <button
                                type="button"
                                onClick={() => cancelOrder(order.id, '카운터 관리자 취소')}
                                className="px-2 py-1 text-[11px] rounded bg-rose-950 text-rose-300 hover:bg-rose-900 border border-rose-800 cursor-pointer"
                              >
                                취소
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: INVENTORY SOLD OUT MANAGEMENT */}
        {posTab === 'INVENTORY' && (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col space-y-4">
            <div>
              <h2 className="text-sm font-bold text-white mb-1">
                실시간 품절(Sold-Out) 제어 콘솔
              </h2>
              <p className="text-xs text-slate-400">
                스위치를 끄면 키오스크 및 현장 POS에서 해당 메뉴가 즉시 품절 처리되어 주문 접수가 차단됩니다.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 pt-2">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-xs text-white">{item.name}</h4>
                    <span className="text-[11px] text-slate-400 font-mono">
                      ₩{item.price.toLocaleString()}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleItemSoldOut(item.id)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                      item.isSoldOut
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {item.isSoldOut ? (
                      <>
                        <XCircle className="w-3.5 h-3.5" />
                        <span>품절 상태</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>판매 중</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      <ReceiptModal
        order={selectedReceiptOrder}
        onClose={() => setSelectedReceiptOrder(null)}
        title="[POS] 주문 완료 영수증 미리보기"
      />
    </div>
  );
};
