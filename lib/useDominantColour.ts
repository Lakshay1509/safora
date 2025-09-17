// hooks/useDominantColor.ts
//@ts-nocheck
import { useState, useEffect } from 'react';
import ColorThief from 'colorthief';

interface DominantColorHook {
  dominantColor: string | null;
  isLoading: boolean;
}

export const useDominantColor = (imageUrl: string | undefined): DominantColorHook => {
  const [dominantColor, setDominantColor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!imageUrl) return;

    const extractColor = async (): Promise<void> => {
      setIsLoading(true);
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous'; // Handle CORS
        
        img.onload = (): void => {
          const colorThief = new ColorThief();
          const color: [number, number, number] = colorThief.getColor(img);
          
          // Convert RGB array to CSS rgba
          const rgbaColor: string = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.2)`;
          setDominantColor(rgbaColor);
          setIsLoading(false);
        };
        
        img.onerror = (): void => {
          setIsLoading(false);
          // Fallback color
          setDominantColor('rgba(251, 191, 36, 0.2)');
        };
        
        img.src = imageUrl;
      } catch (error: unknown) {
        console.error('Error extracting dominant color:', error);
        setIsLoading(false);
        setDominantColor('rgba(251, 191, 36, 0.2)');
      }
    };

    extractColor();
  }, [imageUrl]);

  return { dominantColor, isLoading };
};
