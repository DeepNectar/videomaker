import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, GripVertical, Image, Film } from 'lucide-react';
import { MediaItem } from '../hooks/useMediaManager';

interface MediaGalleryProps {
  items: MediaItem[];
  onRemove: (id: string) => void;
  onReorder: (from: number, to: number) => void;
}

export default function MediaGallery({ items, onRemove }: MediaGalleryProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No media uploaded yet</p>
        <p className="text-sm mt-2">Upload photos and videos to get started</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-lg">
          Media Gallery ({items.length} items)
        </h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <AnimatePresence mode="popLayout">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotateY: 90 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ scale: 1.05, rotateZ: 2 }}
              className="relative group rounded-xl overflow-hidden bg-gray-800 aspect-square"
            >
              {item.type === 'image' ? (
                <img
                  src={item.url}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full relative">
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                    muted
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Film className="h-8 w-8 text-white" />
                  </div>
                </div>
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <p className="text-white text-xs truncate">{item.name}</p>
                </div>
              </div>

              {/* Type badge */}
              <div className="absolute top-2 left-2">
                <span className="flex items-center gap-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                  {item.type === 'image' ? (
                    <Image className="h-3 w-3" />
                  ) : (
                    <Film className="h-3 w-3" />
                  )}
                  {item.type === 'image' ? 'IMG' : 'VID'}
                </span>
              </div>

              {/* Remove button */}
              <motion.button
                whileHover={{ scale: 1.2, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(item.id);
                }}
                className="absolute top-2 right-2 p-1.5 bg-red-500/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-3 w-3" />
              </motion.button>

              {/* Drag handle */}
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="h-4 w-4 text-white/70" />
              </div>

              {/* Order number */}
              <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="bg-purple-500/80 text-white text-xs px-1.5 py-0.5 rounded">
                  #{index + 1}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
