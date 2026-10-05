import { motion } from 'framer-motion';
import { Sparkles, Clock, Palette, Heart, Shuffle, ToggleLeft, ToggleRight } from 'lucide-react';
import { RomanticEffect, SlideshowSettings, ROMANTIC_EFFECTS, ROMANTIC_EFFECT_META } from '../hooks/useMediaManager';

interface SettingsPanelProps {
  settings: SlideshowSettings;
  onChange: (settings: SlideshowSettings) => void;
}

const bgColors = [
  { value: '#1a0a1e', label: 'Romantic Night' },
  { value: '#0d0015', label: 'Deep Love' },
  { value: '#1a0000', label: 'Wine Red' },
  { value: '#0a0a1a', label: 'Midnight Blue' },
  { value: '#150a1e', label: 'Twilight' },
  { value: '#000000', label: 'Pure Black' },
  { value: '#1a1020', label: 'Velvet' },
];

export default function SettingsPanel({ settings, onChange }: SettingsPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-pink-950/30 via-purple-950/30 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-pink-800/30"
    >
      <h3 className="text-white font-bold text-lg mb-5 flex items-center gap-2">
        <Heart className="h-5 w-5 text-pink-400" fill="currentColor" />
        Romantic Effects & Settings
      </h3>

      {/* Random Effects Toggle */}
      <div className="mb-6 p-4 bg-pink-500/10 rounded-xl border border-pink-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shuffle className="h-5 w-5 text-pink-400" />
            <div>
              <p className="text-white font-medium">Random Effects</p>
              <p className="text-gray-400 text-xs">Each slide gets a different romantic effect</p>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange({ ...settings, randomEffects: !settings.randomEffects })}
            className="text-pink-400"
          >
            {settings.randomEffects ? (
              <ToggleRight className="h-8 w-8" />
            ) : (
              <ToggleLeft className="h-8 w-8 text-gray-500" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Effect Selection (when random is off) */}
      {!settings.randomEffects && (
        <div className="mb-6">
          <label className="text-gray-300 text-sm font-medium mb-3 block">
            Choose Your Effect
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ROMANTIC_EFFECTS.map((effect) => {
              const meta = ROMANTIC_EFFECT_META[effect];
              return (
                <motion.button
                  key={effect}
                  whileHover={{ scale: 1.05, rotateZ: 2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onChange({ ...settings, fixedEffect: effect })}
                  className={`p-3 rounded-xl text-sm font-medium transition-all text-left ${
                    settings.fixedEffect === effect
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-500/30'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/70 border border-gray-700/50'
                  }`}
                >
                  <span className="text-lg block mb-1">{meta.icon}</span>
                  <span className="block text-xs font-semibold">{meta.label}</span>
                  <span className="block text-[10px] opacity-70 mt-0.5">{meta.description}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Effect Preview List (when random is on) */}
      {settings.randomEffects && (
        <div className="mb-6">
          <label className="text-gray-300 text-sm font-medium mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-pink-400" />
            Available Romantic Effects (randomly applied)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {ROMANTIC_EFFECTS.map((effect) => {
              const meta = ROMANTIC_EFFECT_META[effect];
              return (
                <motion.div
                  key={effect}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-2 p-2 bg-gray-800/30 rounded-lg border border-gray-700/30"
                >
                  <span className="text-lg">{meta.icon}</span>
                  <div>
                    <p className="text-white text-xs font-medium">{meta.label}</p>
                    <p className="text-gray-500 text-[10px]">{meta.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Duration Settings */}
      <div className="mb-6 space-y-4">
        <div>
          <label className="text-gray-300 text-sm font-medium mb-2 flex items-center gap-2">
            <Clock className="h-4 w-4 text-pink-400" />
            Slide Duration: {settings.slideDuration}s
          </label>
          <input
            type="range"
            min="2"
            max="10"
            step="0.5"
            value={settings.slideDuration}
            onChange={(e) =>
              onChange({ ...settings, slideDuration: parseFloat(e.target.value) })
            }
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
          />
          <p className="text-gray-500 text-xs mt-1">How long each slide is shown</p>
        </div>

        <div>
          <label className="text-gray-300 text-sm font-medium mb-2 flex items-center gap-2">
            <Clock className="h-4 w-4 text-pink-400" />
            Transition Speed: {settings.transitionDuration}s
          </label>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={settings.transitionDuration}
            onChange={(e) =>
              onChange({ ...settings, transitionDuration: parseFloat(e.target.value) })
            }
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
          />
          <p className="text-gray-500 text-xs mt-1">Speed of the romantic transition</p>
        </div>
      </div>

      {/* Romantic Particles Toggle */}
      <div className="mb-6 p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-purple-400" />
            <div>
              <p className="text-white font-medium">Romantic Particles</p>
              <p className="text-gray-400 text-xs">Floating hearts, stars & sparkles</p>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange({ ...settings, romanticParticles: !settings.romanticParticles })}
            className="text-purple-400"
          >
            {settings.romanticParticles ? (
              <ToggleRight className="h-8 w-8" />
            ) : (
              <ToggleLeft className="h-8 w-8 text-gray-500" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Background Color */}
      <div className="mb-4">
        <label className="text-gray-300 text-sm font-medium mb-2 flex items-center gap-2">
          <Palette className="h-4 w-4 text-pink-400" />
          Background Mood
        </label>
        <div className="flex gap-2 flex-wrap">
          {bgColors.map((color) => (
            <motion.button
              key={color.value}
              whileHover={{ scale: 1.3, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onChange({ ...settings, backgroundColor: color.value })}
              className={`w-9 h-9 rounded-full border-2 transition-all ${
                settings.backgroundColor === color.value
                  ? 'border-pink-400 scale-110 shadow-lg shadow-pink-500/30'
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
