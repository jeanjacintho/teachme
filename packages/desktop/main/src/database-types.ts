// Tipos para as funções do database
export interface Course {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Video {
  id: string;
  courseId: string;
  title: string;
  filePath: string;
  duration?: number;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface VideoProgress {
  id: string;
  videoId: string;
  currentTime: number;
  duration: number;
  watched: boolean;
  lastWatched: Date;
}

export interface Favorite {
  id: string;
  videoId: string;
  createdAt: Date;
}

export interface VideoRating {
  id: string;
  videoId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Declarações de função para o database
export declare function getAllCourses(): Promise<Course[]>;
export declare function getVideosByCourse(courseId: string): Promise<Video[]>;
export declare function saveVideoProgress(videoId: string, currentTime: number, duration: number, watched: boolean): Promise<VideoProgress>;
export declare function setFavorite(videoId: string, isFavorite: boolean): Promise<Favorite | null>;
export declare function saveVideoRating(videoId: string, rating: number, comment?: string): Promise<VideoRating>; 