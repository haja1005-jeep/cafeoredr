import React, { useState, useEffect } from 'react';
import { useCafeOrder } from '../context/CafeOrderContext';
import { Order, OrderStatus } from '../types/cafe';
import { Clock, CheckCircle2, Flame, BellRing, RotateCcw, AlertTriangle, Coffee, ShoppingBag, X, Volume2 } from 'lucide-react';

export const KDSView: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    cancelOrder,
    callVoiceOrder,
    clearCompleted,
    resetSampleOrders,
    lastUpdatedOrderId,
  } = useCafeOrder();

  const [filterType, setFilterType] = useState<'ALL' | 'ACTIVE' | 'HERE' | 'TOGO'>('ACTIVE');
  const [now, setNow] = useState(Date.now());
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [cancelReasonInput, setCancelReasonInput] = useState('');

  // Update clock every second for live elapsed time counters
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatElapsed = (startTime: number) => {
    const diffSec = Math.max(0, Math.floor((now - startTime) / 1000));
    const m = Math.floor(diffSec / 60);
    const s = diffSec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const getUrgencyLevel = (order: Order): 'normal' | 'warning' | 'urgent' => {
    if (order.status === 'COMPLETED' || order.status === 'CANCELLED') return 'normal';
    const diffMin = (now - order.createdAt) / 1000 / 60;
    if (diffMin > 7) return 'urgent';
    if (diffMin > 4) return 'warning';
    return 'normal';
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    if (filterType === 'ACTIVE') {
      return order.status === 'PENDING' || order.status === 'COOKING' || order.status === 'READY';
    }
    if (filterType === 'HERE') return order.orderType === 'HERE';
    if (filterType === 'TOGO') return order.orderType === 'TOGO';
    return true; // ALL
  });

  const pendingOrders = filteredOrders.filter((o) => o.status === 'PENDING');
  const cookingOrders = filteredOrders.filter((o) => o.status === 'COOKING');
  const readyOrders = filteredOrders.filter((o) => o.status === 'READY');
  const completedOrders = filteredOrders.filter((o) => o.status === 'COMPLETED').slice(0, 8);

  const totalCupsToMake = [...pendingOrders, ...cookingOrders].reduce(
    (sum, ord) => sum + ord.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0
  );

  const handleConfirmCancel = () => {
    if (cancellingOrderId) {
      cancelOrder(cancellingOrderId, cancelReasonInput || '재료 소진 또는 고객 요청');
      setCancellingOrderId(null);
      setCancelReasonInput('');
    }
  };

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 flex flex-col min-h-screen">
      {/* KDS Control Toolbar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-amber-500/10 text-amber-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">
              주방 디스플레이 시스템 (KDS)
            </h1>
            <p className="text-xs text-slate-400">
              실시간 조리 대기 <span className="text-amber-400 font-mono font-bold">{pendingOrders.length + cookingOrders.length}건</span> · 
              제조 필요 음료 <span className="text-amber-400 font-mono font-bold">{totalCupsToMake}잔</span>
            </p>
          </div>
        </div>

        {/* Filter segment tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-800/80 rounded-lg border border-slate-700/60">
          <button
            type="button"
            onClick={() => setFilterType('ACTIVE')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
              filterType === 'ACTIVE'
                ? 'bg-amber-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            진행 중 ({pendingOrders.length + cookingOrders.length + readyOrders.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
              filterType === 'ALL'
                ? 'bg-amber-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            전체 내역 ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('HERE')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
              filterType === 'HERE'
                ? 'bg-amber-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            매장만
          </button>
          <button
            type="button"
            onClick={() => setFilterType('TOGO')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
              filterType === 'TOGO'
                ? 'bg-amber-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            포장만
          </button>
        </div>

        {/* Action utilities */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={clearCompleted}
            className="px-2.5 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors whitespace-nowrap cursor-pointer"
            title="완료 및 취소된 지난 주문 목록 정리"
          >
            완료 내역 정리
          </button>
          <button
            type="button"
            onClick={resetSampleOrders}
            className="px-2.5 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer"
            title="데모용 샘플 주문으로 재설정"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>샘플 리셋</span>
          </button>
        </div>
      </div>

      {/* 4 Column Kitchen Pipeline */}
      <div className="flex-1 p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 overflow-x-auto">
        {/* Column 1: PENDING (접수 대기) */}
        <div className="flex flex-col bg-slate-900/60 rounded-xl border border-slate-800 p-3 min-h-[500px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <h2 className="text-sm font-bold text-white">신규 접수 대기</h2>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
              {pendingOrders.length}건
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 mt-3 pr-1">
            {pendingOrders.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-slate-500 text-xs">
                <Coffee className="w-6 h-6 mb-2 stroke-slate-600" />
                대기 중인 신규 주문이 없습니다
              </div>
            ) : (
              pendingOrders.map((order) => (
                <KdsOrderCard
                  key={order.id}
                  order={order}
                  urgency={getUrgencyLevel(order)}
                  elapsedText={formatElapsed(order.createdAt)}
                  isHighlighted={order.id === lastUpdatedOrderId}
                  onPrimaryAction={() => updateOrderStatus(order.id, 'COOKING')}
                  primaryLabel="제조 시작"
                  primaryColor="bg-amber-600 hover:bg-amber-500"
                  onCancel={() => setCancellingOrderId(order.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Column 2: COOKING (제조 중) */}
        <div className="flex flex-col bg-slate-900/60 rounded-xl border border-slate-800 p-3 min-h-[500px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
              <h2 className="text-sm font-bold text-white">제조 중</h2>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
              {cookingOrders.length}건
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 mt-3 pr-1">
            {cookingOrders.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-slate-500 text-xs">
                <Flame className="w-6 h-6 mb-2 stroke-slate-600" />
                현재 제조 중인 주문이 없습니다
              </div>
            ) : (
              cookingOrders.map((order) => (
                <KdsOrderCard
                  key={order.id}
                  order={order}
                  urgency={getUrgencyLevel(order)}
                  elapsedText={formatElapsed(order.createdAt)}
                  isHighlighted={order.id === lastUpdatedOrderId}
                  onPrimaryAction={() => updateOrderStatus(order.id, 'READY')}
                  primaryLabel="제조 완료 (고객 호출)"
                  primaryColor="bg-emerald-600 hover:bg-emerald-500"
                  onCancel={() => setCancellingOrderId(order.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Column 3: READY (픽업 대기) */}
        <div className="flex flex-col bg-slate-900/60 rounded-xl border border-slate-800 p-3 min-h-[500px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <h2 className="text-sm font-bold text-white">픽업 대기 (호출 중)</h2>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
              {readyOrders.length}건
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 mt-3 pr-1">
            {readyOrders.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-slate-500 text-xs">
                <BellRing className="w-6 h-6 mb-2 stroke-slate-600" />
                픽업 대기 중인 주문이 없습니다
              </div>
            ) : (
              readyOrders.map((order) => (
                <KdsOrderCard
                  key={order.id}
                  order={order}
                  urgency={getUrgencyLevel(order)}
                  elapsedText={formatElapsed(order.createdAt)}
                  isHighlighted={order.id === lastUpdatedOrderId}
                  onPrimaryAction={() => updateOrderStatus(order.id, 'COMPLETED')}
                  primaryLabel="수령 완료"
                  primaryColor="bg-slate-700 hover:bg-slate-600"
                  onVoiceCall={() => callVoiceOrder(order.id)}
                  onCancel={() => setCancellingOrderId(order.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Column 4: COMPLETED (최근 완료) */}
        <div className="flex flex-col bg-slate-900/40 rounded-xl border border-slate-800/80 p-3 min-h-[500px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
              <h2 className="text-sm font-bold text-slate-300">최근 완료 내역</h2>
            </div>
            <span className="text-xs font-mono text-slate-400">
              최근 {completedOrders.length}건
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 mt-3 pr-1">
            {completedOrders.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-slate-600 text-xs">
                <CheckCircle2 className="w-6 h-6 mb-2 stroke-slate-700" />
                최근 완료된 주문이 없습니다
              </div>
            ) : (
              completedOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-3 text-xs text-slate-400"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-200 text-sm font-mono">
                      주문 #{order.orderNumber}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {order.orderType === 'HERE' ? '매장' : '포장'}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-slate-300">
                        <span>{item.menuName}</span>
                        <span className="font-mono text-slate-400">{item.quantity}잔</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 pt-1 border-t border-slate-800/60 flex justify-between items-center text-[11px] text-slate-400 font-mono">
                    <span>합계: ₩{order.totalPrice.toLocaleString()}</span>
                    <span className="text-emerald-500 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> 수령완료
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Cancel Reason Modal */}
      {cancellingOrderId && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                주문 취소 및 환불 처리
              </h3>
              <button
                type="button"
                onClick={() => setCancellingOrderId(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-300 mb-3">
              해당 주문을 취소 상태로 변경합니다. 취소 사유를 입력하거나 확인을 눌러주세요.
            </p>
            <input
              type="text"
              placeholder="예: 고객 단순 변심, 우유 재고 부족"
              value={cancelReasonInput}
              onChange={(e) => setCancelReasonInput(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCancellingOrderId(null)}
                className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 rounded"
              >
                닫기
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-3 py-1.5 text-xs text-white bg-rose-600 hover:bg-rose-500 rounded font-medium"
              >
                주문 취소 확정
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface KdsOrderCardProps {
  order: Order;
  urgency: 'normal' | 'warning' | 'urgent';
  elapsedText: string;
  isHighlighted: boolean;
  onPrimaryAction: () => void;
  primaryLabel: string;
  primaryColor: string;
  onVoiceCall?: () => void;
  onCancel: () => void;
}

const KdsOrderCard: React.FC<KdsOrderCardProps> = ({
  order,
  urgency,
  elapsedText,
  isHighlighted,
  onPrimaryAction,
  primaryLabel,
  primaryColor,
  onVoiceCall,
  onCancel,
}) => {
  const urgencyStyles = {
    normal: 'border-slate-800 bg-slate-900',
    warning: 'border-amber-600/70 bg-amber-950/20',
    urgent: 'border-rose-600/80 bg-rose-950/20',
  }[urgency];

  return (
    <div
      className={`rounded-lg p-3.5 border transition-all duration-300 flex flex-col justify-between ${urgencyStyles} ${
        isHighlighted ? 'ring-2 ring-amber-400' : ''
      }`}
    >
      <div>
        {/* Card Header: Order No, Bell No, Type, Time */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black font-mono text-white tracking-tight">
              #{order.orderNumber}
            </span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono font-medium">
              벨 {order.vibratingBellNumber}번
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                order.orderType === 'HERE'
                  ? 'bg-blue-900/60 text-blue-200 border border-blue-700/50'
                  : 'bg-emerald-900/60 text-emerald-200 border border-emerald-700/50 flex items-center gap-1'
              }`}
            >
              {order.orderType === 'HERE' ? (
                '매장'
              ) : (
                <>
                  <ShoppingBag className="w-3 h-3" />
                  <span>포장</span>
                </>
              )}
            </span>
            <div
              className={`flex items-center gap-1 font-mono text-xs font-bold ${
                urgency === 'urgent'
                  ? 'text-rose-400 animate-pulse'
                  : urgency === 'warning'
                  ? 'text-amber-400'
                  : 'text-slate-400'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>{elapsedText}</span>
            </div>
          </div>
        </div>

        {/* Card Body: Items */}
        <div className="py-2.5 space-y-2 border-b border-slate-800/80">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`text-[10px] font-bold px-1 rounded ${
                      item.temperature === 'ICE'
                        ? 'bg-blue-600/30 text-blue-300'
                        : 'bg-rose-600/30 text-rose-300'
                    }`}
                  >
                    {item.temperature}
                  </span>
                  {item.size === 'Large' && (
                    <span className="text-[10px] font-bold px-1 rounded bg-slate-800 text-slate-300">
                      L
                    </span>
                  )}
                  <span className="font-bold text-white text-xs">{item.menuName}</span>
                </div>

                {/* Sub-options: shot, milk, syrup, ice */}
                <div className="text-[11px] text-slate-400 pl-1 mt-0.5 space-x-1">
                  {item.options.shot > 0 && (
                    <span className="text-amber-400">+{item.options.shot}샷</span>
                  )}
                  {item.options.milkType && item.options.milkType !== '일반우유' && (
                    <span className="text-sky-300">{item.options.milkType}</span>
                  )}
                  {item.options.syrup && item.options.syrup !== '기본' && (
                    <span className="text-purple-300">{item.options.syrup}</span>
                  )}
                  {item.options.sweetness && item.options.sweetness !== '기본(100%)' && (
                    <span className="text-pink-300">{item.options.sweetness}</span>
                  )}
                  {item.options.iceAmount && item.options.iceAmount !== '얼음 보통' && (
                    <span className="text-blue-300">{item.options.iceAmount}</span>
                  )}
                </div>
              </div>

              {/* Quantity */}
              <div className="text-base font-extrabold font-mono text-amber-300 shrink-0">
                ×{item.quantity}
              </div>
            </div>
          ))}
        </div>

        {/* Customer Special Note */}
        {order.customerNote && (
          <div className="mt-2 p-1.5 rounded bg-slate-800/70 text-[11px] text-amber-200 border border-slate-700/50">
            💬 {order.customerNote}
          </div>
        )}
      </div>

      {/* Card Actions: Primary Button, Voice Callout & Cancel button */}
      <div className="mt-3 flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={onPrimaryAction}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg text-white transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer ${primaryColor}`}
        >
          <span>{primaryLabel}</span>
        </button>

        {onVoiceCall && (
          <button
            type="button"
            onClick={onVoiceCall}
            className="p-2 text-amber-300 hover:text-amber-200 bg-amber-600/30 hover:bg-amber-600/50 rounded-lg border border-amber-500/40 transition-colors cursor-pointer"
            title="목소리로 이 고객 다시 부르기"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        )}

        <button
          type="button"
          onClick={onCancel}
          className="p-2 text-slate-400 hover:text-rose-400 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          title="주문 취소"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
