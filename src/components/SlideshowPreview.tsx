import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';
import { MediaItem, SlideshowSettings } from '../hooks/useMediaManager';

interface SlideshowPreviewProps {
  items: MediaItem[];
  settings: SlideshowSettings;
  canvasRef?: React.RefObject<HTMLCanvasElement>;
  isExporting?: boolean;
}

const getEffectVariants = (effect: string) => {
  switch (effect) {
    case 'rotate3d':
      return {
        initial: { opacity: 0, rotateY: -180, scale: 0.5 },
        animate: { opacity: 1, rotateY: 0, scale: 1 },
        exit: { opacity: 0, rotateY: 180, scale: 0.5 },
      };
    case 'zoom-rotate':
      return {
        initial: { opacity: 0, scale: 0, rotate: -360 },
        animate: { opacity: 1, scale: 1, rotate: 0 },
        exit: { opacity: 0, scale: 2, rotate: 360 },
      };
    case 'carousel':
      return {
        initial: { opacity: 0, x: 300, rotateY: -90 },
        animate: { opacity: 1, x: 0, rotateY: 0 },
        exit: { opacity: 0, x: -300, rotateY: 90 },
      };
    case 'flip':
      return {
        initial: { opacity: 0, rotateX: -90, y: -100 },
        animate: { opacity: 1, rotateX: 0, y: 0 },
        exit: { opacity: 0, rotateX: 90, y: 100 },
      };
    case 'spiral':
      return {
        initial: { opacity: 0, scale: 0, rotate: -720 },
        animate: { opacity: 1, scale: 1, rotate: 0 },
        exit: { opacity: 0, scale: 0, rotate: 720 },
      };
    case 'wave':
      return {
        initial: { opacity: 0, y: 200, rotate: -15, scale: 0.8 },
        animate: { opacity: 1, y: 0, rotate: 0, scale: 1 },
        exit: { opacity: 0, y: -200, rotate: 15, scale: 0.8 },
      };
    default:
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      };
  }
};

export default function SlideshowPreview({
  items,
  settings,
  canvasRef,
  isExporting = false,
}: SlideshowPreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalSlides = items.length;
  const effectVariants = getEffectVariants(settings.effect);
  const slideDurationMs = settings.slideDuration * 1000;

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
  }, []);

  // Auto-play logic
  useEffect(() => {
    if (isPlaying && totalSlides > 0) {
      intervalRef.current = setInterval(goToNext, slideDurationMs);
      progressRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) return 0;
          return prev + (100 / (slideDurationMs / 50));
        });
      }, 50);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [isPlaying, slideDurationMs, goToNext, totalSlides]);

  // Export mode - advance slides
  useEffect(() => {
    if (isExporting && totalSlides > 0) {
      const exportInterval = setInterval(goToNext, slideDurationMs);
      return () => clearInterval(exportInterval);
    }
  }, [isExporting, goToNext, slideDurationMs, totalSlides]);

  // Auto-start when items are added
  useEffect(() => {
    if (items.length > 0 && !isPlaying) {
      setIsPlaying(true);
    }
  }, [items.length]);

  if (totalSlides === 0) {
    return (
      <div className="w-full aspect-video bg-gray-900 rounded-2xl flex items-center justify-center border border-gray-700">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="inline-block mb-4"
          >
            <div className="h-16 w-16 rounded-full border-4 border-purple-500/30 border-t-purple-500" />
          </motion.div>
          <p className="text-gray-400 text-lg">Upload media to preview slideshow</p>
          <p className="text-gray-500 text-sm mt-2">Your rotating effects will appear here</p>
        </div>
      </div>
    );
  }

  const currentItem = items[currentIndex];

  return (
    <div className="w-full" ref={containerRef}>
      {/* Preview Area */}
      <div
        className="relative w-full aspect-video rounded-2xl overflow-hidden border border-gray-700 shadow-2xl"
        style={{ backgroundColor: settings.backgroundColor }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full hidden" />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentItem.id}
            variants={effectVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{
              duration: settings.transitionDuration,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="absolute inset-0 flex items-center justify-center"
            style={{ perspective: '1000px' }}
          >
            {currentItem.type === 'image' ? (
              <motion.img
                src={currentItem.url}
                alt={currentItem.name}
                className="max-w-full max-h-full object-contain"
                animate={
                  isPlaying
                    ? {
                        rotate: [0, 2, -2, 0],
                        scale: [1, 1.02, 1],
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
                className="max-w-full max-h-full object-contain"
                autoPlay
                muted
                loop
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Decorative rotating border */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            border: '2px solid transparent',
            borderRadius: '1rem',
            background:
              'linear-gradient(#0f0f23, #0f0f23) padding-box, linear-gradient(135deg, #a855f7, #3b82f6, #ec4899) border-box',
          }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {/* Slide counter */}
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full">
          {currentIndex + 1} / {totalSlides}
        </div>

        {/* Effect name */}
        <div className="absolute top-4 left-4 bg-purple-500/60 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
          ✨ {settings.effect}
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Rotating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-purple-400/40"
            style={{
              top: `${20 + i * 12}%`,
              left: `${10 + i * 15}%`,
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 2 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mt-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={restart}
          className="p-2 rounded-full bg-gray-700 text-white hover:bg-gray-600"
        >
          <RotateCcw className="h-5 w-5" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={goToPrev}
          className="p-2 rounded-full bg-gray-700 text-white hover:bg-gray-600"
        >
          <SkipBack className="h-5 w-5" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={togglePlay}
          className="p-4 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/30"
        >
          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={goToNext}
          className="p-2 rounded-full bg-gray-700 text-white hover:bg-gray-600"
        >
          <SkipForward className="h-5 w-5" />
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
            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
              index === currentIndex
                ? 'border-purple-500 shadow-lg shadow-purple-500/30'
                : 'border-gray-600 opacity-60 hover:opacity-100'
            }`}
          >
            {item.type === 'image' ? (
              <img src={item.url} alt="" className="w-full h-full object-cover" />
            ) : (
              <video src={item.url} className="w-full h-full object-cover" muted />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
