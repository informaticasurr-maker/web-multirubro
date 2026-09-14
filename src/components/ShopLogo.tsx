import React, { useState, useEffect } from 'react';
import { Scissors } from 'lucide-react';

interface ShopLogoProps {
  logoUrl?: string;
  shopName: string;
  sizeClass?: string;
  containerClass?: string;
  iconClass?: string;
}

export const ShopLogo: React.FC<ShopLogoProps> = ({
  logoUrl,
  shopName,
  sizeClass = 'w-10 h-10',
  containerClass = 'rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 p-0.5 shadow-lg shadow-amber-500/10',
  iconClass = 'w-5 h-5 text-amber-400 transform -rotate-45',
}) => {
  const [hasError, setHasError] = useState(false);

  // Reset error state if logoUrl changes
  useEffect(() => {
    setHasError(false);
  }, [logoUrl]);

  const hasValidLogo = !!logoUrl && logoUrl.trim().length > 0 && !hasError;

  return (
    <div
      className={`${sizeClass} ${containerClass} flex items-center justify-center flex-shrink-0`}
    >
      <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center overflow-hidden">
        {hasValidLogo ? (
          <img
            src={logoUrl}
            alt={shopName || 'Logo de la barbería'}
            onError={() => setHasError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <Scissors className={iconClass} />
        )}
      </div>
    </div>
  );
};
