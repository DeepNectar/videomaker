import { motion } from 'framer-motion';
import { Sparkles, Clock, Palette } from 'lucide-react';
import { EffectType, SlideshowSettings } from '../hooks/useMediaManager';

interface SettingsPanelProps {
  settings: SlideshowSettings;
  onChange: (settings: SlideshowSettings) => void;
}

const effects: { value: EffectType; label: string; icon: string }[] = [
  { value: 'rotate3d', label: '3D Rotate', icon: '🔄' },
  { value: 'zoom-rotate', label: 'Zoom & Spin', icon: '🌀' },
  { value: 'carousel', label: 'Carousel', icon: '🎠' },
  { value: 'flip', label: 'Flip', icon: '🔃' },
  { value: 'spiral', label: 'Spiral', icon: '🐚' },
  { value: 'wave', label: 'Wave', icon: '🌊' },
];

const bgColors = [
  { value: '#0f0f23', label: 'Dark Navy' },
  { value: '#1a1a2e', label: 'Midnight' },
  { value: '#0d1117', label: 'GitHub Dark' },
  { value: '#1e1e1e', label: 'Charcoal' },
  { value: '#000000', label: 'Black' },
  { value: '#1a0a2e', label: 'Deep Purple' },
];

export default function SettingsPanel({ settings, onChange }: SettingsPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700"
    >
      <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-purple-400" />
        Effects & Settings
      </h3>

      {/* Effect Selection */}
      <div className="mb-6">
        <label className="text-gray-300 text-sm font-medium mb-2 block">
          Rotation Effect
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {effects.map((effect) => (
            <motion.button
              key={effect.value}
              whileHover={{ scale: 1.05, rotateZ: 3 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onChange({ ...settings, effect: effect.value })}
              className={`p-3 rounded-xl text-sm font-medium transition-all ${
                settings.effect === effect.value
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span className="text-lg block mb-1">{effect.icon}</span>
              {effect.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Duration Settings */}
      <div className="mb-6 space-y-4">
        <div>
          <label className="text-gray-300 text-sm font-medium mb-2 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Slide Duration: {settings.slideDuration}s
          </label>
          <input
            type="range"
            min="1"
            max="10"
            step="0.5"
            value={settings.slideDuration}
            onChange={(e) =>
              onChange({ ...settings, slideDuration: parseFloat(e.target.value) })
            }
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
        </div>

        <div>
          <label className="text-gray-300 text-sm font-medium mb-2 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Transition Speed: {settings.transitionDuration}s
          </label>
          <input
            type="range"
            min="0.3"
            max="3"
            step="0.1"
            value={settings.transitionDuration}
            onChange={(e) =>
              onChange({ ...settings, transitionDuration: parseFloat(e.target.value) })
            }
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
        </div>
      </div>

      {/* Background Color */}
      <div className="mb-4">
        <label className="text-gray-300 text-sm font-medium mb-2 flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Background Color
        </label>
        <div className="flex gap-2 flex-wrap">
          {bgColors.map((color) => (
            <motion.button
              key={color.value}
              whileHover={{ scale: 1.2, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onChange({ ...settings, backgroundColor: color.value })}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                settings.backgroundColor === color.value
                  ? 'border-purple-400 scale-110 shadow-lg'
                  : 'border-gray-600'
              }`}
              style={{ backgroundColor: color.value }}
              title={color.label}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
