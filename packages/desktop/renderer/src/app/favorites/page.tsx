"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, Play, Trash2 } from "lucide-react";
import { useVideo } from "@/context/video-context";
import { useFolder } from "@/context/folder-context";
import { useRouter } from "next/navigation";

type FavoriteVideo = {
  filePath: string;
  name: string;
};

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingFavorites, setRemovingFavorites] = useState<Set<string>>(new Set());
  const { setCurrentVideo } = useVideo();
  const { setFolderPath } = useFolder();
  const router = useRouter();

  // Carregar favoritos do banco de dados
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        if (window.api) {
          const favoritesList = await window.api.getFavorites();
          console.log("⭐ Favorites loaded:", favoritesList);
          setFavorites(favoritesList);
        }
      } catch (error) {
        console.error("❌ Error loading favorites:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, []);

  // Função para remover favorito
  const removeFavorite = async (filePath: string) => {
    if (!window.api?.setFavorite) return;
    
    setRemovingFavorites(prev => new Set(prev).add(filePath));
    try {
      await window.api.setFavorite(filePath, false);
      console.log("✅ Favorite removed successfully");
      setFavorites(prev => prev.filter(fav => fav.filePath !== filePath));
    } catch (error) {
      console.error("❌ Error removing favorite:", error);
    } finally {
      setRemovingFavorites(prev => {
        const newSet = new Set(prev);
        newSet.delete(filePath);
        return newSet;
      });
    }
  };

  // Função para reproduzir vídeo
  const playVideo = (video: FavoriteVideo) => {
    // Extrair o caminho da pasta do arquivo de vídeo (compatível com Windows e Unix)
    const lastSeparator = video.filePath.lastIndexOf('/') !== -1 
      ? video.filePath.lastIndexOf('/') 
      : video.filePath.lastIndexOf('\\');
    const folderPath = video.filePath.substring(0, lastSeparator);
    setFolderPath(folderPath);

    // Navegar para /home com os parâmetros do vídeo
    const params = new URLSearchParams({
      videoPath: video.filePath,
      videoName: video.name,
    });
    router.push(`/home?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando favoritos...</p>
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Bookmark className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Nenhum favorito encontrado</h2>
          <p className="text-muted-foreground mb-4">
            Você ainda não adicionou nenhum vídeo aos favoritos.
          </p>
          <Button onClick={() => router.push('/home')}>
            Explorar vídeos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Meus Favoritos</h1>
        <p className="text-muted-foreground">
          {favorites.length} vídeo{favorites.length !== 1 ? 's' : ''} favorito{favorites.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {favorites.map((favorite) => (
          <Card key={favorite.filePath} className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base truncate">{favorite.name}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => playVideo(favorite)}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Reproduzir
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => removeFavorite(favorite.filePath)}
                  disabled={removingFavorites.has(favorite.filePath)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}