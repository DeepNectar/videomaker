import { useState, useCallback } from 'react';

export interface MediaItem {
  id: string;
  file: File;
  url: string;
  type: 'image' | 'video';
  name: string;
  duration?: number;
}

export type EffectType = 'rotate3d' | 'zoom-rotate' | 'carousel' | 'flip' | 'spiral' | 'wave';

export interface SlideshowSettings {
  effect: EffectType;
  slideDuration: number; // in seconds
  transitionDuration: number; // in seconds
  backgroundColor: string;
  musicEnabled: boolean;
}

export function useMediaManager() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [settings, setSettings] = useState<SlideshowSettings>({
    effect: 'rotate3d',
    slideDuration: 3,
    transitionDuration: 1,
    backgroundColor: '#0f0f23',
    musicEnabled: false,
  });

  const addMedia = useCallback((files: FileList | File[]) => {
    const newItems: MediaItem[] = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      file,
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'video' : 'image',
      name: file.name,
    }));
    setMediaItems((prev) => [...prev, ...newItems]);
  }, []);

  const removeMedia = useCallback((id: string) => {
    setMediaItems((prev) => {
      const item = prev.find((m) => m.id === id);
      if (item) URL.revokeObjectURL(item.url);
      return prev.filter((m) => m.id !== id);
    });
  }, []);

  const reorderMedia = useCallback((fromIndex: number, toIndex: number) => {
    setMediaItems((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    mediaItems.forEach((item) => URL.revokeObjectURL(item.url));
    setMediaItems([]);
  }, [mediaItems]);

  return {
    mediaItems,
    settings,
    setSettings,
    addMedia,
    removeMedia,
    reorderMedia,
    clearAll,
  };
}
