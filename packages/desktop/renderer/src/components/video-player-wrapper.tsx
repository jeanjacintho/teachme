"use client";

import React, { memo } from 'react';
import { VideoPlayer } from './video-player';
import type { FolderItem } from '../../../../shared/types/video';

interface VideoPlayerWrapperProps {
  videoPath: string;
  videoName: string;
  onClose: () => void;
  videoList?: FolderItem[];
  currentVideoIndex?: number;
  onVideoChange?: (video: { path: string; name: string }, index: number) => void;
  onVideoEnded?: () => void;
}

const VideoPlayerWrapperComponent = ({
  videoPath,
  videoName,
  onClose,
  videoList = [],
  currentVideoIndex = 0,
  onVideoChange,
  onVideoEnded
}: VideoPlayerWrapperProps) => {
  return (
    <VideoPlayer
      videoPath={videoPath}
      videoName={videoName}
      onClose={onClose}
      videoList={videoList}
      currentVideoIndex={currentVideoIndex}
      onVideoChange={onVideoChange}
      onVideoEnded={onVideoEnded}
    />
  );
};

// Exportar o wrapper memoizado para evitar re-renderizações desnecessárias
export const VideoPlayerWrapper = memo(VideoPlayerWrapperComponent); 