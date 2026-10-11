import React, { useState } from 'react';
import { MenuItem } from '../types/cafe';
import { MenuIcon } from './MenuIcon';
import { Play } from 'lucide-react';

interface MenuMediaDisplayProps {
  item: MenuItem;
  className?: string;
  iconClassName?: string;
  showVideoBadge?: boolean;
}

export const MenuMediaDisplay: React.FC<MenuMediaDisplayProps> = ({
  item,
  className = 'w-full h-full object-cover',
  iconClassName = 'w-12 h-12',
  showVideoBadge = true,
}) => {
  const [imgError, setImgError] = useState(false);

  // 1. Video presentation
  if ((item.mediaType === 'video' || item.videoUrl) && item.videoUrl) {
    return (
      <div className="relative w-full h-full overflow-hidden bg-slate-950 flex items-center justify-center">
        <video
          src={item.videoUrl}
          autoPlay
          loop
          muted
          playsInline
          poster={item.imageUrl}
          className={className}
        />
        {showVideoBadge && (
          <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/75 backdrop-blur-sm text-amber-300 text-[10px] font-bold flex items-center gap-1 shadow-sm border border-amber-500/30">
            <Play className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
            <span>영상 메뉴</span>
          </span>
        )}
      </div>
    );
  }

  // 2. Image presentation
  if ((item.mediaType === 'image' || item.imageUrl) && item.imageUrl && !imgError) {
    return (
      <img
        src={item.imageUrl}
        alt={item.name}
        className={className}
        loading="lazy"
        onError={() => setImgError(true)}
      />
    );
  }

  // 3. Vector Icon presentation (fallback)
  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-900">
      <MenuIcon type={item.iconType} className={iconClassName} />
    </div>
  );
};
