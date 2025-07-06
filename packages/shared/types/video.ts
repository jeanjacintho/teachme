export type VideoFile = {
  name: string;
  path: string;
};

export type FolderItem = {
  name: string;
  path: string;
  type: 'folder' | 'video';
  children?: FolderItem[];
  duration?: number; // duração em segundos
  watched?: boolean; // se o vídeo foi assistido
}; 