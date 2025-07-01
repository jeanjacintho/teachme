"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import type { FolderItem } from '../../../../shared/types/video';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  X,
  SkipBack,
  SkipForward
} from 'lucide-react';

// Declaração de tipo para window.api
declare global {
  interface Window {
    api?: {
      selectFolder: () => Promise<string | null>;
      listFolderContents: (folderPath: string) => Promise<FolderItem[]>;
      getVideoUrl: (filePath: string) => Promise<string>;
    };
  }
}

interface VideoPlayerProps {
  videoPath: string;
  videoName: string;
  onClose: () => void;
}

export function VideoPlayer({ videoPath, videoName, onClose }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<number | undefined>(undefined);
  const [error, setError] = useState<string>('');

  // Formatar tempo em MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Controles básicos
  const togglePlay = () => {
    console.log('togglePlay chamado, videoRef.current:', !!videoRef.current);
    if (videoRef.current) {
      console.log('Vídeo pausado:', videoRef.current.paused);
      if (videoRef.current.paused) {
        console.log('Tentando reproduzir vídeo...');
        videoRef.current.play().catch(error => {
          console.error('Erro ao reproduzir vídeo:', error);
        });
      } else {
        console.log('Tentando pausar vídeo...');
        videoRef.current.pause();
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    console.log('handleSeek chamado com tempo:', time, 'videoRef.current:', !!videoRef.current, 'duration:', duration);
    if (videoRef.current && !isNaN(duration) && duration > 0) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
      console.log('Tempo do vídeo definido para:', time);
    } else {
      console.log('Não foi possível fazer seek - vídeo não carregado ou duração inválida');
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume;
        videoRef.current.muted = false;
        setIsMuted(false);
      } else {
        videoRef.current.volume = 0;
        videoRef.current.muted = true;
        setIsMuted(true);
      }
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!isFullscreen) {
        videoRef.current.requestFullscreen().catch(error => {
          console.error('Erro ao entrar em tela cheia:', error);
        });
      } else {
        document.exitFullscreen().catch(error => {
          console.error('Erro ao sair da tela cheia:', error);
        });
      }
    }
  };

  const skipTime = (seconds: number) => {
    if (videoRef.current) {
      const newTime = videoRef.current.currentTime + seconds;
      videoRef.current.currentTime = Math.max(0, Math.min(newTime, videoRef.current.duration));
    }
  };

  // Event listeners do vídeo
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };
    
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };
    
    const handlePlay = () => {
      console.log('Evento PLAY disparado');
      setIsPlaying(true);
    };
    
    const handlePause = () => {
      console.log('Evento PAUSE disparado');
      setIsPlaying(false);
    };
    
    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };
    
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    // Adicionar todos os event listeners
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Verificar estado inicial
    console.log('Estado inicial do vídeo - paused:', video.paused);
    setIsPlaying(!video.paused);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [videoUrl]); // Adicionar videoUrl como dependência

  // Debug: Log quando isPlaying muda
  useEffect(() => {
    console.log('Estado isPlaying mudou para:', isPlaying);
  }, [isPlaying]);

  // Monitorar estado do vídeo em tempo real
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const checkVideoState = () => {
      const shouldBePlaying = !video.paused;
      if (shouldBePlaying !== isPlaying) {
        console.log('Corrigindo estado - video.paused:', video.paused, 'isPlaying:', isPlaying);
        setIsPlaying(shouldBePlaying);
      }
    };

    // Verificar a cada 100ms
    const interval = setInterval(checkVideoState, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skipTime(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          skipTime(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (volume < 1) {
            const newVolume = Math.min(1, volume + 0.1);
            setVolume(newVolume);
            if (videoRef.current) {
              videoRef.current.volume = newVolume;
            }
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (volume > 0) {
            const newVolume = Math.max(0, volume - 0.1);
            setVolume(newVolume);
            if (videoRef.current) {
              videoRef.current.volume = newVolume;
            }
          }
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'Escape':
          if (isFullscreen) {
            toggleFullscreen();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, volume, isFullscreen]);

  // Auto-hide controls
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  // Carregar URL do vídeo
  useEffect(() => {
    const loadVideoUrl = async () => {
      try {
        setIsLoading(true);
        setError('');
        if (window.api) {
          const url = await window.api.getVideoUrl(videoPath);
          setVideoUrl(url);
        } else {
          // Fallback para desenvolvimento
          setVideoUrl(`file://${videoPath}`);
        }
      } catch (error) {
        console.error('Erro ao carregar URL do vídeo:', error);
        setError('Erro ao carregar URL do vídeo');
        // Fallback direto
        setVideoUrl(`file://${videoPath}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadVideoUrl();
  }, [videoPath]);

  // Adicionar event listeners para debug
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleError = (e: Event) => {
      console.error('Erro no vídeo:', e);
      console.error('Video src:', video.src);
      console.error('Video error:', video.error);
      setError(`Erro ao carregar vídeo: ${video.error?.message || 'Formato não suportado'}`);
    };

    const handleLoadStart = () => {
      console.log('Vídeo começou a carregar:', video.src);
      setError('');
    };

    const handleCanPlay = () => {
      console.log('Vídeo pode ser reproduzido:', video.src);
      setError('');
    };

    video.addEventListener('error', handleError);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [videoUrl]);

  return (
    <div 
      className="w-full h-full bg-black flex flex-col rounded-lg overflow-hidden relative"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video Container */}
      <div className="w-full h-full relative">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-white">Carregando vídeo...</div>
          </div>
        ) : error ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-red-400 mb-2">Erro ao carregar vídeo</div>
              <div className="text-sm text-gray-300">{error}</div>
              <div className="text-xs text-gray-400 mt-2">Caminho: {videoPath}</div>
            </div>
          </div>
        ) : (
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-contain"
            onClick={togglePlay}
          />
        )}
      </div>

      {/* Controls - Sobreposição sobre o vídeo */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 z-10 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {/* Progress Bar */}
        <div className="mb-4">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            disabled={!duration || isNaN(duration)}
            onChange={(e) => {
              console.log('Barra de progresso alterada:', e.target.value);
              handleSeek(e);
            }}
            className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer slider disabled:opacity-50"
            style={{
              background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${duration ? (currentTime / duration) * 100 : 0}%, rgba(255, 255, 255, 0.3) ${duration ? (currentTime / duration) * 100 : 0}%, rgba(255, 255, 255, 0.3) 100%)`
            }}
          />
          <div className="flex justify-between text-white text-sm mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() => skipTime(-10)}
            >
              <SkipBack className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                console.log('Botão play/pause clicado');
                togglePlay();
              }}
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() => skipTime(10)}
            >
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={toggleMute}
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${(isMuted ? 0 : volume) * 100}%, rgba(255, 255, 255, 0.3) ${(isMuted ? 0 : volume) * 100}%, rgba(255, 255, 255, 0.3) 100%)`
                }}
              />
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* CSS para o slider */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
} 