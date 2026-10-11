import React from 'react';
import { useCafeOrder } from '../context/CafeOrderContext';
import { Volume2, VolumeX, Sparkles, SlidersHorizontal, Columns2, SquareSlash } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    soundEnabled,
    toggleSound,
    isSimpleMode,
    toggleSimpleMode,
    splitView,
    setSplitView,
    stats,
  } = useCafeOrder();

  const navItems = [
    { key: 'kds', label: '👨‍🍳 주방 접수', count: stats.pendingCount + stats.cookingCount },
    { key: 'mobile', label: '📱 스마트폰 주문' },
    { key: 'kiosk', label: '☕ 매장 키오스크' },
    { key: 'menu_manage', label: '🏷️ 메뉴·가격 관리' },
    { key: 'pickup', label: '📢 픽업 전광판', count: stats.readyCount },
    { key: 'pos', label: '🖥️ 카운터 POS' },
    { key: 'analytics', label: '📊 오늘 매출' },
  ] as const;

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand title wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-amber-600 flex items-center justify-center font-bold text-white shadow-sm text-sm">
            ☕
          </div>
          <span className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap">
            카페 주문 관리
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1 scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveTab(item.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-sm font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>{item.label}</span>
                {'count' in item && item.count !== undefined && item.count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded text-[11px] font-mono font-bold ${
                      isActive ? 'bg-amber-800/80 text-amber-100' : 'bg-slate-800 text-amber-400'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Easy Mode Switch & Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Simple vs Pro Mode Toggle */}
          <button
            type="button"
            onClick={toggleSimpleMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
              isSimpleMode
                ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/50 hover:bg-emerald-600/30'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
            title="간편 모드 / 전문가 모드 전환"
          >
            {isSimpleMode ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>간편 모드 (켜짐)</span>
              </>
            ) : (
              <>
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <span>상세 모드</span>
              </>
            )}
          </button>

          {/* Split Screen View Toggle */}
          <button
            type="button"
            onClick={() => setSplitView((v) => !v)}
            title={splitView ? '단일 뷰로 전환' : '화면 분할 (주방+키오스크 동시 확인)'}
            className={`p-2 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1 cursor-pointer ${
              splitView
                ? 'bg-slate-800 border-amber-500/50 text-amber-300'
                : 'border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {splitView ? <SquareSlash className="w-4 h-4" /> : <Columns2 className="w-4 h-4" />}
            <span className="hidden lg:inline text-xs">{splitView ? '단일창' : '화면분할'}</span>
          </button>

          {/* Sound Mute/Unmute */}
          <button
            type="button"
            onClick={toggleSound}
            title={soundEnabled ? '알림 사운드 끄기' : '알림 사운드 켜기'}
            aria-label="알림 사운드 토글"
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
