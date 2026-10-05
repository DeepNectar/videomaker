import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Heart, Sparkles } from 'lucide-react';
import { MediaItem, SlideshowSettings, RomanticEffect, ROMANTIC_EFFECTS } from '../hooks/useMediaManager';

interface SlideshowPreviewProps {
  items: MediaItem[];
  settings: SlideshowSettings;
  canvasRef?: React.RefObject<HTMLCanvasElement>;
  isExporting?: boolean;
}

// Romantic effect variants - each slide gets a different random one
const getRomanticVariants = (effect: RomanticEffect) => {
  switch (effect) {
    case 'dreamy-zoom':
      return {
        initial: { opacity: 0, scale: 0.6, filter: 'blur(20px)' },
        animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
        exit: { opacity: 0, scale: 1.3, filter: 'blur(15px)' },
        transition: { duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] },
      };
    case 'soft-rotate':
      return {
        initial: { opacity: 0, rotate: -15, scale: 0.8 },
        animate: { opacity: 1, rotate: 0, scale: 1 },
        exit: { opacity: 0, rotate: 15, scale: 0.8 },
        transition: { duration: 1.8, ease: 'easeInOut' },
      };
    case 'heart-pulse':
      return {
        initial: { opacity: 0, scale: 0.3 },
        animate: { opacity: 1, scale: [0.3, 1.1, 0.95, 1.02, 1] },
        exit: { opacity: 0, scale: 0.5 },
        transition: { duration: 1.5, times: [0, 0.3, 0.5, 0.7, 1] },
      };
    case 'gentle-drift':
      return {
        initial: { opacity: 0, y: 80, x: -40, rotate: -5 },
        animate: { opacity: 1, y: 0, x: 0, rotate: 0 },
        exit: { opacity: 0, y: -80, x: 40, rotate: 5 },
        transition: { duration: 2, ease: [0.22, 1, 0.36, 1] },
      };
    case 'rose-fade':
      return {
        initial: { opacity: 0, scale: 1.2, rotate: 3 },
        animate: { opacity: 1, scale: 1, rotate: 0 },
        exit: { opacity: 0, scale: 0.9, rotate: -3 },
        transition: { duration: 1.6, ease: 'easeOut' },
      };
    case 'silk-flow':
      return {
        initial: { opacity: 0, x: -200, skewX: 10, scale: 0.9 },
        animate: { opacity: 1, x: 0, skewX: 0, scale: 1 },
        exit: { opacity: 0, x: 200, skewX: -10, scale: 0.9 },
        transition: { duration: 1.8, ease: [0.45, 0, 0.55, 1] },
      };
    case 'starlight':
      return {
        initial: { opacity: 0, scale: 0, rotate: -180 },
        animate: { opacity: 1, scale: [0, 1.2, 1], rotate: 0 },
        exit: { opacity: 0, scale: [1, 1.2, 0], rotate: 180 },
        transition: { duration: 1.4, times: [0, 0.6, 1] },
      };
    case 'whisper':
      return {
        initial: { opacity: 0, y: 30, scale: 0.95, filter: 'blur(8px)' },
        animate: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' },
        exit: { opacity: 0, y: -30, scale: 0.95, filter: 'blur(8px)' },
        transition: { duration: 2, ease: [0.4, 0, 0.2, 1] },
      };
    case 'embrace':
      return {
        initial: { opacity: 0, scale: 1.5, filter: 'blur(10px)' },
        animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
        exit: { opacity: 0, scale: 0.7, filter: 'blur(10px)' },
        transition: { duration: 1.6, ease: [0.34, 1.56, 0.64, 1] },
      };
    case 'moonlight':
      return {
        initial: { opacity: 0, x: 100, y: -50, rotate: 5, scale: 0.9 },
        animate: { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 },
        exit: { opacity: 0, x: -100, y: 50, rotate: -5, scale: 0.9 },
        transition: { duration: 2, ease: [0.25, 0.46, 0.45, 0.94] },
      };
    default:
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 1 },
      };
  }
};

// Get a random romantic effect (different from the given one)
const getRandomEffect = (exclude?: RomanticEffect): RomanticEffect => {
  const available = ROMANTIC_EFFECTS.filter((e) => e !== exclude);
  return available[Math.floor(Math.random() * available.length)];
};

// Generate random effect assignments for each slide
const generateEffectMap = (count: number, random: boolean, fixed: RomanticEffect): RomanticEffect[] => {
  if (!random) return Array(count).fill(fixed);
  const effects: RomanticEffect[] = [];
  let lastEffect: RomanticEffect | undefined;
  for (let i = 0; i < count; i++) {
    const effect = getRandomEffect(lastEffect);
    effects.push(effect);
    lastEffect = effect;
  }
  return effects;
};

export default function SlideshowPreview({
  items,
  settings,
  isExporting = false,
}: SlideshowPreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [effectMap, setEffectMap] = useState<RomanticEffect[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSlides = items.length;
  const slideDurationMs = settings.slideDuration * 1000;

  // Generate effect map when items change or settings change
  useEffect(() => {
    setEffectMap(generateEffectMap(totalSlides, settings.randomEffects, settings.fixedEffect));
  }, [totalSlides, settings.randomEffects, settings.fixedEffect]);

  const currentEffect = effectMap[currentIndex] || 'dreamy-zoom';
  const effectVariants = getRomanticVariants(currentEffect);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
    setProgress(0);
  }, [totalSlides]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
    setProgress(0);
  }, [totalSlides]);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const restart = useCallback(() => {
    setCurrentIndex(0);
    setProgress(0);
    setIsPlaying(true);
    // Re-randomize effects
    setEffectMap(generateEffectMap(totalSlides, settings.randomEffects, settings.fixedEffect));
  }, [totalSlides, settings.randomEffects, settings.fixedEffect]);

  // Auto-play logic
  useEffect(() => {
    if (isPlaying && totalSlides > 0) {
      intervalRef.current = setInterval(goToNext, slideDurationMs);
      progressRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) return 0;
          return prev + 100 / (slideDurationMs / 50);
        });
      }, 50);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [isPlaying, slideDurationMs, goToNext, totalSlides]);

  // Export mode
  useEffect(() => {
    if (isExporting && totalSlides > 0) {
      const exportInterval = setInterval(goToNext, slideDurationMs);
      return () => clearInterval(exportInterval);
    }
  }, [isExporting, goToNext, slideDurationMs, totalSlides]);

  // Auto-start
  useEffect(() => {
    if (items.length > 0 && !isPlaying) {
      setIsPlaying(true);
    }
  }, [items.length]);

  // Romantic floating particles
  const romanticParticles = useMemo(() => {
    return [...Array(12)].map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 4,
      duration: 4 + Math.random() * 6,
      delay: Math.random() * 3,
      type: i % 3 === 0 ? 'heart' : i % 3 === 1 ? 'star' : 'dot',
    }));
  }, []);

  if (totalSlides === 0) {
    return (
      <div className="w-full aspect-[9/16] max-h-[80vh] mx-auto bg-gradient-to-br from-pink-950/50 via-purple-950/50 to-rose-950/50 rounded-2xl flex items-center justify-center border border-pink-800/30">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            className="inline-block mb-4"
          >
            <Heart className="h-16 w-16 text-pink-400/50" fill="currentColor" />
          </motion.div>
          <p className="text-pink-200/70 text-lg">Upload your memories</p>
          <p className="text-pink-300/40 text-sm mt-2">
            Romantic slideshow with random dreamy effects awaits ✨
          </p>
        </div>
      </div>
    );
  }

  const currentItem = items[currentIndex];

  return (
    <div className="w-full">
      {/* Preview Area */}
      <div
        className="relative w-full aspect-[9/16] max-h-[80vh] mx-auto rounded-2xl overflow-hidden border border-pink-800/30 shadow-2xl shadow-pink-500/10"
        style={{
          background: `radial-gradient(ellipse at center, ${settings.backgroundColor} 0%, #0a0010 100%)`,
        }}
      >
        {/* Romantic ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)',
            }}
            animate={{
              x: [0, 30, -20, 0],
              y: [0, -20, 30, 0],
              scale: [1, 1.2, 0.9, 1],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)',
            }}
            animate={{
              x: [0, -30, 20, 0],
              y: [0, 20, -30, 0],
              scale: [1, 0.8, 1.3, 1],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Main slide content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentItem.id}
            initial={effectVariants.initial}
            animate={effectVariants.animate}
            exit={effectVariants.exit}
            transition={effectVariants.transition}
            className="absolute inset-0 flex items-center justify-center"
            style={{ perspective: '1200px' }}
          >
            {currentItem.type === 'image' ? (
              <motion.img
                src={currentItem.url}
                alt={currentItem.name}
                className="max-w-[85%] max-h-[85%] object-contain rounded-lg shadow-2xl shadow-black/50"
                animate={
                  isPlaying
                    ? {
                        scale: [1, 1.02, 1],
                        y: [0, -5, 0],
                      }
                    : {}
                }
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ) : (
              <video
                src={currentItem.url}
                className="max-w-[85%] max-h-[85%] object-contain rounded-lg shadow-2xl shadow-black/50"
                autoPlay
                muted
                loop
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Romantic floating particles */}
        {settings.romanticParticles &&
          romanticParticles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute pointer-events-none"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
              }}
              animate={{
                y: [0, -60, -120],
                x: [0, Math.sin(particle.id) * 30, 0],
                opacity: [0, 0.8, 0],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
                ease: 'easeInOut',
              }}
            >
              {particle.type === 'heart' ? (
                <Heart
                  className="text-pink-400/40"
                  style={{ width: particle.size * 3, height: particle.size * 3 }}
                  fill="currentColor"
                />
              ) : particle.type === 'star' ? (
                <Sparkles
                  className="text-yellow-300/40"
                  style={{ width: particle.size * 2.5, height: particle.size * 2.5 }}
                />
              ) : (
                <div
                  className="rounded-full bg-purple-300/30"
                  style={{ width: particle.size, height: particle.size }}
                />
              )}
            </motion.div>
          ))}

        {/* Soft vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)',
          }}
        />

        {/* Slide counter with romantic styling */}
        <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md text-pink-200 text-sm px-3 py-1.5 rounded-full border border-pink-500/20">
          <Heart className="inline h-3 w-3 mr-1 text-pink-400" fill="currentColor" />
          {currentIndex + 1} / {totalSlides}
        </div>

        {/* Current effect name */}
        <motion.div
          key={currentEffect}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-4 bg-pink-500/20 backdrop-blur-md text-pink-200 text-xs px-3 py-1.5 rounded-full border border-pink-500/30"
        >
          ✨ {currentEffect.replace('-', ' ')}
        </motion.div>

        {/* Progress bar - romantic gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
          <motion.div
            className="h-full rounded-r-full"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #ec4899, #a855f7, #f472b6)',
            }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 mt-5">
        <motion.button
          whileHover={{ scale: 1.15, rotate: -10 }}
          whileTap={{ scale: 0.9 }}
          onClick={restart}
          className="p-2.5 rounded-full bg-gray-800/80 text-pink-300 hover:bg-gray-700 border border-pink-800/30"
        >
          <RotateCcw className="h-5 w-5" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={goToPrev}
          className="p-2.5 rounded-full bg-gray-800/80 text-pink-300 hover:bg-gray-700 border border-pink-800/30"
        >
          <SkipBack className="h-5 w-5" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={togglePlay}
          className="p-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-500/30 border border-pink-400/30"
        >
          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={goToNext}
          className="p-2.5 rounded-full bg-gray-800/80 text-pink-300 hover:bg-gray-700 border border-pink-800/30"
        >
          <SkipForward className="h-5 w-5" />
        </motion.button>

        {/* Shuffle effects button */}
        <motion.button
          whileHover={{ scale: 1.15, rotate: 180 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            setEffectMap(
              generateEffectMap(totalSlides, settings.randomEffects, settings.fixedEffect)
            );
          }}
          className="p-2.5 rounded-full bg-gray-800/80 text-purple-300 hover:bg-gray-700 border border-purple-800/30"
          title="Randomize effects"
        >
          <Sparkles className="h-5 w-5" />
        </motion.button>
      </div>

      {/* Thumbnail strip */}
      <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
        {items.map((item, index) => (
          <motion.button
            key={item.id}
            whileHover={{ scale: 1.1, rotateY: 10 }}
            onClick={() => {
              setCurrentIndex(index);
              setProgress(0);
            }}
            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all relative ${
              index === currentIndex
                ? 'border-pink-400 shadow-lg shadow-pink-500/30'
                : 'border-gray-700 opacity-60 hover:opacity-100'
            }`}
          >
            {item.type === 'image' ? (
              <img src={item.url} alt="" className="w-full h-full object-cover" />
            ) : (
              <video src={item.url} className="w-full h-full object-cover" muted />
            )}
            {/* Effect indicator */}
            {effectMap[index] && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[8px] text-pink-300 text-center py-0.5 truncate px-1">
                {effectMap[index]}
              </div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
