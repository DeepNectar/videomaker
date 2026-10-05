import { useState, useCallback } from 'react';

export interface MediaItem {
  id: string;
  file: File;
  url: string;
  type: 'image' | 'video';
  name: string;
  duration?: number;
}

export type RomanticEffect =
  | 'dreamy-zoom'
  | 'soft-rotate'
  | 'heart-pulse'
  | 'gentle-drift'
  | 'rose-fade'
  | 'silk-flow'
  | 'starlight'
  | 'whisper'
  | 'embrace'
  | 'moonlight';

export const ROMANTIC_EFFECTS: RomanticEffect[] = [
  'dreamy-zoom',
  'soft-rotate',
  'heart-pulse',
  'gentle-drift',
  'rose-fade',
  'silk-flow',
  'starlight',
  'whisper',
  'embrace',
  'moonlight',
];

export const ROMANTIC_EFFECT_META: Record<
  RomanticEffect,
  { label: string; icon: string; description: string }
> = {
  'dreamy-zoom': { label: 'Dreamy Zoom', icon: '💫', description: 'Soft zoom with dreamy blur' },
  'soft-rotate': { label: 'Soft Rotate', icon: '🌸', description: 'Gentle elegant rotation' },
  'heart-pulse': { label: 'Heart Pulse', icon: '💗', description: 'Romantic heartbeat scale' },
  'gentle-drift': { label: 'Gentle Drift', icon: '🕊️', description: 'Floating like a feather' },
  'rose-fade': { label: 'Rose Fade', icon: '🌹', description: 'Fade with rose-like grace' },
  'silk-flow': { label: 'Silk Flow', icon: '🎀', description: 'Smooth silk-like wave' },
  starlight: { label: 'Starlight', icon: '✨', description: 'Sparkling star entrance' },
  whisper: { label: 'Whisper', icon: '💭', description: 'Soft whispering fade' },
  embrace: { label: 'Embrace', icon: '🤍', description: 'Warm zoom-in embrace' },
  moonlight: { label: 'Moonlight', icon: '🌙', description: 'Slow moonlit pan' },
};

export interface SlideshowSettings {
  randomEffects: boolean;
  fixedEffect: RomanticEffect;
  slideDuration: number;
  transitionDuration: number;
  backgroundColor: string;
  musicEnabled: boolean;
  romanticParticles: boolean;
}

export function useMediaManager() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [settings, setSettings] = useState<SlideshowSettings>({
    randomEffects: true,
    fixedEffect: 'dreamy-zoom',
    slideDuration: 3,
    transitionDuration: 1.2,
    backgroundColor: '#1a0a1e',
    musicEnabled: false,
    romanticParticles: true,
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
