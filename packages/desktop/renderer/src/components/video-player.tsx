"use client";

import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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

interface VideoPlayerProps {
  videoPath: string;
  videoName: string;
  onClose: () => void;
  videoList?: FolderItem[];
  currentVideoIndex?: number;
  onVideoChange?: (video: { path: string; name: string }, index: number) => void;
  onVideoEnded?: () => void;
}

const VideoPlayerComponent = ({ 
  videoPath, 
  onClose, 
  videoList = [], 
  currentVideoIndex = 0,
  onVideoChange,
  onVideoEnded
}: VideoPlayerProps) => {
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
  const [autoPlay, setAutoPlay] = useState(false);

  // Carregar configuração de autoplay do banco
  useEffect(() => {
    const loadAutoPlaySetting = async () => {
      try {
        if (window.api) {
          const savedAutoPlay = await window.api.getAutoPlaySetting();
          console.log('🎬 Loading autoplay setting from database:', savedAutoPlay);
          setAutoPlay(savedAutoPlay);
        }
      } catch (error) {
        console.error('❌ Error loading autoplay setting:', error);
      }
    };

    loadAutoPlaySetting();
  }, []);

  // Formatar tempo em MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Função para pular para o próximo vídeo
  const playNextVideo = useCallback(() => {
    if (videoList.length === 0 || currentVideoIndex === undefined) return;
    
    const nextIndex = currentVideoIndex + 1;
    if (nextIndex < videoList.length) {
      const nextVideo = videoList[nextIndex];
      if (nextVideo.type === 'video') {
        onVideoChange?.({ path: nextVideo.path, name: nextVideo.name }, nextIndex);
      }
    }
  }, [videoList, currentVideoIndex, onVideoChange]);

  // Função para pular para o vídeo anterior
  const playPreviousVideo = useCallback(() => {
    if (videoList.length === 0 || currentVideoIndex === undefined) return;
    
    const prevIndex = currentVideoIndex - 1;
    if (prevIndex >= 0) {
      const prevVideo = videoList[prevIndex];
      if (prevVideo.type === 'video') {
        onVideoChange?.({ path: prevVideo.path, name: prevVideo.name }, prevIndex);
      }
    }
  }, [videoList, currentVideoIndex, onVideoChange]);

  // Controles básicos
  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current && !isNaN(duration) && duration > 0) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
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

  const toggleFullscreen = useCallback(() => {
    if (videoRef.current) {
      if (!isFullscreen) {
        videoRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  }, [isFullscreen]);

  const skipTime = (seconds: number) => {
    if (videoRef.current) {
      const newTime = videoRef.current.currentTime + seconds;
      videoRef.current.currentTime = Math.max(0, Math.min(newTime, videoRef.current.duration));
    }
  };

  // Função para marcar vídeo como não assistido
  const markVideoAsUnwatched = useCallback(async () => {
    console.log('🎬 Marking video as unwatched:', videoPath);
    try {
      if (window.api?.saveVideoProgress && videoPath) {
        await window.api.saveVideoProgress(videoPath, 0, 0, false);
        console.log('✅ Video marked as unwatched successfully');
        // Chamar callback para recarregar sidebar
        onVideoEnded?.();
      }
    } catch (error) {
      console.error('❌ Error marking video as unwatched:', error);
    }
  }, [videoPath, onVideoEnded]);

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
      setIsPlaying(true);
    };
    
    const handlePause = () => {
      setIsPlaying(false);
    };
    
    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };
    
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    // Novo event listener para detectar quando o vídeo termina
    const handleEnded = async () => {
      console.log('🎬 Video ended:', { videoPath, duration, videoDuration: video.duration });
      // Usar a duração do vídeo diretamente do elemento, com fallback para o state
      const finalDuration = video.duration || duration;
      console.log('📊 Final duration for saving:', finalDuration);
      
      // Salvar progresso como assistido
      if (window.api?.saveVideoProgress && videoPath && finalDuration && finalDuration > 0) {
        try {
          console.log('💾 Saving video progress...');
          await window.api.saveVideoProgress(videoPath, finalDuration, finalDuration, true);
          console.log('✅ Video progress saved successfully');
          // Chamar callback para recarregar sidebar
          onVideoEnded?.();
        } catch (error) {
          console.error('❌ Error saving video progress:', error);
        }
      } else {
        console.log('⚠️ Cannot save progress:', { 
          hasApi: !!window.api, 
          hasSaveFunction: !!window.api?.saveVideoProgress, 
          hasPath: !!videoPath, 
          hasDuration: !!finalDuration,
          finalDuration,
          videoDuration: video.duration
        });
      }
      if (autoPlay) {
        playNextVideo();
      }
    };

    // Adicionar todos os event listeners
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('ended', handleEnded);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Verificar estado inicial
    setIsPlaying(!video.paused);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('ended', handleEnded);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [videoUrl, autoPlay, playNextVideo, onVideoEnded, duration, videoPath]); // Adicionar duration e videoPath como dependências

  // Monitorar estado do vídeo em tempo real
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const checkVideoState = () => {
      const shouldBePlaying = !video.paused;
      if (shouldBePlaying !== isPlaying) {
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
        // Novos atalhos para navegação entre vídeos
        case 'n':
          e.preventDefault();
          playNextVideo();
          break;
        case 'p':
          e.preventDefault();
          playPreviousVideo();
          break;
        // Atalho para marcar vídeo como não assistido
        case 'u':
          e.preventDefault();
          markVideoAsUnwatched();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, volume, isFullscreen, videoList, currentVideoIndex, playNextVideo, playPreviousVideo, toggleFullscreen, markVideoAsUnwatched]); // Adicionar markVideoAsUnwatched como dependência

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

  // Resetar tempo quando o vídeo mudar
  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
  }, [videoPath]);

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
      } catch {
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

    const handleError = () => {
      setError(`Erro ao carregar vídeo: ${video.error?.message || 'Formato não suportado'}`);
    };

    const handleLoadStart = () => {
      setError('');
    };

    const handleCanPlay = () => {
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
      className="w-full h-full bg-black flex flex-col overflow-hidden relative"
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
            onChange={handleSeek}
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
        <div className="flex items-center gap-2">
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
          </div>

          <div className="flex items-center gap-2">
            

            {/* Auto Play Switch */}
            {videoList.length > 1 && (
              <div className="flex items-center gap-2">
                <Switch
                  id="auto-play"
                  checked={autoPlay}
                  onCheckedChange={async (checked) => {
                    console.log('🎬 Video Player: Auto play switch changed to:', checked);
                    setAutoPlay(checked);
                    
                    // Salvar no banco de dados
                    try {
                      if (window.api) {
                        console.log('🎬 Video Player: Saving autoplay setting to database...');
                        await window.api.saveAutoPlaySetting(checked);
                        console.log('🎬 Video Player: Autoplay setting saved successfully');
                      }
                    } catch (error) {
                      console.error('🎬 Video Player: Error saving autoplay setting:', error);
                    }
                  }}
                  className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-white/30 data-[state=checked]:border-primary [&>span]:!bg-white [&>span]:dark:!bg-white"
                />
                <Label htmlFor="auto-play" className="text-white text-xs">
                  Auto
                </Label>
              </div>
            )}

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

        {/* Video Navigation Info */}
        {videoList.length > 1 && (
          <div className="flex justify-center text-white text-xs mt-2">
            <span>
              {currentVideoIndex + 1} de {videoList.filter(item => item.type === 'video').length}
            </span>
          </div>
        )}
      </div>

      {/* CSS para o slider e switch */}
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
        
        /* Estilo customizado para o switch */
        [data-slot="switch"] {
          background-color: rgba(255, 255, 255, 0.3) !important;
        }
        
        [data-slot="switch"][data-state="checked"] {
          background-color: hsl(var(--primary)) !important;
        }
        
        /* Forçar bolinha branca em todos os casos */
        [data-slot="switch-thumb"],
        [data-slot="switch-thumb"][data-state="checked"],
        [data-slot="switch-thumb"][data-state="unchecked"],
        .dark [data-slot="switch-thumb"],
        .dark [data-slot="switch-thumb"][data-state="checked"],
        .dark [data-slot="switch-thumb"][data-state="unchecked"],
        #auto-play [data-slot="switch-thumb"],
        #auto-play [data-slot="switch-thumb"][data-state="checked"],
        #auto-play [data-slot="switch-thumb"][data-state="unchecked"] {
          background-color: white !important;
          background: white !important;
        }
      `}</style>
    </div>
  );
};

// Exportar o componente memoizado
export const VideoPlayer = memo(VideoPlayerComponent);

