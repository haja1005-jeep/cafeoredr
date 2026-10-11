import React, { useState } from 'react';
import { CafeOrderProvider, useCafeOrder } from './context/CafeOrderContext';
import { Header } from './components/Header';
import { KDSView } from './components/KDSView';
import { SimpleKDSView } from './components/SimpleKDSView';
import { PosView } from './components/PosView';
import { KioskView } from './components/KioskView';
import { MobileOrderView } from './components/MobileOrderView';
import { MenuManagementView } from './components/MenuManagementView';
import { PickupBoardView } from './components/PickupBoardView';
import { AnalyticsView } from './components/AnalyticsView';
import { Flame, Play, PlusCircle, ArrowRight, Smartphone, Settings } from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    splitView,
    isSimpleMode,
    addOneQuickOrder,
    isSimulationActive,
    toggleSimulation,
  } = useCafeOrder();

  const [splitRightMode, setSplitRightMode] = useState<'mobile' | 'kiosk' | 'pickup'>('mobile');

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-100">
      <Header />

      {/* Quick 3-Step Friendly Guide Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-amber-400">💡 3초 사용법:</span>
          <button
            type="button"
            onClick={() => setActiveTab('mobile')}
            className="text-amber-300 font-bold hover:underline cursor-pointer flex items-center gap-1"
          >
            <Smartphone className="w-3.5 h-3.5" />
            1. 스마트폰 주문 & 결제
          </button>
          <ArrowRight className="w-3 h-3 text-slate-500" />
          <button
            type="button"
            onClick={() => setActiveTab('kds')}
            className="text-slate-300 hover:text-white underline decoration-slate-600 cursor-pointer"
          >
            2. 주방에서 [완성! 손님 부르기] 터치
          </button>
          <ArrowRight className="w-3 h-3 text-slate-500" />
          <button
            type="button"
            onClick={() => setActiveTab('pickup')}
            className="text-slate-300 hover:text-white underline decoration-slate-600 cursor-pointer"
          >
            3. 픽업 전광판에서 번호 확인
          </button>
          <span className="text-slate-600">|</span>
          <button
            type="button"
            onClick={() => setActiveTab('menu_manage')}
            className="text-slate-300 hover:text-amber-300 underline decoration-slate-600 cursor-pointer flex items-center gap-1"
          >
            <Settings className="w-3 h-3" />
            사장님 품절·가격 수정
          </button>
        </div>

        <button
          type="button"
          onClick={addOneQuickOrder}
          className="flex items-center gap-1.5 px-3 py-1 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 rounded-lg font-bold transition-all cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>체험 주문 1건 바로 넣기</span>
        </button>
      </div>

      <main className="flex-1 flex flex-col">
        {splitView ? (
          /* Split View Mode: Side-by-side testing of KDS with Smartphone or Kiosk */
          <div className="flex-1 flex flex-col">
            <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs">
              <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" />
                화면 분할 모드 (좌측: 주방 접수 / 우측: 실시간 연동 테스트 화면)
              </span>

              <div className="flex items-center gap-2">
                <span className="text-slate-400">우측 화면:</span>
                <div className="flex items-center p-0.5 bg-slate-950 rounded border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setSplitRightMode('mobile')}
                    className={`px-2.5 py-1 rounded text-xs cursor-pointer ${
                      splitRightMode === 'mobile'
                        ? 'bg-amber-600 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    스마트폰 주문
                  </button>
                  <button
                    type="button"
                    onClick={() => setSplitRightMode('kiosk')}
                    className={`px-2.5 py-1 rounded text-xs cursor-pointer ${
                      splitRightMode === 'kiosk'
                        ? 'bg-amber-600 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    매장 키오스크
                  </button>
                  <button
                    type="button"
                    onClick={() => setSplitRightMode('pickup')}
                    className={`px-2.5 py-1 rounded text-xs cursor-pointer ${
                      splitRightMode === 'pickup'
                        ? 'bg-amber-600 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    픽업 전광판
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-800 min-h-[700px]">
              <div className="flex flex-col overflow-y-auto">
                {isSimpleMode ? <SimpleKDSView /> : <KDSView />}
              </div>
              <div className="flex flex-col overflow-y-auto bg-slate-900">
                {splitRightMode === 'mobile' ? (
                  <MobileOrderView />
                ) : splitRightMode === 'kiosk' ? (
                  <KioskView />
                ) : (
                  <PickupBoardView />
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Single Tab View Mode */
          <div className="flex-1 flex flex-col">
            {activeTab === 'kds' && (isSimpleMode ? <SimpleKDSView /> : <KDSView />)}
            {activeTab === 'mobile' && <MobileOrderView />}
            {activeTab === 'kiosk' && <KioskView />}
            {activeTab === 'menu_manage' && <MenuManagementView />}
            {activeTab === 'pickup' && <PickupBoardView />}
            {activeTab === 'pos' && <PosView />}
            {activeTab === 'analytics' && <AnalyticsView />}
          </div>
        )}
      </main>

      {/* Floating Simulation Rush Status Pill */}
      {isSimulationActive && (
        <div className="fixed bottom-4 right-4 z-40 bg-rose-600 text-white px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-3 border border-rose-400 animate-bounce">
          <Play className="w-4 h-4 fill-white" />
          <span className="text-xs font-bold">
            실시간 피크타임 주문 러시 시뮬레이션 동작 중
          </span>
          <button
            type="button"
            onClick={toggleSimulation}
            className="text-xs underline text-rose-100 hover:text-white cursor-pointer ml-1"
          >
            중지
          </button>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <CafeOrderProvider>
      <AppContent />
    </CafeOrderProvider>
  );
}
