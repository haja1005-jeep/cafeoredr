import React, { useState } from 'react';
import { useCafeOrder } from '../context/CafeOrderContext';
import { MenuItem, MenuCategory } from '../types/cafe';
import { MenuIcon } from './MenuIcon';
import { MenuMediaDisplay } from './MenuMediaDisplay';
import {
  UtensilsCrossed,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Edit3,
  Trash2,
  Save,
  RotateCcw,
  X,
  Server,
  AlertTriangle,
  Code2,
  Database,
  Check,
  Image as ImageIcon,
  Video,
  Upload,
  Play,
  Film,
} from 'lucide-react';

const CAFE_PHOTO_PRESETS = [
  { label: '에스프레소/아메리카노', url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80' },
  { label: '라떼 아트', url: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=600&q=80' },
  { label: '바닐라/아이스라떼', url: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=600&q=80' },
  { label: '콜드브루 글라스', url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80' },
  { label: '아인슈페너 크림', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80' },
  { label: '제주 말차 라떼', url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=600&q=80' },
  { label: '청포도/과일 에이드', url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80' },
  { label: '버터 크루아상', url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80' },
  { label: '딸기 생크림 케이크', url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=600&q=80' },
];

const CAFE_VIDEO_PRESETS = [
  { label: '커피 추출 영상', url: 'https://assets.mixkit.co/videos/preview/mixkit-coffee-being-poured-into-a-cup-32890-large.mp4' },
  { label: '라떼 아트 푸어링 영상', url: 'https://assets.mixkit.co/videos/preview/mixkit-barista-making-a-latte-art-41846-large.mp4' },
  { label: '스팀 밀크 혼합 영상', url: 'https://assets.mixkit.co/videos/preview/mixkit-pouring-milk-into-coffee-32889-large.mp4' },
];

export const MenuManagementView: React.FC = () => {
  const {
    menuItems,
    toggleItemSoldOut,
    updateMenuItemPrice,
    updateMenuItem,
    addMenuItem,
    deleteMenuItem,
    setAllItemsInStock,
  } = useCafeOrder();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | 'sold_out'>('all');
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [priceInputVal, setPriceInputVal] = useState<string>('');

  // Edit item modal
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // In-app Delete Confirmation Modal (fixes iframe window.confirm blocking bug)
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);

  // PHP 8.0 + MySQL Production Guide Modal
  const [isServerGuideOpen, setIsServerGuideOpen] = useState(false);
  const [copiedCodeKey, setCopiedCodeKey] = useState<string | null>(null);

  // New item modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemNameEn, setNewItemNameEn] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<MenuItem['category']>('coffee');
  const [newItemPrice, setNewItemPrice] = useState('5000');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemBadge, setNewItemBadge] = useState<MenuItem['badge'] | 'NONE'>('NEW');
  const [newItemIcon, setNewItemIcon] = useState<MenuItem['iconType']>('espresso');
  const [newItemTemp, setNewItemTemp] = useState<'HOT' | 'ICE' | 'BOTH'>('BOTH');
  const [newItemMediaType, setNewItemMediaType] = useState<'image' | 'video' | 'icon'>('image');
  const [newItemImageUrl, setNewItemImageUrl] = useState<string>(
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80'
  );
  const [newItemVideoUrl, setNewItemVideoUrl] = useState<string>('');

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'image' | 'video',
    isEdit: boolean
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (isEdit) {
        if (target === 'image') {
          setEditingItem((prev) =>
            prev ? { ...prev, mediaType: 'image', imageUrl: dataUrl } : null
          );
        } else {
          setEditingItem((prev) =>
            prev ? { ...prev, mediaType: 'video', videoUrl: dataUrl } : null
          );
        }
      } else {
        if (target === 'image') {
          setNewItemMediaType('image');
          setNewItemImageUrl(dataUrl);
        } else {
          setNewItemMediaType('video');
          setNewItemVideoUrl(dataUrl);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Stats
  const totalCount = menuItems.length;
  const inStockCount = menuItems.filter((m) => !m.isSoldOut).length;
  const soldOutCount = menuItems.filter((m) => m.isSoldOut).length;

  // Filtered Items
  const filteredItems = menuItems.filter((item) => {
    if (selectedCategory === 'sold_out') {
      if (!item.isSoldOut) return false;
    } else if (selectedCategory !== 'all') {
      if (selectedCategory === 'bakery') {
        if (item.category !== 'bakery' && item.category !== 'dessert') return false;
      } else if (item.category !== selectedCategory) {
        return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        item.name.toLowerCase().includes(q) ||
        item.nameEn.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleStartEditPrice = (item: MenuItem) => {
    setEditingPriceId(item.id);
    setPriceInputVal(String(item.price));
  };

  const handleSavePrice = (menuId: string) => {
    const val = parseInt(priceInputVal, 10);
    if (!isNaN(val) && val >= 0) {
      updateMenuItemPrice(menuId, val);
    }
    setEditingPriceId(null);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteMenuItem(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  const handleCreateNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const price = parseInt(newItemPrice, 10) || 5000;
    const temperatures: ('HOT' | 'ICE')[] =
      newItemTemp === 'BOTH' ? ['HOT', 'ICE'] : [newItemTemp];

    addMenuItem({
      name: newItemName.trim(),
      nameEn: newItemNameEn.trim() || 'Custom Beverage',
      category: newItemCategory,
      price,
      description: newItemDesc.trim() || '매장 신규 추천 메뉴',
      temperatures,
      defaultTemp: temperatures[0],
      supportsSize: true,
      isSoldOut: false,
      badge: newItemBadge === 'NONE' ? undefined : newItemBadge,
      prepTimeMin: 3,
      iconType: newItemIcon,
      mediaType: newItemMediaType,
      imageUrl: newItemMediaType === 'image' ? (newItemImageUrl.trim() || undefined) : undefined,
      videoUrl: newItemMediaType === 'video' ? (newItemVideoUrl.trim() || undefined) : undefined,
    });

    setIsAddModalOpen(false);
    // Reset inputs
    setNewItemName('');
    setNewItemNameEn('');
    setNewItemDesc('');
    setNewItemPrice('5000');
    setNewItemImageUrl('https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80');
    setNewItemVideoUrl('');
    setNewItemMediaType('image');
  };

  const handleSaveItemEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    updateMenuItem(editingItem.id, {
      name: editingItem.name,
      nameEn: editingItem.nameEn,
      price: editingItem.price,
      description: editingItem.description,
      badge: editingItem.badge,
      category: editingItem.category,
      iconType: editingItem.iconType,
      mediaType: editingItem.mediaType,
      imageUrl: editingItem.imageUrl,
      videoUrl: editingItem.videoUrl,
    });

    setEditingItem(null);
  };

  const copyToClipboard = (key: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedCodeKey(key);
      setTimeout(() => setCopiedCodeKey(null), 2000);
    });
  };

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 flex flex-col min-h-screen">
      {/* Top Banner & Stats Strip */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center font-bold text-white shadow-sm">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                실시간 메뉴 & 가격 관리 대시보드
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  사장님 전용
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                품절 여부와 가격을 수정하고, 메뉴를 추가/삭제하면 키오스크와 스마트폰에 즉시 반영됩니다.
              </p>
            </div>
          </div>

          {/* Quick Stat Badges & Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono">
              <span className="text-slate-400">전체: <strong>{totalCount}</strong></span>
              <span className="text-slate-700">|</span>
              <span className="text-emerald-400">판매중: <strong>{inStockCount}</strong></span>
              <span className="text-slate-700">|</span>
              <span className="text-rose-400">품절: <strong>{soldOutCount}</strong></span>
            </div>

            {/* PHP/MySQL Guide Button */}
            <button
              type="button"
              onClick={() => setIsServerGuideOpen(true)}
              className="px-3 py-1.5 bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 border border-blue-800 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              title="실전 배포용 PHP 8.0 + MySQL 아파치 연동 가이드 및 DDL 스키마"
            >
              <Server className="w-3.5 h-3.5" />
              <span>PHP/MySQL 실전 연동 안내</span>
            </button>

            {soldOutCount > 0 && (
              <button
                type="button"
                onClick={setAllItemsInStock}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                title="모든 메뉴의 품절을 해제하고 판매 재개"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>품절 전체 해제</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>신규 메뉴 등록</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-5">
        {/* Filter and Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-800">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="메뉴명, 영문명, 설명 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-900 rounded-xl border border-slate-800">
            {[
              { id: 'all', label: `전체 (${totalCount})` },
              { id: 'coffee', label: '에스프레소 & 커피' },
              { id: 'signature', label: '시그니처' },
              { id: 'tea_beverage', label: '티/에이드' },
              { id: 'bakery', label: '베이커리/디저트' },
              { id: 'sold_out', label: `품절 메뉴만 (${soldOutCount})`, isAlert: soldOutCount > 0 },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id as MenuCategory | 'sold_out')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-amber-600 text-white shadow-sm'
                    : cat.isAlert
                    ? 'text-rose-400 hover:text-rose-300'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items Table / Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-500 text-xs">
              검색 조건과 일치하는 메뉴가 없습니다.
            </div>
          ) : (
            filteredItems.map((item) => {
              const isEditingPrice = editingPriceId === item.id;

              return (
                <div
                  key={item.id}
                  className={`bg-slate-900 rounded-2xl border p-4 flex flex-col justify-between transition-all ${
                    item.isSoldOut
                      ? 'border-rose-900/60 bg-rose-950/10'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    {/* Top Row: Icon, Names, Badge */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-16 h-16 bg-slate-950 rounded-xl flex items-center justify-center shrink-0 border border-slate-800 overflow-hidden relative shadow-inner">
                        <MenuMediaDisplay
                          item={item}
                          className="w-full h-full object-cover"
                          iconClassName="w-10 h-10"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-bold text-sm text-white truncate">
                            {item.name}
                          </h3>
                          {item.badge && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">{item.nameEn}</p>
                        <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Controls: Price Editor & Sold-Out Switch */}
                  <div className="pt-3 border-t border-slate-800/80 space-y-3">
                    {/* Price Editor Row */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">판매 가격:</span>

                      {isEditingPrice ? (
                        <div className="flex items-center gap-1.5">
                          <div className="relative">
                            <span className="absolute left-2 top-1 text-xs text-slate-400">₩</span>
                            <input
                              type="number"
                              step="100"
                              value={priceInputVal}
                              onChange={(e) => setPriceInputVal(e.target.value)}
                              className="w-24 pl-5 pr-2 py-1 bg-slate-950 border border-amber-500 rounded-lg text-xs font-mono font-bold text-white focus:outline-none"
                              autoFocus
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSavePrice(item.id)}
                            className="p-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white cursor-pointer"
                            title="가격 저장"
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-base font-extrabold font-mono text-amber-400">
                            ₩{item.price.toLocaleString()}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleStartEditPrice(item)}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                            title="가격 수정하기"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Quick +/- 500원 buttons */}
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="text-slate-500 text-[10px]">빠른 변경:</span>
                      <button
                        type="button"
                        onClick={() => updateMenuItemPrice(item.id, item.price - 500)}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono cursor-pointer"
                      >
                        -500원
                      </button>
                      <button
                        type="button"
                        onClick={() => updateMenuItemPrice(item.id, item.price + 500)}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono cursor-pointer"
                      >
                        +500원
                      </button>
                      <button
                        type="button"
                        onClick={() => updateMenuItemPrice(item.id, item.price + 1000)}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono cursor-pointer"
                      >
                        +1,000원
                      </button>
                    </div>

                    {/* Sold-out Toggle Switch & Edit/Delete Action */}
                    <div className="flex items-center justify-between pt-1">
                      {/* Sold-Out Toggle */}
                      <button
                        type="button"
                        onClick={() => toggleItemSoldOut(item.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          item.isSoldOut
                            ? 'bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900'
                        }`}
                      >
                        {item.isSoldOut ? (
                          <>
                            <XCircle className="w-4 h-4 text-rose-400" />
                            <span>품절 상태 (주문 차단됨)</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>판매 중 (주문 가능)</span>
                          </>
                        )}
                      </button>

                      {/* Modal Edit & Delete */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingItem(item)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                          title="상세 정보 수정"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Working in-app Delete trigger (no blocked window.confirm!) */}
                        <button
                          type="button"
                          onClick={() => setItemToDelete(item)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900 text-slate-400 hover:text-rose-200 cursor-pointer"
                          title="메뉴 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MODAL: IN-APP DELETE CONFIRMATION (Guaranteed to work in all iframe environments) */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in-95">
          <div className="bg-slate-900 border border-rose-500/50 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/40">
                <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">메뉴 삭제 확인</h3>
                <p className="text-xs text-slate-400">정말 이 메뉴를 삭제하시겠습니까?</p>
              </div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center shrink-0 border border-slate-800">
                <MenuIcon type={itemToDelete.iconType} className="w-8 h-8" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-white truncate">{itemToDelete.name}</h4>
                <span className="text-xs font-mono text-amber-400 font-bold block">
                  ₩{itemToDelete.price.toLocaleString()}
                </span>
              </div>
            </div>

            <p className="text-xs text-rose-300 bg-rose-950/40 p-2.5 rounded-lg border border-rose-900/50 leading-relaxed">
              ⚠️ 삭제 시 키오스크, 스마트폰 모바일 주문 및 POS 목록에서 <strong>즉시 완전히 제거</strong>됩니다.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-2.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer"
              >
                취소 (유지하기)
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow transition-colors cursor-pointer"
              >
                삭제 확정하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW MENU ITEM */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleCreateNewItem}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                신규 메뉴 등록
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">메뉴명 (한글)</label>
                <input
                  type="text"
                  required
                  placeholder="예: 헤이즐넛 크림 라떼"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">영문명 (English)</label>
                <input
                  type="text"
                  placeholder="예: Hazelnut Cream Latte"
                  value={newItemNameEn}
                  onChange={(e) => setNewItemNameEn(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">카테고리</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as MenuItem['category'])}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="coffee">에스프레소 & 커피</option>
                    <option value="signature">시그니처 라떼</option>
                    <option value="tea_beverage">티 & 에이드</option>
                    <option value="bakery">베이커리</option>
                    <option value="dessert">디저트 / 케이크</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">기본 판매 가격 (원)</label>
                  <input
                    type="number"
                    step="100"
                    required
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">메뉴 설명</label>
                <textarea
                  rows={2}
                  placeholder="풍미와 재료에 대한 간단한 설명을 입력하세요"
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">뱃지 태그</label>
                  <select
                    value={newItemBadge}
                    onChange={(e) => setNewItemBadge(e.target.value as MenuItem['badge'] | 'NONE')}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="NEW">NEW (신메뉴)</option>
                    <option value="BEST">BEST (인기)</option>
                    <option value="SIGNATURE">SIGNATURE (시그니처)</option>
                    <option value="SEASON">SEASON (시즌한정)</option>
                    <option value="NONE">없음</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">비주얼 아이콘</label>
                  <select
                    value={newItemIcon}
                    onChange={(e) => setNewItemIcon(e.target.value as MenuItem['iconType'])}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="espresso">에스프레소 잔</option>
                    <option value="latte">라떼 머그컵</option>
                    <option value="coldbrew">콜드브루 유리잔</option>
                    <option value="tea">티 찻잔</option>
                    <option value="ade">에이드 유리컵</option>
                    <option value="bakery">크루아상 빵</option>
                    <option value="cake">케이크 조각</option>
                  </select>
                </div>
              </div>

              {/* MEDIA SELECTOR: IMAGE / VIDEO / ICON */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-slate-200 font-bold flex items-center gap-1.5 text-xs">
                    <Film className="w-3.5 h-3.5 text-amber-400" />
                    <span>메뉴 미디어 (사진 / 동영상 등록)</span>
                  </label>
                  <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setNewItemMediaType('image')}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        newItemMediaType === 'image'
                          ? 'bg-amber-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <ImageIcon className="w-3 h-3" />
                      <span>사진</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewItemMediaType('video')}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        newItemMediaType === 'video'
                          ? 'bg-amber-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Video className="w-3 h-3" />
                      <span>영상</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewItemMediaType('icon')}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        newItemMediaType === 'icon'
                          ? 'bg-amber-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>아이콘</span>
                    </button>
                  </div>
                </div>

                {/* IMAGE MODE */}
                {newItemMediaType === 'image' && (
                  <div className="space-y-2">
                    <label className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-900 hover:bg-slate-850 border border-dashed border-slate-700 hover:border-amber-500 rounded-xl cursor-pointer text-slate-300 hover:text-white font-medium transition-all">
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>내 기기에서 사진 파일 업로드</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'image', false)}
                      />
                    </label>

                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1">또는 이미지 URL 직접 입력:</span>
                      <input
                        type="url"
                        value={newItemImageUrl}
                        onChange={(e) => setNewItemImageUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-[11px]"
                      />
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1">빠른 추천 카페 사진:</span>
                      <div className="flex flex-wrap gap-1">
                        {CAFE_PHOTO_PRESETS.map((p, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setNewItemImageUrl(p.url)}
                            className={`px-2 py-0.5 text-[10px] rounded border cursor-pointer ${
                              newItemImageUrl === p.url
                                ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {newItemImageUrl && (
                      <div className="flex items-center gap-2.5 bg-slate-900 p-2 rounded-xl border border-slate-800">
                        <img
                          src={newItemImageUrl}
                          alt="미리보기"
                          className="w-14 h-14 rounded-lg object-cover border border-slate-700 shrink-0"
                        />
                        <div className="text-[11px] text-slate-400 leading-tight">
                          <span className="text-emerald-400 font-bold block mb-0.5">✓ 사진 미리보기</span>
                          키오스크 및 모바일 화면에 고화질 사진으로 표시됩니다.
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* VIDEO MODE */}
                {newItemMediaType === 'video' && (
                  <div className="space-y-2">
                    <label className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-900 hover:bg-slate-850 border border-dashed border-slate-700 hover:border-amber-500 rounded-xl cursor-pointer text-slate-300 hover:text-white font-medium transition-all">
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>내 기기에서 동영상 파일 업로드 (MP4, WebM)</span>
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'video', false)}
                      />
                    </label>

                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1">또는 동영상 웹 URL (MP4) 입력:</span>
                      <input
                        type="url"
                        value={newItemVideoUrl}
                        onChange={(e) => setNewItemVideoUrl(e.target.value)}
                        placeholder="https://...mp4"
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-[11px]"
                      />
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1">빠른 추천 카페 동영상:</span>
                      <div className="flex flex-wrap gap-1">
                        {CAFE_VIDEO_PRESETS.map((p, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setNewItemVideoUrl(p.url)}
                            className={`px-2 py-0.5 text-[10px] rounded border cursor-pointer ${
                              newItemVideoUrl === p.url
                                ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            🎬 {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {newItemVideoUrl && (
                      <div className="flex items-center gap-2.5 bg-slate-900 p-2 rounded-xl border border-slate-800">
                        <video
                          src={newItemVideoUrl}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-14 h-14 rounded-lg object-cover border border-slate-700 shrink-0"
                        />
                        <div className="text-[11px] text-slate-400 leading-tight">
                          <span className="text-amber-400 font-bold block mb-0.5">🎬 동영상 루프 미리보기</span>
                          키오스크 및 모바일에서 메뉴 영상이 자동 반복 재생됩니다.
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">온도 옵션</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['BOTH', 'ICE', 'HOT'] as const).map((temp) => (
                    <button
                      key={temp}
                      type="button"
                      onClick={() => setNewItemTemp(temp)}
                      className={`py-1.5 rounded-lg border text-center transition-all ${
                        newItemTemp === temp
                          ? 'bg-amber-600 text-white font-bold border-amber-500'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {temp === 'BOTH' ? 'ICE/HOT 모두' : temp === 'ICE' ? 'ICE 전용' : 'HOT 전용'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 py-2.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl"
              >
                취소
              </button>
              <button
                type="submit"
                className="flex-2 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow"
              >
                신규 메뉴 등록 완료
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: EDIT EXISTING MENU ITEM */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSaveItemEdit}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                메뉴 정보 수정
              </h3>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">메뉴명</label>
                <input
                  type="text"
                  required
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">영문명</label>
                <input
                  type="text"
                  value={editingItem.nameEn}
                  onChange={(e) => setEditingItem({ ...editingItem, nameEn: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">판매 가격 (원)</label>
                <input
                  type="number"
                  step="100"
                  required
                  value={editingItem.price}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, price: parseInt(e.target.value, 10) || 0 })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">설명</label>
                <textarea
                  rows={2}
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">뱃지</label>
                  <select
                    value={editingItem.badge || 'NONE'}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        badge: e.target.value === 'NONE' ? undefined : (e.target.value as any),
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="NONE">없음</option>
                    <option value="BEST">BEST</option>
                    <option value="SIGNATURE">SIGNATURE</option>
                    <option value="NEW">NEW</option>
                    <option value="SEASON">SEASON</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">아이콘</label>
                  <select
                    value={editingItem.iconType}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        iconType: e.target.value as MenuItem['iconType'],
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="espresso">에스프레소</option>
                    <option value="latte">라떼</option>
                    <option value="coldbrew">콜드브루</option>
                    <option value="tea">티</option>
                    <option value="ade">에이드</option>
                    <option value="bakery">베이커리</option>
                    <option value="cake">케이크</option>
                  </select>
                </div>
              </div>

              {/* MEDIA SELECTOR: IMAGE / VIDEO / ICON IN EDIT MODAL */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-slate-200 font-bold flex items-center gap-1.5 text-xs">
                    <Film className="w-3.5 h-3.5 text-amber-400" />
                    <span>메뉴 미디어 (사진 / 동영상 수정)</span>
                  </label>
                  <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setEditingItem({ ...editingItem, mediaType: 'image' })}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        editingItem.mediaType === 'image' || (!editingItem.mediaType && editingItem.imageUrl)
                          ? 'bg-amber-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <ImageIcon className="w-3 h-3" />
                      <span>사진</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingItem({ ...editingItem, mediaType: 'video' })}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        editingItem.mediaType === 'video'
                          ? 'bg-amber-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Video className="w-3 h-3" />
                      <span>영상</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingItem({ ...editingItem, mediaType: 'icon' })}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        editingItem.mediaType === 'icon'
                          ? 'bg-amber-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>아이콘</span>
                    </button>
                  </div>
                </div>

                {/* EDIT IMAGE MODE */}
                {(editingItem.mediaType === 'image' || (!editingItem.mediaType && editingItem.imageUrl)) && (
                  <div className="space-y-2">
                    <label className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-900 hover:bg-slate-850 border border-dashed border-slate-700 hover:border-amber-500 rounded-xl cursor-pointer text-slate-300 hover:text-white font-medium transition-all">
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>새 사진 파일로 교체 업로드</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'image', true)}
                      />
                    </label>

                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1">이미지 웹 URL:</span>
                      <input
                        type="url"
                        value={editingItem.imageUrl || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-[11px]"
                      />
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1">추천 카페 사진으로 변경:</span>
                      <div className="flex flex-wrap gap-1">
                        {CAFE_PHOTO_PRESETS.map((p, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setEditingItem({ ...editingItem, imageUrl: p.url, mediaType: 'image' })}
                            className={`px-2 py-0.5 text-[10px] rounded border cursor-pointer ${
                              editingItem.imageUrl === p.url
                                ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {editingItem.imageUrl && (
                      <div className="flex items-center gap-2.5 bg-slate-900 p-2 rounded-xl border border-slate-800">
                        <img
                          src={editingItem.imageUrl}
                          alt="미리보기"
                          className="w-14 h-14 rounded-lg object-cover border border-slate-700 shrink-0"
                        />
                        <div className="text-[11px] text-slate-400 leading-tight">
                          <span className="text-emerald-400 font-bold block mb-0.5">✓ 현재 사진 미리보기</span>
                          키오스크 및 스마트폰에 이 사진이 노출됩니다.
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* EDIT VIDEO MODE */}
                {editingItem.mediaType === 'video' && (
                  <div className="space-y-2">
                    <label className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-900 hover:bg-slate-850 border border-dashed border-slate-700 hover:border-amber-500 rounded-xl cursor-pointer text-slate-300 hover:text-white font-medium transition-all">
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>새 동영상 파일로 교체 업로드 (MP4, WebM)</span>
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'video', true)}
                      />
                    </label>

                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1">동영상 웹 URL (MP4):</span>
                      <input
                        type="url"
                        value={editingItem.videoUrl || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, videoUrl: e.target.value })}
                        placeholder="https://...mp4"
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-[11px]"
                      />
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1">추천 카페 영상으로 변경:</span>
                      <div className="flex flex-wrap gap-1">
                        {CAFE_VIDEO_PRESETS.map((p, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setEditingItem({ ...editingItem, videoUrl: p.url, mediaType: 'video' })}
                            className={`px-2 py-0.5 text-[10px] rounded border cursor-pointer ${
                              editingItem.videoUrl === p.url
                                ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            🎬 {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {editingItem.videoUrl && (
                      <div className="flex items-center gap-2.5 bg-slate-900 p-2 rounded-xl border border-slate-800">
                        <video
                          src={editingItem.videoUrl}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-14 h-14 rounded-lg object-cover border border-slate-700 shrink-0"
                        />
                        <div className="text-[11px] text-slate-400 leading-tight">
                          <span className="text-amber-400 font-bold block mb-0.5">🎬 동영상 루프 미리보기</span>
                          키오스크 및 모바일에서 메뉴 영상이 자동 반복 재생됩니다.
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  const target = editingItem;
                  setEditingItem(null);
                  setItemToDelete(target);
                }}
                className="px-3 py-2 text-xs text-rose-400 hover:text-white bg-rose-950/60 hover:bg-rose-900 border border-rose-900 rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>이 메뉴 삭제</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer"
                >
                  닫기
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow cursor-pointer"
                >
                  수정 저장
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: APACHE + PHP 8.0 + MYSQL PRODUCTION INTEGRATION GUIDE */}
      {isServerGuideOpen && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    Apache + PHP 8.0 + MySQL 실전 실시간 아키텍처 가이드
                  </h3>
                  <p className="text-xs text-slate-400">
                    전통적인 웹호스팅/카페 서버 환경에서 실시간 주문 연동 방법
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsServerGuideOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Answer explanation */}
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="bg-blue-950/40 p-4 rounded-2xl border border-blue-900/60 space-y-2">
                <h4 className="font-bold text-sm text-blue-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  Q. Apache + PHP 8.0 + MySQL 환경에서 실시간 주문이 이뤄지나요?
                </h4>
                <p>
                  <strong>네, 100% 가능합니다!</strong> 실제로 수많은 프랜차이즈 및 중소형 스마트오더 시스템이 <strong>PHP + MySQL 환경</strong>에서 아주 안정적으로 서비스되고 있습니다.
                </p>
                <p className="text-slate-400">
                  카페 매장 특성상 동시 기기(키오스크 1~2대, 주방 KDS 1~2대, 픽업모니터 1대, 손님 스마트폰 수십 대)는 트래픽이 크지 않으므로, 복잡한 웹소켓 데몬 없이도 <strong>초경량 REST Polling</strong> 또는 <strong>PHP SSE (Server-Sent Events)</strong> 방식으로 <strong>0.5초~1초 미만 지연</strong>으로 완벽한 실시간 주문이 구현됩니다.
                </p>
              </div>

              {/* 1. MySQL DDL */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-amber-400" />
                    1. 권장 MySQL 테이블 스키마 (DDL)
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        'sql',
                        `-- 1. 메뉴 테이블
CREATE TABLE \`menu_items\` (
  \`id\` VARCHAR(50) PRIMARY KEY,
  \`name\` VARCHAR(100) NOT NULL,
  \`name_en\` VARCHAR(100) NULL,
  \`category\` VARCHAR(30) NOT NULL,
  \`price\` INT NOT NULL DEFAULT 0,
  \`description\` TEXT NULL,
  \`is_sold_out\` TINYINT(1) NOT NULL DEFAULT 0,
  \`badge\` VARCHAR(20) NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. 주문 마스터 테이블
CREATE TABLE \`orders\` (
  \`id\` VARCHAR(60) PRIMARY KEY,
  \`order_number\` INT NOT NULL,
  \`vibrating_bell_number\` INT NULL,
  \`order_type\` ENUM('HERE', 'TOGO') NOT NULL DEFAULT 'HERE',
  \`channel\` ENUM('KIOSK', 'MOBILE', 'POS') NOT NULL DEFAULT 'MOBILE',
  \`table_number\` VARCHAR(20) NULL,
  \`customer_phone\` VARCHAR(20) NULL,
  \`total_price\` INT NOT NULL DEFAULT 0,
  \`payment_method\` VARCHAR(20) NOT NULL DEFAULT 'CARD',
  \`status\` ENUM('PENDING', 'COOKING', 'READY', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
  \`customer_note\` VARCHAR(255) NULL,
  \`created_at\` BIGINT NOT NULL,
  \`cooking_started_at\` BIGINT NULL,
  \`ready_at\` BIGINT NULL,
  \`completed_at\` BIGINT NULL,
  INDEX \`idx_status_created\` (\`status\`, \`created_at\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. 주문 상세 품목 테이블
CREATE TABLE \`order_items\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`order_id\` VARCHAR(60) NOT NULL,
  \`menu_id\` VARCHAR(50) NOT NULL,
  \`menu_name\` VARCHAR(100) NOT NULL,
  \`price\` INT NOT NULL,
  \`quantity\` INT NOT NULL DEFAULT 1,
  \`temperature\` ENUM('HOT', 'ICE') NOT NULL,
  \`size\` VARCHAR(20) NOT NULL DEFAULT 'Regular',
  \`options_json\` JSON NULL,
  \`item_total\` INT NOT NULL,
  FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
                      )
                    }
                    className="text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 font-mono flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCodeKey === 'sql' ? <Check className="w-3 h-3 text-emerald-400" /> : <Code2 className="w-3 h-3" />}
                    <span>{copiedCodeKey === 'sql' ? '복사됨!' : 'SQL 스크립트 복사'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 rounded-xl overflow-x-auto text-[11px] font-mono text-slate-300 max-h-36">
{`-- 1. 메뉴 테이블
CREATE TABLE \`menu_items\` (
  \`id\` VARCHAR(50) PRIMARY KEY,
  \`name\` VARCHAR(100) NOT NULL,
  \`price\` INT NOT NULL DEFAULT 0,
  \`is_sold_out\` TINYINT(1) NOT NULL DEFAULT 0,
  \`category\` VARCHAR(30) NOT NULL
);

-- 2. 주문 테이블
CREATE TABLE \`orders\` (
  \`id\` VARCHAR(60) PRIMARY KEY,
  \`order_number\` INT NOT NULL,
  \`status\` ENUM('PENDING', 'COOKING', 'READY', 'COMPLETED', 'CANCELLED'),
  \`total_price\` INT NOT NULL,
  \`created_at\` BIGINT NOT NULL
);`}
                </pre>
              </div>

              {/* 2. PHP Real-time Script Example */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Code2 className="w-4 h-4 text-emerald-400" />
                    2. PHP 8.0 실시간 폴링/주문 API 예시 (api/get_orders.php)
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        'php',
                        `<?php
// api/get_orders.php (PHP 8.0 + MySQL PDO)
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$pdo = new PDO('mysql:host=localhost;dbname=cafe_db;charset=utf8mb4', 'root', 'password', [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
]);

// 클라이언트가 보낸 마지막 확인 시각
$since = isset($_GET['since']) ? (int)$_GET['since'] : 0;

$stmt = $pdo->prepare("SELECT * FROM orders WHERE created_at > :since OR status IN ('PENDING', 'COOKING', 'READY') ORDER BY created_at DESC LIMIT 50");
$stmt->execute([':since' => $since]);
$orders = $stmt->fetchAll();

// 주문 품목 함께 병합
foreach ($orders as &$order) {
    $itemStmt = $pdo->prepare("SELECT * FROM order_items WHERE order_id = :order_id");
    $itemStmt->execute([':order_id' => $order['id']]);
    $order['items'] = $itemStmt->fetchAll();
}

echo json_encode(['success' => true, 'orders' => $orders]);
`
                      )
                    }
                    className="text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 font-mono flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCodeKey === 'php' ? <Check className="w-3 h-3 text-emerald-400" /> : <Code2 className="w-3 h-3" />}
                    <span>{copiedCodeKey === 'php' ? '복사됨!' : 'PHP 코드 복사'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 rounded-xl overflow-x-auto text-[11px] font-mono text-slate-300 max-h-36">
{`<?php
// 1초 주기로 클라이언트가 fetch('/api/get_orders.php?since=' + lastTime) 호출
$stmt = $pdo->prepare("SELECT * FROM orders WHERE status IN ('PENDING', 'COOKING', 'READY')");
$stmt->execute();
echo json_encode(['orders' => $stmt->fetchAll()]);`}
                </pre>
              </div>

              {/* 3. Operational Tips */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1 text-slate-400">
                <span className="font-bold text-white block mb-1">💡 실전 팁 & 요약:</span>
                <p>1. <strong>클라이언트 연동</strong>: 현재 프론트엔드 React 앱의 `CafeOrderContext`에서 `fetch('/api/get_orders.php')`와 `fetch('/api/create_order.php')`만 연결해주면 그대로 동작합니다.</p>
                <p>2. <strong>반응 속도</strong>: 1~1.5초 간격의 HTTP Polling은 MySQL에 인덱스만 걸려 있으면 서버 부하가 거의 0에 가깝고, 지연 없이 주문이 즉시 들어옵니다.</p>
                <p>3. <strong>품절 & 가격</strong>: 사장님이 `api/update_menu.php`로 가격이나 품절을 업데이트하면, 키오스크와 스마트폰이 다음 요청 시 즉시 새 가격과 품절 상태를 받아옵니다.</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsServerGuideOpen(false)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
