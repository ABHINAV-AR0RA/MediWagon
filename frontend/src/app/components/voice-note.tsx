import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCw } from "lucide-react";
import { Button } from "./ui/button";

interface VoiceNoteProps {
  audioUrl: string;
  autoPlay?: boolean;
}

export const VoiceNote: React.FC<VoiceNoteProps> = ({
  audioUrl,
  autoPlay = true,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Enhanced URL validation
  const getAudioUrl = () => {
    try {
      if (!audioUrl) return "";

      // Handle different URL formats
      if (audioUrl.startsWith("data:")) {
        return audioUrl; // Handle base64 audio data
      }

      if (audioUrl.startsWith("http")) {
        return audioUrl; // Already a full URL
      }

      // Check if audioUrl contains file extension
      const hasExtension = /\.(mp3|wav|ogg)$/i.test(audioUrl);
      const baseUrl = `http://localhost:5000${
        audioUrl.startsWith("/") ? "" : "/"
      }${audioUrl}`;

      return hasExtension ? baseUrl : `${baseUrl}.mp3`;
    } catch (err) {
      console.error("Invalid audio URL:", err);
      setError("Invalid audio URL format");
      setLoading(false);
      return "";
    }
  };

  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;

    const handleCanPlay = () => {
      setLoading(false);
      if (autoPlay) {
        audio
          .play()
          .catch((err) =>
            console.error("Auto-play failed (user gesture required?)", err)
          );
      }
    };

    const handleLoadError = (e: Event) => {
      console.error("Audio load error:", {
        url: audio.src,
        error: (e.target as HTMLAudioElement).error,
      });
      setError("Could not load audio file");
      setLoading(false);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    // Reset states
    setLoading(true);
    setError(null);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);

    const url = getAudioUrl();
    if (!url) {
      setLoading(false);
      setError("Invalid audio URL");
      return;
    }

    // attach listeners
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("error", handleLoadError);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.crossOrigin = "anonymous";

    // set source and start loading
    audio.src = url;
    audio.load();

    return () => {
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("error", handleLoadError);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.pause();
      // clear src to free resource and avoid stale events
      try {
        audio.src = "";
      } catch (e) {
        /* ignore */
      }
    };
  }, [audioUrl, autoPlay]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (error) {
    return (
      <div className="flex items-center gap-2 p-2 bg-red-500/10 text-red-500 rounded-xl text-sm">
        <span>⚠️</span> {error}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 p-2 bg-secondary/30 rounded-xl w-fit">
      <audio ref={audioRef} preload="metadata" crossOrigin="anonymous">
        <source src={getAudioUrl()} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      {loading ? (
        <div className="animate-pulse text-sm text-muted-foreground">
          Loading audio...
        </div>
      ) : (
        <>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 rounded-full"
            onClick={() => {
              if (audioRef.current) {
                if (isPlaying) audioRef.current.pause();
                else audioRef.current.play();
              }
            }}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </Button>
          <div className="text-sm text-muted-foreground">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 rounded-full"
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play();
              }
            }}
          >
            <RotateCw size={16} />
          </Button>
        </>
      )}
    </div>
  );
};
