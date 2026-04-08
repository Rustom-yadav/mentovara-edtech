"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Loader2,
  SkipForward,
  SkipBack,
} from "lucide-react";

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const pad = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

// Cloudinary: turn a video URL into a poster thumbnail
// e.g. .../video/upload/v123/file.mp4 → .../video/upload/so_0,w_1280,h_720,c_fill/v123/file.jpg
function getPosterFromUrl(videoUrl) {
  if (!videoUrl) return null;
  try {
    const url = new URL(videoUrl);
    const parts = url.pathname.split("/upload/");
    if (parts.length === 2) {
      url.pathname = parts[0] + "/upload/so_0,w_1280,h_720,c_fill/" + parts[1];
      return url.toString().replace(/\.[^.]+$/, ".jpg");
    }
  } catch {
    // not a valid URL
  }
  return null;
}

export default function VideoPlayer({ url, poster, onEnded }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const progressRef = useRef(null);
  const hideControlsTimer = useRef(null);

  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const thumbnailUrl = poster || getPosterFromUrl(url);

  // Start playing the video for the first time
  function startVideo() {
    setStarted(true);
    setLoading(true);
    const v = videoRef.current;
    if (v) {
      v.play().catch(() => {
        // autoplay blocked — user will use play button
        setLoading(false);
      });
    }
  }

  // Auto-hide controls after 3s of no interaction
  function toggleFullscreen() {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  }

  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideControlsTimer.current);
    if (playing) {
      hideControlsTimer.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [playing]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    resetHideTimer();
    return () => clearTimeout(hideControlsTimer.current);
  }, [playing, resetHideTimer]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e) {
      if (!videoRef.current || !started) return;
      const v = videoRef.current;
      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          v.paused ? v.play() : v.pause();
          break;
        case "ArrowRight":
          e.preventDefault();
          v.currentTime = Math.min(v.duration, v.currentTime + 10);
          break;
        case "ArrowLeft":
          e.preventDefault();
          v.currentTime = Math.max(0, v.currentTime - 10);
          break;
        case "ArrowUp":
          e.preventDefault();
          v.volume = Math.min(1, v.volume + 0.1);
          setVolume(v.volume);
          break;
        case "ArrowDown":
          e.preventDefault();
          v.volume = Math.max(0, v.volume - 0.1);
          setVolume(v.volume);
          break;
        case "m":
          v.muted = !v.muted;
          setMuted(v.muted);
          break;
        case "f":
          toggleFullscreen();
          break;
      }
      resetHideTimer();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [resetHideTimer, started]);

  // Fullscreen change listener
  useEffect(() => {
    function onFsChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    v.paused ? v.play() : v.pause();
  }

  function toggleMute() {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }

  function handleVolumeChange(e) {
    const v = videoRef.current;
    if (!v) return;
    const val = parseFloat(e.target.value);
    v.volume = val;
    v.muted = val === 0;
    setVolume(val);
    setMuted(val === 0);
  }

  function seek(e) {
    const v = videoRef.current;
    if (!v || !progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    v.currentTime = pos * v.duration;
  }

  function skip(seconds) {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + seconds));
  }

  if (!url) {
    return (
      <div className="flex aspect-video w-full items-center justify-center bg-black text-sm text-white/60">
        No video URL available
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex aspect-video w-full items-center justify-center bg-black">
        <div className="text-center text-white/70">
          <p className="font-medium text-white/90">Failed to load video</p>
          <p className="mt-1 text-sm">Try refreshing the page or check your connection.</p>
          <button
            onClick={() => {
              setError(false);
              setStarted(false);
              setLoading(false);
            }}
            className="mt-3 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // ── THUMBNAIL STATE: show poster with big play button ──
  if (!started) {
    return (
      <div
        ref={containerRef}
        className="relative aspect-video w-full cursor-pointer bg-black"
        onClick={startVideo}
      >
        {/* Poster / Thumbnail */}
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt="Video thumbnail"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 70vw"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black" />
        )}

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/30" />

        {/* Big play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex size-20 items-center justify-center rounded-full bg-primary/90 shadow-2xl shadow-primary/30 transition-transform hover:scale-110 active:scale-95">
            <Play className="size-9 text-white ml-1" fill="white" />
          </div>
        </div>

        {/* Click to play hint */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-1.5 text-xs text-white/70 backdrop-blur-sm">
          Click to play
        </div>

        {/* Hidden video element so it preloads */}
        <video
          ref={videoRef}
          src={url}
          crossOrigin="anonymous"
          playsInline
          preload="metadata"
          className="hidden"
          onError={() => setError(true)}
        />
      </div>
    );
  }

  // ── PLAYING STATE: full video player with controls ──
  return (
    <div
      ref={containerRef}
      className="group relative aspect-video w-full bg-black select-none"
      onMouseMove={resetHideTimer}
      onMouseLeave={() => {
        if (playing) setShowControls(false);
      }}
    >
      <video
        ref={videoRef}
        src={url}
        crossOrigin="anonymous"
        playsInline
        preload="auto"
        className="h-full w-full cursor-pointer"
        onClick={() => {
          togglePlay();
          resetHideTimer();
        }}
        onLoadedMetadata={() => {
          setDuration(videoRef.current?.duration || 0);
          setLoading(false);
        }}
        onCanPlay={() => setLoading(false)}
        onWaiting={() => setLoading(true)}
        onPlaying={() => {
          setLoading(false);
          setPlaying(true);
        }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={() => {
          const v = videoRef.current;
          if (v) {
            setCurrentTime(v.currentTime);
            if (v.buffered.length > 0) {
              setBuffered((v.buffered.end(v.buffered.length - 1) / v.duration) * 100);
            }
          }
        }}
        onEnded={() => {
          setPlaying(false);
          onEnded?.();
        }}
        onError={() => setError(true)}
      />

      {/* Center loading spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Loader2 className="size-12 animate-spin text-white/70" />
        </div>
      )}

      {/* Center play button when paused */}
      {!playing && !loading && (
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onClick={() => {
            togglePlay();
            resetHideTimer();
          }}
        >
          <div className="flex size-16 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm transition-transform hover:scale-110">
            <Play className="size-7 text-white ml-1" fill="white" />
          </div>
        </div>
      )}

      {/* Bottom controls overlay */}
      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pb-3 pt-12 transition-opacity duration-300 ${
          showControls || !playing ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Progress bar */}
        <div
          ref={progressRef}
          className="group/progress relative mb-3 h-1 cursor-pointer rounded-full bg-white/20 hover:h-1.5 transition-all"
          onClick={seek}
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-white/30"
            style={{ width: `${buffered}%` }}
          />
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-primary"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 size-3 rounded-full bg-primary opacity-0 group-hover/progress:opacity-100 transition-opacity"
            style={{ left: `calc(${progress}% - 6px)` }}
          />
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => skip(-10)}
            className="flex items-center justify-center rounded-md p-1.5 text-white/80 hover:text-white transition-colors"
            title="Rewind 10s"
          >
            <SkipBack className="size-4" />
          </button>

          <button
            onClick={togglePlay}
            className="flex items-center justify-center rounded-md p-1.5 text-white hover:text-white transition-colors"
          >
            {playing ? (
              <Pause className="size-5" fill="white" />
            ) : (
              <Play className="size-5 ml-0.5" fill="white" />
            )}
          </button>

          <button
            onClick={() => skip(10)}
            className="flex items-center justify-center rounded-md p-1.5 text-white/80 hover:text-white transition-colors"
            title="Forward 10s"
          >
            <SkipForward className="size-4" />
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={toggleMute}
              className="p-1.5 text-white/80 hover:text-white transition-colors"
            >
              {muted || volume === 0 ? (
                <VolumeX className="size-4" />
              ) : (
                <Volume2 className="size-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={muted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 cursor-pointer accent-primary appearance-none rounded-full bg-white/20 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
            />
          </div>

          <span className="ml-1 text-xs text-white/70 tabular-nums">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div className="flex-1" />

          <button
            onClick={toggleFullscreen}
            className="p-1.5 text-white/80 hover:text-white transition-colors"
          >
            {isFullscreen ? (
              <Minimize className="size-4" />
            ) : (
              <Maximize className="size-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
