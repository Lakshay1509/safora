"use client"
import { useState, useCallback } from 'react';

export const useImagePreview = () => {
  const [preview, setPreview] = useState<string | null>(null);

  const createPreview = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const clearPreview = useCallback(() => {
    setPreview(null);
  }, []);

  return { preview, createPreview, clearPreview };
};
