import { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image, Film, Heart } from 'lucide-react';

interface MediaUploaderProps {
  onUpload: (files: FileList) => void;
}

export default function MediaUploader({ onUpload }: MediaUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        onUpload(e.dataTransfer.files);
      }
    },
    [onUpload]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        onUpload(e.target.files);
        e.target.value = '';
      }
    },
    [onUpload]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center
          transition-all duration-300 ease-out overflow-hidden
          ${
            isDragging
              ? 'border-pink-400 bg-pink-500/10 scale-[1.02] shadow-lg shadow-pink-500/20'
              : 'border-pink-800/40 bg-gradient-to-br from-pink-950/20 via-purple-950/20 to-rose-950/20 hover:border-pink-400/50 hover:from-pink-950/30'
          }
        `}
      >
        <motion.div
          animate={isDragging ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-block mb-4"
          >
            <div className="relative">
              <Upload className="h-12 w-12 text-pink-400" />
              <motion.div
                className="absolute -top-1 -right-1"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Heart className="h-4 w-4 text-pink-400" fill="currentColor" />
              </motion.div>
            </div>
          </motion.div>

          <h3 className="text-lg font-semibold text-white mb-2">
            Upload Your Precious Memories
          </h3>
          <p className="text-pink-200/50 text-sm mb-4">
            Drop photos & videos here to create a romantic slideshow ✨
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-pink-300/40">
            <span className="flex items-center gap-1">
              <Image className="h-4 w-4" /> JPG, PNG, GIF, WEBP
            </span>
            <span className="flex items-center gap-1">
              <Film className="h-4 w-4" /> MP4, WEBM, MOV
            </span>
          </div>
        </motion.div>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleChange}
          className="hidden"
        />

        {/* Romantic decorative elements */}
        <motion.div
          className="absolute -top-2 -right-2"
          animate={{ rotate: 360, scale: [1, 1.3, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        >
          <Heart className="h-4 w-4 text-pink-500/20" fill="currentColor" />
        </motion.div>
        <motion.div
          className="absolute -bottom-2 -left-2"
          animate={{ rotate: -360, scale: [1, 1.5, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
        >
          <Heart className="h-3 w-3 text-purple-500/20" fill="currentColor" />
        </motion.div>
        <motion.div
          className="absolute top-4 left-8"
          animate={{ y: [0, -10, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <div className="h-2 w-2 rounded-full bg-pink-400/20" />
        </motion.div>
        <motion.div
          className="absolute bottom-4 right-8"
          animate={{ y: [0, 10, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <div className="h-2 w-2 rounded-full bg-purple-400/20" />
        </motion.div>
      </div>
    </motion.div>
  );
}
