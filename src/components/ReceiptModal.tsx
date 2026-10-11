import React, { useState } from 'react';
import { Order } from '../types/cafe';
import { Printer, X, Check, FileText, QrCode } from 'lucide-react';

interface ReceiptModalProps {
  order: Order | null;
  onClose: () => void;
  title?: string;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  order,
  onClose,
  title = '실제 영수증 레이아웃 미리보기',
}) => {
  const [isPrintedToast, setIsPrintedToast] = useState(false);

  if (!order) return null;

  const handlePrint = () => {
    setIsPrintedToast(true);
    setTimeout(() => {
      window.print();
    }, 200);
    setTimeout(() => {
      setIsPrintedToast(false);
    }, 3000);
  };

  const vat = Math.round(order.totalPrice / 11);
  const netAmount = order.totalPrice - vat;

  const formattedDate = new Date(order.createdAt).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const approvalNum = `${(order.orderNumber * 1234567) % 90000000 + 10000000}`;

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in-95">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-5 shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="no-print flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-xs sm:text-sm">{title}</h3>
              <p className="text-[10px] text-slate-400">80mm 서멀 감열지 규격 영수증</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Realistic Thermal Receipt Paper Container */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="receipt-printable-area relative bg-[#FAFAF9] text-[#1C1917] font-mono text-[11px] p-5 rounded-sm shadow-xl border-x border-[#E7E5E4] select-none">
            {/* Top Serrated Edge Graphic */}
            <div className="no-print absolute top-0 left-0 right-0 h-1.5 bg-[radial-gradient(circle,_transparent_3px,_#FAFAF9_3px)] bg-[length:8px_8px] -mt-1" />

            {/* Receipt Header */}
            <div className="text-center pb-3 border-b border-dashed border-neutral-400">
              <h4 className="text-sm font-extrabold tracking-tight font-sans text-neutral-900">
                [ 영 수 증 ]
              </h4>
              <h5 className="text-base font-black tracking-tighter mt-0.5">
                ATELIER COFFEE ROASTERS
              </h5>
              <div className="text-[10px] text-neutral-600 mt-1 space-y-0.5 leading-tight">
                <p>사업자등록번호: 214-85-12345 (대표: 김아틀)</p>
                <p>주소: 서울특별시 강남구 테헤란로 152 1층</p>
                <p>전화: 02-555-7890 · POS #01 (정상승인)</p>
              </div>
            </div>

            {/* Big Order Number Callout */}
            <div className="text-center py-2.5 border-b border-dashed border-neutral-400 bg-neutral-100/70 my-2 rounded">
              <div className="text-[10px] text-neutral-500 font-sans">고 객 주 문 번 호</div>
              <div className="text-3xl font-black tracking-tight text-neutral-950 my-0.5">
                #{order.orderNumber}
              </div>
              <div className="text-[11px] text-neutral-800 font-bold font-sans">
                진동벨: {order.vibratingBellNumber}번 · {order.orderType === 'HERE' ? '매장 식사 (HERE)' : '포장하기 (TOGO)'}
              </div>
              {order.tableNumber && (
                <div className="text-[10px] text-amber-700 font-sans mt-0.5">
                  [{order.tableNumber} 서빙]
                </div>
              )}
            </div>

            {/* Metadata Info */}
            <div className="text-[10px] text-neutral-600 space-y-0.5 border-b border-dashed border-neutral-400 pb-2 mb-2 leading-tight">
              <div className="flex justify-between">
                <span>거래일시:</span>
                <span>{formattedDate}</span>
              </div>
              <div className="flex justify-between">
                <span>주문채널:</span>
                <span>{order.channel === 'MOBILE' ? '모바일 사이렌오더' : order.channel === 'POS' ? '카운터 현장 POS' : '매장 셀프 키오스크'}</span>
              </div>
              <div className="flex justify-between">
                <span>주문상태:</span>
                <span>{order.status}</span>
              </div>
            </div>

            {/* Items Table */}
            <div className="border-b border-dashed border-neutral-400 pb-2.5 mb-2">
              <div className="flex justify-between font-bold border-b border-neutral-300 pb-1 mb-1 text-[10px] text-neutral-700">
                <span className="w-1/2">메뉴명</span>
                <span className="w-1/6 text-center">수량</span>
                <span className="w-1/3 text-right">금액</span>
              </div>

              <div className="space-y-1.5">
                {order.items.map((item, idx) => (
                  <div key={idx} className="leading-tight">
                    <div className="flex justify-between items-start">
                      <span className="w-1/2 font-bold text-neutral-900 truncate">
                        {item.menuName}
                      </span>
                      <span className="w-1/6 text-center font-bold">
                        {item.quantity}
                      </span>
                      <span className="w-1/3 text-right font-bold">
                        {item.itemTotal.toLocaleString()}
                      </span>
                    </div>

                    {/* Options */}
                    <div className="text-[9.5px] text-neutral-500 pl-1 mt-0.5">
                      {item.temperature} / {item.size}
                      {item.options.shot > 0 && ` / +${item.options.shot}샷`}
                      {item.options.milkType && item.options.milkType !== '일반우유' && ` / ${item.options.milkType}`}
                      {item.options.syrup && item.options.syrup !== '기본' && ` / ${item.options.syrup}`}
                      {item.options.iceAmount && ` / ${item.options.iceAmount}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Calculations */}
            <div className="space-y-0.5 border-b border-dashed border-neutral-400 pb-2 mb-2 text-[10px] text-neutral-600">
              <div className="flex justify-between">
                <span>과세 물품가액</span>
                <span>₩{netAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>부 가 세 (10%)</span>
                <span>₩{vat.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-black text-xs pt-1 mt-0.5 text-neutral-950 border-t border-neutral-300">
                <span>청 구 합 계</span>
                <span className="text-sm">₩{order.totalPrice.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="text-[9.5px] text-neutral-600 border-b border-dashed border-neutral-400 pb-2 mb-2 space-y-0.5">
              <div className="flex justify-between">
                <span>결제수단:</span>
                <span className="font-bold text-neutral-900">
                  {order.paymentMethod === 'CARD'
                    ? '신용카드 (IC승인)'
                    : order.paymentMethod === 'EASY_PAY'
                    ? '간편결제 (카카오/애플/토스)'
                    : '현금영수증 (소득공제)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>카드번호:</span>
                <span>9411-****-****-4820 (일시불)</span>
              </div>
              <div className="flex justify-between">
                <span>승인번호:</span>
                <span className="font-mono">{approvalNum}</span>
              </div>
            </div>

            {/* Customer Note */}
            {order.customerNote && (
              <div className="text-[10px] text-neutral-700 bg-neutral-200/60 p-1.5 rounded mb-2">
                요청사항: {order.customerNote}
              </div>
            )}

            {/* Barcode representation */}
            <div className="text-center pt-1">
              <div className="h-8 bg-neutral-900 mx-auto w-40 flex items-center justify-around px-1.5">
                {[...Array(24)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-full bg-white ${
                      i % 4 === 0 ? 'w-1.5' : i % 2 === 0 ? 'w-0.5' : 'w-1'
                    }`}
                  />
                ))}
              </div>
              <div className="text-[9px] text-neutral-500 mt-1 tracking-widest font-mono">
                *{order.id.slice(-8).toUpperCase()}*
              </div>
              <div className="text-[9px] text-neutral-400 mt-1 font-sans">
                감사합니다. 맛있게 드세요!
              </div>
            </div>

            {/* Bottom Serrated Edge Graphic */}
            <div className="no-print absolute bottom-0 left-0 right-0 h-1.5 bg-[radial-gradient(circle,_transparent_3px,_#FAFAF9_3px)] bg-[length:8px_8px] -mb-1" />
          </div>
        </div>

        {/* Toast confirmation */}
        {isPrintedToast && (
          <div className="no-print mt-2 py-1.5 px-3 bg-emerald-600/90 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 animate-in fade-in">
            <Check className="w-3.5 h-3.5" />
            <span>프린터로 영수증이 출력되었습니다.</span>
          </div>
        )}

        {/* Modal Buttons */}
        <div className="no-print mt-3 pt-2 border-t border-slate-800 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer"
          >
            닫기
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>프린터 인쇄</span>
          </button>
        </div>
      </div>
    </div>
  );
};
