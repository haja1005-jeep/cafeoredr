import React, { useState } from 'react';
import { useCafeOrder } from '../context/CafeOrderContext';
import { Order } from '../types/cafe';
import { Check, Bell, Coffee, Sparkles, PlusCircle, Volume2, Mic, Settings2 } from 'lucide-react';
import { VoiceStyle } from '../utils/voice';

export const SimpleKDSView: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    addOneQuickOrder,
    callVoiceOrder,
    testVoiceAnnouncement,
    voiceStyle,
    setVoiceStyle,
    voiceEnabled,
    toggleVoice,
    lastUpdatedOrderId,
  } = useCafeOrder();

  const [isVoiceSettingOpen, setIsVoiceSettingOpen] = useState(false);

  // In simple mode:
  // "만들어야 할 주문" (PENDING or COOKING)
  const cookingQueue = orders.filter((o) => o.status === 'PENDING' || o.status === 'COOKING');

  // "손님 찾는 중" (READY)
  const pickupQueue = orders.filter((o) => o.status === 'READY');

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 flex flex-col min-h-screen">
      {/* Friendly Guide & Voice Announcement Control Banner */}
      <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 border-b border-amber-500/30 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">☕</span>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              초간단 주방 접수대 (Easy Mode)
              <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                쉬운 사용 모드
              </span>
            </h2>
            <p className="text-xs text-slate-300">
              만들 음료를 확인하고 <strong className="text-emerald-400">「완성! 손님 부르기」</strong>를 누르면 딩동~ 목소리로 손님을 호출합니다.
            </p>
          </div>
        </div>

        {/* Voice Announcement Controls & 1-Click Test Order button */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Voice status pill & test button */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={toggleVoice}
              className={`flex items-center gap-1 font-bold cursor-pointer ${
                voiceEnabled ? 'text-emerald-400' : 'text-slate-500 line-through'
              }`}
              title="음성 안내 켜기/끄기"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>{voiceEnabled ? '음성 호출 ON' : '음성 호출 OFF'}</span>
            </button>

            <span className="text-slate-700">|</span>

            <button
              type="button"
              onClick={testVoiceAnnouncement}
              className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer flex items-center gap-1"
              title="목소리 안내 테스트 재생"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>목소리 테스트</span>
            </button>

            <button
              type="button"
              onClick={() => setIsVoiceSettingOpen((v) => !v)}
              className="text-slate-400 hover:text-white p-0.5"
              title="음성 멘트 설정"
            >
              <Settings2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={addOneQuickOrder}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>체험 주문 1건 넣기</span>
          </button>
        </div>
      </div>

      {/* Voice Style Quick Settings Dropdown */}
      {isVoiceSettingOpen && (
        <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3 text-xs animate-in slide-in-from-top">
          <div className="flex items-center gap-2">
            <span className="font-bold text-amber-400">🎙️ 목소리 호출 멘트 선택:</span>
            <div className="flex items-center gap-1.5">
              {[
                { id: 'standard', label: '표준형 (101번 고객님 음료 나왔습니다)' },
                { id: 'friendly', label: '친절형 (감사합니다. 101번 고객님...)' },
                { id: 'menu_detail', label: '메뉴명 포함 (101번 고객님, 아메리카노 나왔습니다)' },
              ].map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setVoiceStyle(style.id as VoiceStyle)}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    voiceStyle === style.id
                      ? 'bg-amber-600 text-white font-bold'
                      : 'bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsVoiceSettingOpen(false)}
            className="text-slate-400 hover:text-white text-xs underline"
          >
            닫기
          </button>
        </div>
      )}

      {/* 2 Big Clear Columns */}
      <div className="flex-1 p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl w-full mx-auto">
        {/* Column 1: 지금 만들어야 할 음료 */}
        <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-6 flex flex-col shadow-xl">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg">
                <Coffee className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white">
                  1. 지금 만들어야 할 음료
                </h3>
                <span className="text-xs text-slate-400">
                  주방에서 조리 중인 주문
                </span>
              </div>
            </div>
            <span className="text-xl font-black font-mono px-3.5 py-1 rounded-full bg-amber-500 text-slate-950">
              {cookingQueue.length}건
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {cookingQueue.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-center">
                <Sparkles className="w-10 h-10 mb-2 stroke-slate-600" />
                <span className="text-base text-slate-400 font-medium">대기 중인 주문이 없습니다!</span>
                <span className="text-xs text-slate-500 mt-1">
                  상단의 [체험 주문 1건 넣기]를 눌러보세요.
                </span>
              </div>
            ) : (
              cookingQueue.map((order) => (
                <SimpleCookingCard
                  key={order.id}
                  order={order}
                  isHighlighted={order.id === lastUpdatedOrderId}
                  onComplete={() => updateOrderStatus(order.id, 'READY')}
                />
              ))
            )}
          </div>
        </div>

        {/* Column 2: 음료 완성! 손님 찾는 중 (픽업 대기 & 목소리 재호출) */}
        <div className="bg-slate-900/80 rounded-3xl border border-emerald-500/40 p-6 flex flex-col shadow-xl">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-emerald-500/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-emerald-300">
                  2. 픽업대에서 손님 찾는 중
                </h3>
                <span className="text-xs text-slate-400">
                  전광판 & 음성으로 손님을 부르는 중입니다
                </span>
              </div>
            </div>
            <span className="text-xl font-black font-mono px-3.5 py-1 rounded-full bg-emerald-500 text-slate-950">
              {pickupQueue.length}건
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {pickupQueue.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-center">
                <Bell className="w-10 h-10 mb-2 stroke-slate-600" />
                <span className="text-base text-slate-400 font-medium">호출 대기 중인 손님이 없습니다</span>
                <span className="text-xs text-slate-500 mt-1">
                  왼쪽에서 음료를 완성하면 딩동~ 음성과 함께 이곳으로 이동합니다.
                </span>
              </div>
            ) : (
              pickupQueue.map((order) => (
                <SimpleReadyCard
                  key={order.id}
                  order={order}
                  onReCallVoice={() => callVoiceOrder(order.id)}
                  onFinish={() => updateOrderStatus(order.id, 'COMPLETED')}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SimpleCookingCard: React.FC<{
  order: Order;
  isHighlighted: boolean;
  onComplete: () => void;
}> = ({ order, isHighlighted, onComplete }) => {
  return (
    <div
      className={`bg-slate-950 p-5 rounded-2xl border transition-all ${
        isHighlighted
          ? 'border-amber-400 ring-2 ring-amber-400/50'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Big Order Number & Tag */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black font-mono text-white">
            #{order.orderNumber}
          </span>
          <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg">
            진동벨 {order.vibratingBellNumber}번
          </span>
          {order.channel === 'MOBILE' && (
            <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
              스마트폰 주문
            </span>
          )}
        </div>

        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
            order.orderType === 'HERE'
              ? 'bg-blue-900/60 text-blue-200'
              : 'bg-emerald-900/60 text-emerald-200'
          }`}
        >
          {order.orderType === 'HERE' ? '매장' : '포장'}
        </span>
      </div>

      {/* Item List with Large Clean Text */}
      <div className="py-4 space-y-2.5">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                  item.temperature === 'ICE'
                    ? 'bg-blue-600/30 text-blue-300'
                    : 'bg-rose-600/30 text-rose-300'
                }`}
              >
                {item.temperature}
              </span>
              <span className="text-base font-bold text-white">
                {item.menuName}
              </span>
              {item.options.shot > 0 && (
                <span className="text-xs font-bold text-amber-400">
                  +{item.options.shot}샷
                </span>
              )}
            </div>

            <span className="text-xl font-black font-mono text-amber-400">
              {item.quantity}잔
            </span>
          </div>
        ))}

        {order.customerNote && (
          <div className="mt-2 p-2 rounded-xl bg-slate-900 text-xs text-amber-300 font-medium">
            💬 {order.customerNote}
          </div>
        )}
      </div>

      {/* 1 Big Green Finish Button (Triggers Voice) */}
      <button
        type="button"
        onClick={onComplete}
        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
      >
        <Check className="w-5 h-5 stroke-[3]" />
        <span>완성! 손님 부르기 (목소리 안내 📢)</span>
      </button>
    </div>
  );
};

const SimpleReadyCard: React.FC<{
  order: Order;
  onReCallVoice: () => void;
  onFinish: () => void;
}> = ({ order, onReCallVoice, onFinish }) => {
  return (
    <div className="bg-slate-950 p-5 rounded-2xl border border-emerald-500/30 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-emerald-400">
              #{order.orderNumber}
            </span>
            <span className="text-xs font-bold text-slate-300 bg-slate-800 px-2.5 py-1 rounded-lg">
              진동벨 {order.vibratingBellNumber}번
            </span>
          </div>
          <span className="text-xs font-bold text-emerald-400 animate-pulse flex items-center gap-1">
            <Volume2 className="w-3.5 h-3.5" />
            <span>음성 호출 완료</span>
          </span>
        </div>

        <div className="py-3 text-xs text-slate-300 space-y-1">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between">
              <span>{item.menuName}</span>
              <span className="font-mono font-bold text-white">{item.quantity}잔</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2 mt-2 pt-2 border-t border-slate-800/80">
        {/* Re-Call Voice button if customer is not coming */}
        <button
          type="button"
          onClick={onReCallVoice}
          className="w-full py-2.5 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          title="손님이 안 오실 때 목소리로 다시 부르기"
        >
          <Volume2 className="w-4 h-4" />
          <span>목소리로 다시 부르기 (재호출)</span>
        </button>

        <button
          type="button"
          onClick={onFinish}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
        >
          손님께 음료 전달 완료
        </button>
      </div>
    </div>
  );
};
