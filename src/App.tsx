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
  RotateCw,
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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950 text-white">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-purple-500/20"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.sin(i) * 50, 0],
              opacity: [0, 0.5, 0],
              scale: [0, 2, 0],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 border-b border-gray-800/50 backdrop-blur-xl bg-gray-900/30"
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="relative"
            >
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Film className="h-5 w-5 text-white" />
              </div>
              <motion.div
                className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-pink-500"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Rotating Slideshow Creator
              </h1>
              <p className="text-xs text-gray-400">
                Create stunning videos with rotating effects
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
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all text-sm"
              >
                <Trash2 className="h-4 w-4" />
                Clear All
              </motion.button>
            )}
            <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg px-3 py-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-gray-300">
                {mediaItems.length} media
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
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/20'
                  : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800'
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
                  <RotateCw className="h-5 w-5 text-purple-400" />
                  <h2 className="text-xl font-bold text-white">
                    Slideshow Preview
                  </h2>
                  <span className="text-sm text-gray-400 ml-2">
                    Effect: {settings.effect}
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
                  <div className="bg-gray-800/30 rounded-2xl p-4 border border-gray-700/50">
                    <h4 className="text-white font-medium mb-3">Quick Preview</h4>
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
            <div className="flex items-center gap-2 bg-gray-900/90 backdrop-blur-xl border border-gray-700 rounded-2xl p-2 shadow-2xl">
              <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setActiveTab('upload')}
                className={`p-3 rounded-xl ${
                  activeTab === 'upload'
                    ? 'bg-purple-500 text-white'
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
                    ? 'bg-purple-500 text-white'
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
                    ? 'bg-purple-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Settings"
              >
                <Settings className="h-5 w-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1, rotate: -5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setActiveTab('export')}
                className={`p-3 rounded-xl ${
                  activeTab === 'export'
                    ? 'bg-purple-500 text-white'
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
      <footer className="relative z-10 border-t border-gray-800/50 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-500 text-sm">
          <p>
            ✨ Rotating Slideshow Creator — Upload, Animate, Export ✨
          </p>
        </div>
      </footer>
    </div>
  );
}
