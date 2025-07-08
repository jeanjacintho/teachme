"use client";
import React, { createContext, useContext, useState } from "react";
import type { FolderItem } from "../../../../shared/types/video";

type Video = { path: string; name: string } | null;

const VideoContext = createContext<{
  currentVideo: Video;
  setCurrentVideo: (video: Video) => void;
  videoList: FolderItem[];
  setVideoList: (list: FolderItem[]) => void;
  currentVideoIndex: number;
  setCurrentVideoIndex: (index: number) => void;
}>({
  currentVideo: null,
  setCurrentVideo: () => {},
  videoList: [],
  setVideoList: () => {},
  currentVideoIndex: 0,
  setCurrentVideoIndex: () => {},
});

export function VideoProvider({ children }: { children: React.ReactNode }) {
  const [currentVideo, setCurrentVideo] = useState<Video>(null);
  const [videoList, setVideoList] = useState<FolderItem[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  
  return (
    <VideoContext.Provider value={{ 
      currentVideo, 
      setCurrentVideo, 
      videoList, 
      setVideoList,
      currentVideoIndex,
      setCurrentVideoIndex
    }}>
      {children}
    </VideoContext.Provider>
  );
}

export function useVideo() {
  return useContext(VideoContext);
} 