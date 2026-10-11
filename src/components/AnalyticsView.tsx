import React, { useMemo } from 'react';
import { useCafeOrder } from '../context/CafeOrderContext';
import { DollarSign, ShoppingCart, Clock, Coffee, TrendingUp, Users } from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { orders, stats } = useCafeOrder();

  // Top Selling Items Calculation
  const topItems = useMemo(() => {
    const itemMap = new Map<string, { name: string; quantity: number; revenue: number }>();

    orders
      .filter((o) => o.status !== 'CANCELLED')
      .forEach((order) => {
        order.items.forEach((item) => {
          const prev = itemMap.get(item.menuName) || { name: item.menuName, quantity: 0, revenue: 0 };
          itemMap.set(item.menuName, {
            name: item.menuName,
            quantity: prev.quantity + item.quantity,
            revenue: prev.revenue + item.itemTotal,
          });
        });
      });

    return Array.from(itemMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [orders]);

  // Hourly Order Volume Distribution
  const hourlyData = useMemo(() => {
    const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    const hourCounts: { [key: number]: number } = {};
    hours.forEach((h) => (hourCounts[h] = 0));

    orders.forEach((o) => {
      const h = new Date(o.createdAt).getHours();
      if (hourCounts[h] !== undefined) {
        hourCounts[h]++;
      }
    });

    const maxCount = Math.max(...Object.values(hourCounts), 1);
    return hours.map((h) => ({
      hour: `${h}시`,
      count: hourCounts[h] || 0,
      heightPercent: Math.min(100, Math.round(((hourCounts[h] || 0) / maxCount) * 100)),
    }));
  }, [orders]);

  // Payment method breakdown
  const paymentBreakdown = useMemo(() => {
    const valid = orders.filter((o) => o.status !== 'CANCELLED');
    const total = valid.length || 1;
    const card = valid.filter((o) => o.paymentMethod === 'CARD').length;
    const easy = valid.filter((o) => o.paymentMethod === 'EASY_PAY').length;
    const cash = valid.filter((o) => o.paymentMethod === 'CASH').length;

    return {
      card: Math.round((card / total) * 100),
      easy: Math.round((easy / total) * 100),
      cash: Math.round((cash / total) * 100),
    };
  }, [orders]);

  const avgOrderValue =
    stats.totalOrdersCount > 0
      ? Math.round(stats.totalRevenue / Math.max(1, stats.totalOrdersCount - stats.cancelledCount))
      : 0;

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 flex flex-col min-h-screen">
      {/* Top Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">
              실시간 매장 운영 및 매출 통계
            </h1>
            <p className="text-xs text-slate-400">
              당일 판매 실적, 피크타임 주문 추이 및 주방 조리 효율 지표
            </p>
          </div>
        </div>

        <div className="text-right text-xs text-slate-400 font-mono">
          기준일시: {new Date().toLocaleDateString('ko-KR')} 실시간 집계
        </div>
      </div>

      <div className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* KPI Strip (4 Columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block mb-1">당일 누적 매출</span>
              <span className="text-2xl font-black font-mono text-amber-400 tracking-tight">
                ₩{stats.totalRevenue.toLocaleString()}
              </span>
              <span className="text-[11px] text-emerald-400 block mt-1">
                실 결제 완료 기준
              </span>
            </div>
            <div className="p-3 bg-slate-800 rounded-xl text-amber-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block mb-1">총 주문 건수</span>
              <span className="text-2xl font-black font-mono text-white tracking-tight">
                {stats.totalOrdersCount}건
              </span>
              <span className="text-[11px] text-slate-400 block mt-1">
                완료 {stats.completedCount}건 · 대기/조리 {stats.pendingCount + stats.cookingCount}건
              </span>
            </div>
            <div className="p-3 bg-slate-800 rounded-xl text-blue-400">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block mb-1">평균 객단가 (AOV)</span>
              <span className="text-2xl font-black font-mono text-white tracking-tight">
                ₩{avgOrderValue.toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-400 block mt-1">
                주문당 평균 지출액
              </span>
            </div>
            <div className="p-3 bg-slate-800 rounded-xl text-purple-400">
              <Coffee className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block mb-1">평균 제조 소요 시간</span>
              <span className="text-2xl font-black font-mono text-emerald-400 tracking-tight">
                {stats.avgPrepTimeMin}분
              </span>
              <span className="text-[11px] text-slate-400 block mt-1">
                조리시작부터 호출까지
              </span>
            </div>
            <div className="p-3 bg-slate-800 rounded-xl text-emerald-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Middle Section: Chart & Best Sellers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hourly Rush Chart (2 Columns width) */}
          <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  시간대별 주문 유입 분포 (피크타임 추이)
                </h3>
                <span className="text-xs text-slate-400 font-mono">08:00 ~ 20:00</span>
              </div>

              {/* Bar Chart Container */}
              <div className="h-56 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-slate-800">
                {hourlyData.map((slot, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    <div className="text-[10px] font-mono font-bold text-slate-400 group-hover:text-amber-300">
                      {slot.count > 0 ? slot.count : ''}
                    </div>
                    <div
                      className="w-full max-w-[28px] rounded-t-md transition-all duration-300 bg-amber-600/70 group-hover:bg-amber-500"
                      style={{ height: `${Math.max(6, slot.heightPercent)}%` }}
                    />
                    <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap">
                      {slot.hour}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-600"></span> 주문 유입량
                </span>
              </div>
              <span className="font-mono text-[11px] text-slate-500">
                * 실시간 주문 생성 시 차트에 즉시 반영됩니다
              </span>
            </div>
          </div>

          {/* Top 5 Best Sellers */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-amber-400" />
                  실시간 인기 메뉴 TOP 5
                </h3>
                <span className="text-xs text-slate-400 font-mono">판매 잔수</span>
              </div>

              <div className="space-y-3.5">
                {topItems.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-500">
                    아직 집계된 판매 데이터가 없습니다
                  </div>
                ) : (
                  topItems.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-medium text-white flex items-center gap-1.5">
                          <span className="font-mono font-bold text-amber-400 w-4">
                            {idx + 1}.
                          </span>
                          {item.name}
                        </span>
                        <span className="font-mono font-bold text-amber-300">
                          {item.quantity}잔
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-500 h-full rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.round((item.quantity / (topItems[0]?.quantity || 1)) * 100)
                            )}%`,
                          }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-500 text-right font-mono">
                        누적 ₩{item.revenue.toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
              <span>매장 이용: <strong className="text-white">{stats.hereRatio}%</strong></span>
              <span>포장: <strong className="text-white">{stats.togoRatio}%</strong></span>
            </div>
          </div>
        </div>

        {/* Bottom Section: Operations Ratio & Payment Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Order Channel & Type */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
            <h3 className="font-bold text-sm text-white mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              이용 형태 분포 (매장 vs 포장)
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between mb-1 text-slate-300">
                  <span>매장 식사 (HERE)</span>
                  <span className="font-mono font-bold">{stats.hereRatio}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full" style={{ width: `${stats.hereRatio}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1 text-slate-300">
                  <span>포장하기 (TOGO)</span>
                  <span className="font-mono font-bold">{stats.togoRatio}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full" style={{ width: `${stats.togoRatio}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
            <h3 className="font-bold text-sm text-white mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-400" />
              결제 수단별 점유율
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between mb-1 text-slate-300">
                  <span>신용/체크카드</span>
                  <span className="font-mono font-bold">{paymentBreakdown.card}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full" style={{ width: `${paymentBreakdown.card}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1 text-slate-300">
                  <span>간편결제 (Apple Pay, Kakao Pay, Naver Pay)</span>
                  <span className="font-mono font-bold">{paymentBreakdown.easy}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full" style={{ width: `${paymentBreakdown.easy}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1 text-slate-300">
                  <span>현금 결제</span>
                  <span className="font-mono font-bold">{paymentBreakdown.cash}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-slate-500 h-full" style={{ width: `${paymentBreakdown.cash}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
