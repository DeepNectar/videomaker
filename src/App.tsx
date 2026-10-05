import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Film,
  Upload,
  Settings,
  Eye,
  Download,
  Trash2,
  Sparkles,
  Heart,
} from 'lucide-react';
import { useMediaManager } from './hooks/useMediaManager';
import MediaUploader from './components/MediaUploader';
import MediaGallery from './components/MediaGallery';
import SlideshowPreview from './components/SlideshowPreview';
import SettingsPanel from './components/SettingsPanel';
import VideoExporter from './components/VideoExporter';

type TabType = 'upload' | 'preview' | 'settings' | 'export';

export default function App() {
  const { mediaItems, settings, setSettings, addMedia, removeMedia, reorderMedia, clearAll } =
    useMediaManager();
  const [activeTab, setActiveTab] = useState<TabType>('upload');

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'upload', label: 'Upload', icon: <Upload className="h-5 w-5" /> },
    { id: 'preview', label: 'Preview', icon: <Eye className="h-5 w-5" /> },
    { id: 'settings', label: 'Effects', icon: <Settings className="h-5 w-5" /> },
    { id: 'export', label: 'Export', icon: <Download className="h-5 w-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-rose-950/30 to-purple-950/40 text-white">
      {/* Romantic animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -150, 0],
              x: [0, Math.sin(i) * 40, 0],
              opacity: [0, 0.4, 0],
              scale: [0.5, 1.5, 0.5],
              rotate: [0, 360],
            }}
            transition={{
              duration: 6 + Math.random() * 8,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          >
            {i % 4 === 0 ? (
              <Heart className="w-3 h-3 text-pink-400/30" fill="currentColor" />
            ) : i % 4 === 1 ? (
              <Sparkles className="w-3 h-3 text-yellow-300/20" />
            ) : (
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400/20" />
            )}
          </motion.div>
        ))}

        {/* Large ambient glow */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(236,72,153,0.05) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(168,85,247,0.05) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 border-b border-pink-800/20 backdrop-blur-xl bg-gray-900/30"
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
              className="relative"
            >
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-pink-500 via-rose-500 to-purple-500 flex items-center justify-center shadow-lg shadow-pink-500/30">
                <Heart className="h-5 w-5 text-white" fill="currentColor" />
              </div>
              <motion.div
                className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-pink-400"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-pink-300 via-rose-300 to-purple-300 bg-clip-text text-transparent">
                Romantic Slideshow Creator
              </h1>
              <p className="text-xs text-pink-300/50">
                Create dreamy videos with random romantic effects ✨
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {mediaItems.length > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearAll}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all text-sm border border-rose-500/20"
              >
                <Trash2 className="h-4 w-4" />
                Clear All
              </motion.button>
            )}
            <div className="flex items-center gap-1.5 bg-pink-500/10 rounded-lg px-3 py-2 border border-pink-500/20">
              <Heart className="h-4 w-4 text-pink-400" fill="currentColor" />
              <span className="text-sm text-pink-200">
                {mediaItems.length} {mediaItems.length === 1 ? 'memory' : 'memories'}
              </span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-500/20'
                  : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-700/50'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.id === 'upload' && mediaItems.length > 0 && (
                <span className="ml-1 bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
                  {mediaItems.length}
                </span>
              )}
            </motion.button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'upload' && (
              <div className="space-y-6">
                <MediaUploader onUpload={addMedia} />
                <MediaGallery
                  items={mediaItems}
                  onRemove={removeMedia}
                  onReorder={reorderMedia}
                />
              </div>
            )}

            {activeTab === 'preview' && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="h-5 w-5 text-pink-400" fill="currentColor" />
                  <h2 className="text-xl font-bold text-white">
                    Romantic Preview
                  </h2>
                  <span className="text-sm text-pink-300/70 ml-2">
                    {settings.randomEffects ? '✨ Random romantic effects' : `💗 ${settings.fixedEffect}`}
                  </span>
                </div>
                <SlideshowPreview items={mediaItems} settings={settings} />
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="max-w-2xl mx-auto">
                <SettingsPanel settings={settings} onChange={setSettings} />
              </div>
            )}

            {activeTab === 'export' && (
              <div className="max-w-2xl mx-auto space-y-6">
                <VideoExporter items={mediaItems} settings={settings} />

                {/* Quick preview */}
                {mediaItems.length > 0 && (
                  <div className="bg-pink-500/5 rounded-2xl p-4 border border-pink-800/20">
                    <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                      <Eye className="h-4 w-4 text-pink-400" />
                      Quick Preview
                    </h4>
                    <div className="aspect-video rounded-xl overflow-hidden">
                      <SlideshowPreview items={mediaItems} settings={settings} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Quick Actions Bar */}
        {mediaItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="flex items-center gap-2 bg-gray-900/90 backdrop-blur-xl border border-pink-800/30 rounded-2xl p-2 shadow-2xl shadow-pink-500/10">
              <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setActiveTab('upload')}
                className={`p-3 rounded-xl ${
                  activeTab === 'upload'
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Upload"
              >
                <Upload className="h-5 w-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1, rotate: -5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setActiveTab('preview')}
                className={`p-3 rounded-xl ${
                  activeTab === 'preview'
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Preview"
              >
                <Eye className="h-5 w-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setActiveTab('settings')}
                className={`p-3 rounded-xl ${
                  activeTab === 'settings'
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Effects"
              >
                <Settings className="h-5 w-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1, rotate: -5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setActiveTab('export')}
                className={`p-3 rounded-xl ${
                  activeTab === 'export'
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Export"
              >
                <Download className="h-5 w-5" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-pink-800/20 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center">
          <p className="text-pink-300/40 text-sm flex items-center justify-center gap-2">
            <Heart className="h-4 w-4 text-pink-400/60" fill="currentColor" />
            Romantic Slideshow Creator — Upload, Animate, Export with Love
            <Heart className="h-4 w-4 text-pink-400/60" fill="currentColor" />
          </p>
        </div>
      </footer>
    </div>
  );
}
