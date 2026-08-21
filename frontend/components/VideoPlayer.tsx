"use client";

import { useRef, useState, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize2, RotateCcw, Download } from "lucide-react";
import { formatDuration } from "@/lib/utils";

interface VideoPlayerProps {
  src: string;
  title: string;
  onTimeUpdate?: (time: number) => void;
}

export default function VideoPlayer({ src, title, onTimeUpdate }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const controlsTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const handleTimeUpdate    = () => { setCurrentTime(v.currentTime); onTimeUpdate?.(v.currentTime); };
    const handleDurationChange = () => setDuration(v.duration);
    const handleProgress       = () => {
      if (v.buffered.length > 0) setBuffered(v.buffered.end(v.buffered.length - 1));
    };
    const handleEnded = () => setPlaying(false);
    v.addEventListener("timeupdate",      handleTimeUpdate);
    v.addEventListener("durationchange",  handleDurationChange);
    v.addEventListener("progress",        handleProgress);
    v.addEventListener("ended",           handleEnded);
    return () => {
      v.removeEventListener("timeupdate",      handleTimeUpdate);
      v.removeEventListener("durationchange",  handleDurationChange);
      v.removeEventListener("progress",        handleProgress);
      v.removeEventListener("ended",           handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    playing ? v.pause() : v.play();
    setPlaying(!playing);
    resetControlsTimer();
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !muted;
    setMuted(!muted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Number(e.target.value);
    setCurrentTime(Number(e.target.value));
  };

  const handleFullscreen = () => {
    const v = videoRef.current;
    if (!v) return;
    document.fullscreenElement ? document.exitFullscreen() : v.requestFullscreen();
  };

  const handleRestart = () => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    v.play();
    setPlaying(true);
  };

  const resetControlsTimer = () => {
    setShowControls(true);
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  };

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "#1f1a14", border: "1px solid rgba(232,168,56,0.12)" }}
    >
      <div
        className="relative bg-black aspect-video group"
        onMouseMove={resetControlsTimer}
        onMouseLeave={() => playing && setShowControls(false)}
      >
        <video
          ref={videoRef}
          src={src}
          className="w-full h-full object-contain"
          onClick={togglePlay}
        />

        {/* Play overlay */}
        {!playing && (
          <div
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
            onClick={togglePlay}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{
                background: "rgba(232,168,56,0.18)",
                border: "1.5px solid rgba(232,168,56,0.35)",
                backdropFilter: "blur(6px)",
              }}
            >
              <Play className="w-8 h-8 text-gold-400 ml-1" />
            </div>
          </div>
        )}

        {/* Controls bar */}
        <div
          className={`absolute bottom-0 left-0 right-0 p-4 transition-opacity duration-300 ${
            showControls || !playing ? "opacity-100" : "opacity-0"
          }`}
          style={{ background: "linear-gradient(to top, rgba(14,11,8,0.85), transparent)" }}
        >
          {/* Seek bar */}
          <div className="relative h-1.5 mb-3 cursor-pointer">
            {/* Buffered */}
            <div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                width: duration ? `${(buffered / duration) * 100}%` : "0%",
                background: "rgba(232,168,56,0.15)",
              }}
            />
            {/* Played */}
            <div
              className="absolute inset-y-0 left-0 rounded-full pointer-events-none"
              style={{
                width: duration ? `${(currentTime / duration) * 100}%` : "0%",
                background: "linear-gradient(90deg, #c4872c, #e8a838)",
              }}
            />
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={togglePlay} className="text-parchment-100 hover:text-gold-400 transition-colors">
                {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <button onClick={handleRestart} className="text-parchment-500 hover:text-parchment-200 transition-colors">
                <RotateCcw className="w-4 h-4" />
              </button>
              <button onClick={toggleMute} className="text-parchment-500 hover:text-parchment-200 transition-colors">
                {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <span
                className="text-parchment-600 text-xs tabular-nums"
                style={{ fontFamily: '"JetBrains Mono", monospace' }}
              >
                {formatDuration(Math.floor(currentTime))} / {formatDuration(Math.floor(duration))}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <a href={src} download className="text-parchment-500 hover:text-parchment-200 transition-colors" title="Download">
                <Download className="w-4 h-4" />
              </a>
              <button onClick={handleFullscreen} className="text-parchment-500 hover:text-parchment-200 transition-colors">
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Title bar */}
      <div
        className="px-5 py-3.5 border-t"
        style={{ borderColor: "rgba(232,168,56,0.08)" }}
      >
        <p className="text-parchment-300 text-sm font-medium">{title}</p>
      </div>
    </div>
  );
}
