import React from 'react';

interface MenuIconProps {
  type: 'espresso' | 'latte' | 'coldbrew' | 'tea' | 'ade' | 'bakery' | 'cake';
  className?: string;
}

export const MenuIcon: React.FC<MenuIconProps> = ({ type, className = 'w-10 h-10' }) => {
  switch (type) {
    case 'espresso':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="64" rx="12" fill="#2E231D" />
          <path d="M20 28H44V42C44 46.4183 40.4183 50 36 50H28C23.5817 50 20 46.4183 20 42V28Z" fill="#EAD8C7" />
          <path d="M44 32H48C50.2091 32 52 33.7909 52 36V38C52 40.2091 50.2091 42 48 42H44" stroke="#EAD8C7" strokeWidth="3" strokeLinecap="round" />
          <path d="M16 52H48" stroke="#D1B89D" strokeWidth="3" strokeLinecap="round" />
          {/* Steam */}
          <path d="M26 18C26 21 28 23 28 25" stroke="#C9A887" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
          <path d="M34 16C34 20 37 22 37 25" stroke="#C9A887" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
          {/* Crema layer */}
          <ellipse cx="32" cy="30" rx="10" ry="3" fill="#A86E3C" />
        </svg>
      );

    case 'latte':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="64" rx="12" fill="#3B2F2F" />
          <path d="M18 24H46V42C46 47.5228 41.5228 52 36 52H28C22.4772 52 18 47.5228 18 42V24Z" fill="#F5EBE1" />
          <path d="M46 30H50C52.2091 30 54 31.7909 54 34V38C54 40.2091 52.2091 42 50 42H46" stroke="#F5EBE1" strokeWidth="3.5" strokeLinecap="round" />
          {/* Latte Art Heart */}
          <ellipse cx="32" cy="27" rx="12" ry="4" fill="#C29267" />
          <path d="M32 30C32 30 28 26.5 28 25C28 23.5 29.5 23 30.5 24C31.5 25 32 26 32 26C32 26 32.5 25 33.5 24C34.5 23 36 23.5 36 25C36 26.5 32 30 32 30Z" fill="#FFFDF9" />
          <path d="M15 54H49" stroke="#DFCFBE" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case 'coldbrew':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="64" rx="12" fill="#1C242B" />
          {/* Glass body */}
          <path d="M22 18H42L40 50C40 52.2 38.2 54 36 54H28C25.8 54 24 52.2 24 50L22 18Z" fill="#3A281E" stroke="#718096" strokeWidth="2.5" />
          {/* Ice cubes inside */}
          <rect x="26" y="24" width="6" height="6" rx="1" fill="#FFFFFF" fillOpacity="0.45" />
          <rect x="33" y="32" width="6" height="6" rx="1" fill="#FFFFFF" fillOpacity="0.4" />
          {/* Straw */}
          <path d="M36 10L32 24" stroke="#E2E8F0" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'tea':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="64" rx="12" fill="#203328" />
          <path d="M19 26H45V40C45 45.5228 40.5228 50 35 50H29C23.4772 50 19 45.5228 19 40V26Z" fill="#E8F3EB" />
          <path d="M45 32H49C51.2 32 53 33.8 53 36C53 38.2 51.2 40 49 40H45" stroke="#E8F3EB" strokeWidth="3" strokeLinecap="round" />
          {/* Tea Leaf Accent */}
          <path d="M32 30C35 28 39 31 38 35C35 37 31 34 32 30Z" fill="#4B865B" />
          <path d="M32 30L36 34" stroke="#31633F" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M16 52H48" stroke="#BCD4C2" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'ade':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="64" rx="12" fill="#1C2833" />
          {/* Glass */}
          <path d="M21 16H43L40 51C40 52.8 38.5 54 36.7 54H27.3C25.5 54 24 52.8 24 51L21 16Z" fill="#3D5A80" fillOpacity="0.8" stroke="#84A98C" strokeWidth="2" />
          {/* Fruit slice */}
          <circle cx="34" cy="24" r="5" fill="#F4A261" />
          <circle cx="28" cy="40" r="1.5" fill="#E0FBFC" />
          <circle cx="35" cy="36" r="1.5" fill="#E0FBFC" />
          {/* Straw */}
          <path d="M38 8L31 22" stroke="#E63946" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'bakery':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="64" rx="12" fill="#332415" />
          {/* Croissant crescent */}
          <path d="M16 38C18 28 26 22 32 22C38 22 46 28 48 38C44 41 38 43 32 43C26 43 20 41 16 38Z" fill="#E5983B" />
          <path d="M25 24C27 27 28 32 28 40" stroke="#B86D1F" strokeWidth="2" strokeLinecap="round" />
          <path d="M39 24C37 27 36 32 36 40" stroke="#B86D1F" strokeWidth="2" strokeLinecap="round" />
          <path d="M32 22V43" stroke="#995310" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'cake':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="64" rx="12" fill="#2E1C22" />
          {/* Slice */}
          <path d="M16 44L48 44L48 32L16 36V44Z" fill="#FFF5EB" />
          <path d="M16 36L38 20L48 32L16 36Z" fill="#FAD4D8" />
          <line x1="16" y1="40" x2="48" y2="40" stroke="#E6A5A5" strokeWidth="2" />
          {/* Strawberry */}
          <path d="M36 17C37 13 41 13 42 16C43 19 39 23 37 23C35 23 35 20 36 17Z" fill="#E63946" />
          <path d="M38 13L39 15" stroke="#2A9D8F" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
  }
};
