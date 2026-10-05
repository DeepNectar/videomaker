import { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image, Film } from 'lucide-react';

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
          relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center
          transition-all duration-300 ease-out
          ${
            isDragging
              ? 'border-purple-400 bg-purple-500/10 scale-[1.02] shadow-lg shadow-purple-500/20'
              : 'border-gray-600 bg-gray-800/50 hover:border-purple-400/50 hover:bg-gray-800/70'
          }
        `}
      >
        <motion.div
          animate={isDragging ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Upload className="mx-auto h-12 w-12 text-purple-400 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Drop your photos & videos here
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            or click to browse files
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
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

        {/* Decorative rotating elements */}
        <motion.div
          className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-purple-500/30"
          animate={{ rotate: 360, scale: [1, 1.3, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute -bottom-2 -left-2 h-3 w-3 rounded-full bg-blue-500/30"
          animate={{ rotate: -360, scale: [1, 1.5, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    </motion.div>
  );
}
