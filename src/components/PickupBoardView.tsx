import React, { useState, useEffect } from 'react';
import { useCafeOrder } from '../context/CafeOrderContext';
import { Maximize2, Minimize2, BellRing, Sparkles, Volume2, Mic } from 'lucide-react';

export const PickupBoardView: React.FC = () => {
  const {
    orders,
    callVoiceOrder,
    voiceEnabled,
    toggleVoice,
    testVoiceAnnouncement,
  } = useCafeOrder();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const preparingOrders = orders
    .filter((o) => o.status === 'PENDING' || o.status === 'COOKING')
    .slice(0, 16);

  const readyOrders = orders
    .filter((o) => o.status === 'READY')
    .slice(0, 8);

  const formattedDate = currentTime.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  const formattedTime = currentTime.toLocaleTimeString('ko-KR', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="flex-1 bg-slate-950 text-white flex flex-col min-h-screen p-4 sm:p-8 select-none">
      {/* Top Header of Pickup Board */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-600 flex items-center justify-center font-black text-2xl shadow-lg shadow-amber-600/30">
            ☕
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              음료 픽업 현황판
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                🎙️ 음성 안내 방송 활성화
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              ATELIER CAFE ORDER STATUS DISPLAY & VOICE ANNOUNCEMENT
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Voice Announcement Controls */}
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={toggleVoice}
              className={`flex items-center gap-1 font-bold cursor-pointer ${
                voiceEnabled ? 'text-emerald-400' : 'text-slate-500 line-through'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>{voiceEnabled ? '음성 호출 켜짐' : '음성 호출 꺼짐'}</span>
            </button>
            <span className="text-slate-700">|</span>
            <button
              type="button"
              onClick={testVoiceAnnouncement}
              className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer flex items-center gap-1"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>음성 테스트</span>
            </button>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-400">{formattedDate}</div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-amber-400">
              {formattedTime}
            </div>
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="전체화면 토글"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main Split Display */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Left Side: PREPARING (준비 중) */}
        <div className="bg-slate-900/60 rounded-3xl border border-slate-800 p-6 flex flex-col shadow-inner">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-slate-500"></span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-300">
                준비 중인 음료
              </h2>
            </div>
            <span className="text-xs uppercase tracking-wider font-mono text-slate-400">
              PREPARING ({preparingOrders.length})
            </span>
          </div>

          {preparingOrders.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
              <span className="text-base">현재 제조 대기 중인 주문이 없습니다.</span>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4 overflow-y-auto pr-1">
              {preparingOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-slate-950/80 rounded-2xl border border-slate-800/80 p-4 flex flex-col items-center justify-center text-center shadow"
                >
                  <span className="text-3xl sm:text-4xl font-black font-mono text-slate-300">
                    {order.orderNumber}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1 font-mono">
                    벨 {order.vibratingBellNumber}번
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: NOW READY (수령 대기 & 음성 호출) */}
        <div className="bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-900 rounded-3xl border-2 border-amber-500/60 p-6 flex flex-col shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-amber-500/30">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <BellRing className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-amber-300">
                  음료가 나왔습니다
                </h2>
                <span className="text-xs text-amber-200/70 uppercase tracking-wider font-mono">
                  PLEASE PICK UP NOW (VOICE CALL ACTIVE)
                </span>
              </div>
            </div>
            <span className="text-sm font-bold font-mono px-3 py-1 rounded-full bg-amber-500 text-slate-950">
              {readyOrders.length}건 호출 중
            </span>
          </div>

          {readyOrders.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-center">
              <Sparkles className="w-10 h-10 mb-2 stroke-amber-500/40" />
              <span className="text-base text-slate-400">호출 대기 중인 음료가 없습니다.</span>
              <span className="text-xs text-slate-500 mt-1">음료 제조가 완료되면 이곳에 번호가 표시되고 음성으로 안내됩니다.</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 overflow-y-auto pr-1">
              {readyOrders.map((order, idx) => (
                <div
                  key={order.id}
                  className={`rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-lg transition-transform relative group ${
                    idx === 0
                      ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-400/50 scale-105'
                      : 'bg-slate-950 border border-amber-500/40 text-white'
                  }`}
                >
                  <span
                    className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${
                      idx === 0 ? 'text-slate-950' : 'text-amber-400'
                    }`}
                  >
                    {order.orderNumber}
                  </span>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`text-xs font-bold font-mono px-2 py-0.5 rounded-full ${
                        idx === 0 ? 'bg-slate-950/20 text-slate-900' : 'bg-slate-800 text-amber-300'
                      }`}
                    >
                      진동벨 #{order.vibratingBellNumber}
                    </span>
                    <span
                      className={`text-xs font-semibold ${
                        idx === 0 ? 'text-slate-900' : 'text-slate-300'
                      }`}
                    >
                      {order.orderType === 'HERE' ? '매장' : '포장'}
                    </span>
                  </div>

                  {/* Quick Voice Re-call button */}
                  <button
                    type="button"
                    onClick={() => callVoiceOrder(order.id)}
                    className={`mt-3 py-1 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      idx === 0
                        ? 'bg-slate-950 text-amber-400 hover:bg-slate-900'
                        : 'bg-amber-600/30 text-amber-300 hover:bg-amber-600/50 border border-amber-500/40'
                    }`}
                    title="목소리로 이 고객 다시 부르기"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>음성 재호출</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Guidance Marquee */}
          <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs sm:text-sm text-slate-400 flex items-center justify-center gap-2">
            <Volume2 className="w-4 h-4 text-amber-400" />
            <span>딩동~ 음성 안내 방송과 함께 번호가 호출되오니 픽업대에서 음료를 수령해 주시기 바랍니다.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
