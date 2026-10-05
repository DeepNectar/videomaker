import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Download, Loader2, CheckCircle, Heart, AlertCircle } from 'lucide-react';
import { MediaItem, SlideshowSettings, RomanticEffect, ROMANTIC_EFFECTS, ROMANTIC_EFFECT_META } from '../hooks/useMediaManager';

interface VideoExporterProps {
  items: MediaItem[];
  settings: SlideshowSettings;
}

const getRandomEffect = (exclude?: RomanticEffect): RomanticEffect => {
  const available = ROMANTIC_EFFECTS.filter((e) => e !== exclude);
  return available[Math.floor(Math.random() * available.length)];
};

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

// Get supported MIME type for MediaRecorder
const getSupportedMimeType = (): string => {
  const types = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
    'video/mp4',
  ];
  
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  
  return 'video/webm'; // fallback
};

export default function VideoExporter({ items, settings }: VideoExporterProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [currentEffectName, setCurrentEffectName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const exportVideo = useCallback(async () => {
    if (items.length === 0) return;

    setIsExporting(true);
    setProgress(0);
    setIsComplete(false);
    setError(null);

    try {
      // Portrait phone resolution (9:16 aspect ratio)
      const canvas = document.createElement('canvas');
      canvas.width = 720;
      canvas.height = 1280;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not create canvas context');
      }

      const stream = canvas.captureStream(30);
      const mimeType = getSupportedMimeType();
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 2500000,
      });

      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      const effectMap = generateEffectMap(items.length, settings.randomEffects, settings.fixedEffect);
      const totalFrames = items.length * settings.slideDuration * 30;
      const framesPerSlide = settings.slideDuration * 30;
      const transitionFrames = Math.floor(settings.transitionDuration * 30);
      let currentFrame = 0;

      const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
          img.src = src;
        });
      };

      const applyEffect = (
        effect: RomanticEffect,
        t: number,
        isEntering: boolean
      ) => {
        const progress = isEntering ? t : 1 - t;

        switch (effect) {
          case 'dreamy-zoom':
            ctx.globalAlpha = progress;
            ctx.filter = `blur(${(1 - progress) * 15}px)`;
            const zoomScale = isEntering ? 0.6 + progress * 0.4 : 1 + (1 - progress) * 0.3;
            ctx.scale(zoomScale, zoomScale);
            break;
          case 'soft-rotate':
            ctx.globalAlpha = progress;
            const angle = (1 - progress) * (isEntering ? -0.26 : 0.26);
            ctx.rotate(angle);
            ctx.scale(0.8 + progress * 0.2, 0.8 + progress * 0.2);
            break;
          case 'heart-pulse':
            ctx.globalAlpha = progress;
            const pulseScale = isEntering
              ? 0.3 + progress * 0.7 + Math.sin(progress * Math.PI * 3) * 0.1
              : progress;
            ctx.scale(pulseScale, pulseScale);
            break;
          case 'gentle-drift':
            ctx.globalAlpha = progress;
            const driftY = (1 - progress) * (isEntering ? 80 : -80);
            const driftX = (1 - progress) * (isEntering ? -40 : 40);
            ctx.translate(driftX, driftY);
            ctx.rotate((1 - progress) * (isEntering ? -0.08 : 0.08));
            break;
          case 'rose-fade':
            ctx.globalAlpha = progress;
            ctx.scale(1.2 - progress * 0.2, 1.2 - progress * 0.2);
            ctx.rotate((1 - progress) * (isEntering ? 0.05 : -0.05));
            break;
          case 'silk-flow':
            ctx.globalAlpha = progress;
            const silkX = (1 - progress) * (isEntering ? -200 : 200);
            ctx.translate(silkX, 0);
            ctx.transform(1, 0, (1 - progress) * 0.17, 1, 0, 0);
            break;
          case 'starlight':
            ctx.globalAlpha = progress;
            const starScale = isEntering ? progress * 1.2 : progress;
            ctx.rotate((1 - progress) * (isEntering ? -3.14 : 3.14));
            ctx.scale(starScale, starScale);
            break;
          case 'whisper':
            ctx.globalAlpha = progress;
            ctx.filter = `blur(${(1 - progress) * 8}px)`;
            const whisperY = (1 - progress) * (isEntering ? 30 : -30);
            ctx.translate(0, whisperY);
            ctx.scale(0.95 + progress * 0.05, 0.95 + progress * 0.05);
            break;
          case 'embrace':
            ctx.globalAlpha = progress;
            ctx.filter = `blur(${(1 - progress) * 10}px)`;
            const embraceScale = isEntering ? 1.5 - progress * 0.5 : 0.7 + progress * 0.3;
            ctx.scale(embraceScale, embraceScale);
            break;
          case 'moonlight':
            ctx.globalAlpha = progress;
            const moonX = (1 - progress) * (isEntering ? 100 : -100);
            const moonY = (1 - progress) * (isEntering ? -50 : 50);
            ctx.translate(moonX, moonY);
            ctx.rotate((1 - progress) * (isEntering ? 0.08 : -0.08));
            break;
        }
      };

      const drawFrame = async (slideIndex: number, frame: number) => {
        const item = items[slideIndex];
        const effect = effectMap[slideIndex];

        // Clear canvas with romantic gradient
        const gradient = ctx.createRadialGradient(360, 640, 0, 360, 640, 500);
        gradient.addColorStop(0, settings.backgroundColor);
        gradient.addColorStop(1, '#0a0010');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw romantic ambient glow
        ctx.save();
        const glowX = 200 + Math.sin(currentFrame * 0.02) * 80;
        const glowY = 400 + Math.cos(currentFrame * 0.015) * 60;
        const glow = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, 200);
        glow.addColorStop(0, 'rgba(236, 72, 153, 0.08)');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.filter = 'none';

        // Apply transitions
        if (frame < transitionFrames) {
          const t = frame / transitionFrames;
          applyEffect(effect, t, true);
        } else if (frame > framesPerSlide - transitionFrames) {
          const t = (framesPerSlide - frame) / transitionFrames;
          applyEffect(effect, t, false);
        } else {
          const breathe = Math.sin((frame / framesPerSlide) * Math.PI * 4) * 0.015;
          ctx.scale(1 + breathe, 1 + breathe);
          ctx.globalAlpha = 1;
          ctx.filter = 'none';
        }

        try {
          if (item.type === 'image') {
            const img = await loadImage(item.url);
            const aspectRatio = img.width / img.height;
            const canvasAspect = canvas.width / canvas.height;
            let drawWidth: number, drawHeight: number;

            if (aspectRatio > canvasAspect) {
              drawWidth = canvas.width * 0.85;
              drawHeight = drawWidth / aspectRatio;
            } else {
              drawHeight = canvas.height * 0.85;
              drawWidth = drawHeight * aspectRatio;
            }

            ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
          } else {
            const video = document.createElement('video');
            video.src = item.url;
            video.muted = true;
            await new Promise<void>((resolve) => {
              video.onloadeddata = () => {
                video.currentTime = 0;
                resolve();
              };
              video.load();
            });

            const aspectRatio = video.videoWidth / video.videoHeight;
            const canvasAspect = canvas.width / canvas.height;
            let drawWidth: number, drawHeight: number;

            if (aspectRatio > canvasAspect) {
              drawWidth = canvas.width * 0.85;
              drawHeight = drawWidth / aspectRatio;
            } else {
              drawHeight = canvas.height * 0.85;
              drawWidth = drawHeight * aspectRatio;
            }

            ctx.drawImage(video, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
          }
        } catch (err) {
          console.error('Error drawing media:', err);
          ctx.fillStyle = '#333';
          ctx.fillRect(-200, -150, 400, 300);
          ctx.fillStyle = '#fff';
          ctx.font = '20px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(item.name, 0, 0);
        }

        ctx.restore();

        // Draw romantic particles
        if (settings.romanticParticles) {
          for (let i = 0; i < 10; i++) {
            const particleAngle = (currentFrame * 0.01 + (i * Math.PI * 2) / 10);
            const radius = 280 + Math.sin(currentFrame * 0.03 + i) * 60;
            const px = canvas.width / 2 + Math.cos(particleAngle) * radius;
            const py = canvas.height / 2 + Math.sin(particleAngle) * radius;
            const size = 3 + Math.sin(currentFrame * 0.05 + i) * 2;
            const alpha = 0.2 + Math.sin(currentFrame * 0.04 + i) * 0.2;

            if (i % 3 === 0) {
              ctx.save();
              ctx.translate(px, py);
              ctx.scale(size / 8, size / 8);
              ctx.beginPath();
              ctx.moveTo(0, -3);
              ctx.bezierCurveTo(-5, -8, -10, -3, 0, 5);
              ctx.bezierCurveTo(10, -3, 5, -8, 0, -3);
              ctx.fillStyle = `rgba(236, 72, 153, ${alpha})`;
              ctx.fill();
              ctx.restore();
            } else {
              ctx.beginPath();
              ctx.arc(px, py, size, 0, Math.PI * 2);
              ctx.fillStyle =
                i % 2 === 0
                  ? `rgba(168, 85, 247, ${alpha})`
                  : `rgba(253, 224, 71, ${alpha})`;
              ctx.fill();
            }
          }
        }

        // Vignette
        const vignette = ctx.createRadialGradient(360, 640, 200, 360, 640, 600);
        vignette.addColorStop(0, 'transparent');
        vignette.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      };

      // Wait for recorder to start
      await new Promise<void>((resolve) => {
        mediaRecorder.onstart = () => resolve();
        mediaRecorder.start();
      });

      // Render all frames
      for (let slideIndex = 0; slideIndex < items.length; slideIndex++) {
        const effect = effectMap[slideIndex];
        setCurrentEffectName(ROMANTIC_EFFECT_META[effect].label);

        for (let frame = 0; frame < framesPerSlide; frame++) {
          await drawFrame(slideIndex, frame);
          currentFrame++;
          setProgress(Math.round((currentFrame / totalFrames) * 100));
          await new Promise((r) => setTimeout(r, 33));
        }
      }

      // Stop recorder and wait for data
      await new Promise<void>((resolve) => {
        mediaRecorder.onstop = () => resolve();
        mediaRecorder.stop();
      });

      // Wait a bit for all data to be collected
      await new Promise((r) => setTimeout(r, 500));

      // Create blob and download
      if (chunks.length === 0) {
        throw new Error('No video data was recorded');
      }

      const blob = new Blob(chunks, { type: mimeType });
      
      if (blob.size === 0) {
        throw new Error('Video blob is empty');
      }

      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `romantic_slideshow_${Date.now()}.webm`;
      document.body.appendChild(a);
      
      // Trigger download
      a.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);

      setIsComplete(true);
      setIsExporting(false);
      
    } catch (err) {
      console.error('Export error:', err);
      setError(err instanceof Error ? err.message : 'Failed to export video');
      setIsExporting(false);
    }
  }, [items, settings]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-pink-950/30 via-purple-950/30 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-pink-800/30"
    >
      <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
        <Download className="h-5 w-5 text-pink-400" />
        Export Romantic Video
      </h3>

      <p className="text-gray-400 text-sm mb-4">
        Export your slideshow as a beautiful portrait video with random romantic effects.
        Each slide will have a different dreamy transition ✨
      </p>

      {items.length === 0 ? (
        <p className="text-pink-400 text-sm flex items-center gap-2">
          <Heart className="h-4 w-4" fill="currentColor" />
          Upload some memories first to create your romantic video.
        </p>
      ) : (
        <>
          <div className="text-gray-400 text-sm mb-4 space-y-1">
            <p>📱 Format: Portrait (Phone Resolution)</p>
            <p>📐 Resolution: 720×1280 (9:16)</p>
            <p>⏱️ Duration: ~{items.length * settings.slideDuration}s</p>
            <p>
              ✨ Effects: {settings.randomEffects ? 'Random romantic (different each slide!)' : ROMANTIC_EFFECT_META[settings.fixedEffect].label}
            </p>
            <p>💫 Particles: {settings.romanticParticles ? 'Hearts, stars & sparkles' : 'Disabled'}</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 flex items-start gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20"
            >
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Export Error</p>
                <p className="text-xs mt-1">{error}</p>
                <p className="text-xs mt-2 text-gray-400">
                  Tip: Try using a different browser (Chrome/Edge recommended) or check if your browser supports video recording.
                </p>
              </div>
            </motion.div>
          )}

          {isExporting && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-pink-300 flex items-center gap-2">
                  <Heart className="h-4 w-4 animate-pulse" fill="currentColor" />
                  Creating magic... {currentEffectName && `• ${currentEffectName}`}
                </span>
                <span className="text-pink-400 font-medium">{progress}%</span>
              </div>
              <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden border border-pink-800/30">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #ec4899, #a855f7, #f472b6)',
                  }}
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </div>
            </div>
          )}

          {isComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 flex items-center gap-2 text-green-400 text-sm bg-green-500/10 p-3 rounded-lg border border-green-500/20"
            >
              <CheckCircle className="h-5 w-5" />
              Your romantic video is ready! Check your downloads folder 💕
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: isExporting ? 1 : 1.02 }}
            whileTap={{ scale: isExporting ? 1 : 0.98 }}
            onClick={exportVideo}
            disabled={isExporting || items.length === 0}
            className={`w-full py-3 px-6 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all ${
              isExporting
                ? 'bg-gray-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:shadow-lg hover:shadow-pink-500/30'
            }`}
          >
            {isExporting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Creating Your Romantic Video...
              </>
            ) : (
              <>
                <Heart className="h-5 w-5" fill="currentColor" />
                Download Portrait Video
              </>
            )}
          </motion.button>
        </>
      )}
    </motion.div>
  );
}
