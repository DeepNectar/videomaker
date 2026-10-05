import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Download, Loader2, CheckCircle } from 'lucide-react';
import { MediaItem, SlideshowSettings } from '../hooks/useMediaManager';

interface VideoExporterProps {
  items: MediaItem[];
  settings: SlideshowSettings;
}

export default function VideoExporter({ items, settings }: VideoExporterProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const exportVideo = useCallback(async () => {
    if (items.length === 0) return;

    setIsExporting(true);
    setProgress(0);
    setIsComplete(false);

    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d')!;

    const stream = canvas.captureStream(30);
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 5000000,
    });

    const chunks: Blob[] = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `slideshow_${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setIsExporting(false);
      setIsComplete(true);
      stream.getTracks().forEach((track) => track.stop());
    };

    mediaRecorder.start();

    const totalFrames = items.length * settings.slideDuration * 30;
    const framesPerSlide = settings.slideDuration * 30;
    let currentFrame = 0;

    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.src = src;
      });
    };

    const drawFrame = async (slideIndex: number, frameInSlide: number) => {
      const item = items[slideIndex];
      const progressInSlide = frameInSlide / framesPerSlide;

      // Clear canvas
      ctx.fillStyle = settings.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);

      // Apply rotation effect
      const transitionFrames = settings.transitionDuration * 30;

      if (frameInSlide < transitionFrames) {
        // Entering transition
        const t = frameInSlide / transitionFrames;
        const angle = (1 - t) * Math.PI * 2;

        switch (settings.effect) {
          case 'rotate3d':
            ctx.rotate(angle * 0.1);
            ctx.scale(t, t);
            break;
          case 'zoom-rotate':
            ctx.rotate(angle);
            ctx.scale(t, t);
            break;
          case 'carousel':
            ctx.translate((1 - t) * 300, 0);
            ctx.rotate((1 - t) * 0.5);
            break;
          case 'flip':
            ctx.scale(1, Math.cos(angle * 0.5));
            break;
          case 'spiral':
            ctx.rotate(angle * 2);
            ctx.scale(t, t);
            break;
          case 'wave':
            ctx.translate(0, (1 - t) * 200);
            ctx.rotate((1 - t) * 0.3);
            break;
        }
        ctx.globalAlpha = t;
      } else if (frameInSlide > framesPerSlide - transitionFrames) {
        // Exiting transition
        const t = (framesPerSlide - frameInSlide) / transitionFrames;
        const angle = (1 - t) * Math.PI * 2;

        switch (settings.effect) {
          case 'rotate3d':
            ctx.rotate(angle * 0.1);
            ctx.scale(t, t);
            break;
          case 'zoom-rotate':
            ctx.rotate(-angle);
            ctx.scale(t, t);
            break;
          case 'carousel':
            ctx.translate(-(1 - t) * 300, 0);
            ctx.rotate(-(1 - t) * 0.5);
            break;
          case 'flip':
            ctx.scale(1, Math.cos(angle * 0.5));
            break;
          case 'spiral':
            ctx.rotate(-angle * 2);
            ctx.scale(t, t);
            break;
          case 'wave':
            ctx.translate(0, -(1 - t) * 200);
            ctx.rotate(-(1 - t) * 0.3);
            break;
        }
        ctx.globalAlpha = t;
      } else {
        // Subtle animation during display
        const breathe = Math.sin(progressInSlide * Math.PI * 4) * 0.02;
        ctx.scale(1 + breathe, 1 + breathe);
        ctx.rotate(Math.sin(progressInSlide * Math.PI * 2) * 0.02);
      }

      try {
        if (item.type === 'image') {
          const img = await loadImage(item.url);
          const aspectRatio = img.width / img.height;
          const canvasAspect = canvas.width / canvas.height;
          let drawWidth, drawHeight;

          if (aspectRatio > canvasAspect) {
            drawWidth = canvas.width * 0.8;
            drawHeight = drawWidth / aspectRatio;
          } else {
            drawHeight = canvas.height * 0.8;
            drawWidth = drawHeight * aspectRatio;
          }

          ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
        } else {
          // For videos, draw a frame
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
          let drawWidth, drawHeight;

          if (aspectRatio > canvasAspect) {
            drawWidth = canvas.width * 0.8;
            drawHeight = drawWidth / aspectRatio;
          } else {
            drawHeight = canvas.height * 0.8;
            drawWidth = drawHeight * aspectRatio;
          }

          ctx.drawImage(video, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
        }
      } catch {
        // Draw placeholder if image fails
        ctx.fillStyle = '#666';
        ctx.fillRect(-200, -150, 400, 300);
        ctx.fillStyle = '#fff';
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(item.name, 0, 0);
      }

      ctx.restore();

      // Draw decorative rotating particles
      for (let i = 0; i < 8; i++) {
        const angle = (currentFrame * 0.02 + (i * Math.PI * 2) / 8);
        const radius = 300 + Math.sin(currentFrame * 0.05 + i) * 50;
        const x = canvas.width / 2 + Math.cos(angle) * radius;
        const y = canvas.height / 2 + Math.sin(angle) * radius;

        ctx.beginPath();
        ctx.arc(x, y, 3 + Math.sin(currentFrame * 0.1 + i) * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(168, 85, 247, ${0.3 + Math.sin(currentFrame * 0.05 + i) * 0.3})`;
        ctx.fill();
      }
    };

    // Render all frames
    for (let slideIndex = 0; slideIndex < items.length; slideIndex++) {
      for (let frame = 0; frame < framesPerSlide; frame++) {
        await drawFrame(slideIndex, frame);
        currentFrame++;
        setProgress(Math.round((currentFrame / totalFrames) * 100));
        // Small delay to allow frame capture
        await new Promise((r) => setTimeout(r, 33));
      }
    }

    mediaRecorder.stop();
  }, [items, settings]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700"
    >
      <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
        <Download className="h-5 w-5 text-purple-400" />
        Export Video
      </h3>

      <p className="text-gray-400 text-sm mb-4">
        Export your slideshow as a video file with all effects and animations.
        The video will include rotating transitions between slides.
      </p>

      {items.length === 0 ? (
        <p className="text-yellow-400 text-sm">
          ⚠️ Upload some media first to export a video.
        </p>
      ) : (
        <>
          <div className="text-gray-400 text-sm mb-4">
            <p>📹 Format: WebM (VP9)</p>
            <p>📐 Resolution: 1280×720</p>
            <p>⏱️ Duration: ~{items.length * settings.slideDuration}s</p>
            <p>✨ Effect: {settings.effect}</p>
          </div>

          {isExporting && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-300">Exporting...</span>
                <span className="text-purple-400">{progress}%</span>
              </div>
              <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                  style={{ width: `${progress}%` }}
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              </div>
            </div>
          )}

          {isComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 flex items-center gap-2 text-green-400 text-sm"
            >
              <CheckCircle className="h-5 w-5" />
              Video exported successfully! Check your downloads.
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={exportVideo}
            disabled={isExporting || items.length === 0}
            className={`w-full py-3 px-6 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all ${
              isExporting
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:shadow-lg hover:shadow-purple-500/30'
            }`}
          >
            {isExporting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Exporting Video...
              </>
            ) : (
              <>
                <Download className="h-5 w-5" />
                Download Video
              </>
            )}
          </motion.button>
        </>
      )}
    </motion.div>
  );
}
