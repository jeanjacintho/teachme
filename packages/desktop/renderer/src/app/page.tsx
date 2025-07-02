// Este arquivo será substituído pela tela de seleção de pasta. O conteúdo será movido para /app/page.tsx.

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset,SidebarProvider } from "@/components/ui/sidebar"
import { SiteHeader } from "@/components/site-header";
import { VideoPlayer } from "@/components/video-player";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Bookmark, Star, FolderOpenIcon, GalleryVerticalEnd, GraduationCap, GraduationCapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFolder } from "../context/folder-context";

export default function SelectFolderPage() {
  const router = useRouter();
  const { setFolderPath } = useFolder();

  const handleSelectFolder = async () => {
    if (window.api) {
      const folderPath = await window.api.selectFolder();
      if (folderPath) {
        setFolderPath(folderPath);
        router.push('/app'); // Redireciona para a rota principal
      }
    }
  };

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GraduationCap className="size-4" />
          </div>
          Teach Me.
        </a>
        <Card className="flex flex-col items-center">
          <CardTitle>Select your course folder to start</CardTitle>
          <CardFooter className="flex- flex-col gap-2">
            <Button size="lg" className="w-full text-color-secondary" onClick={handleSelectFolder}>
              Select folder
            </Button>
            <p className="text-xs text-muted-foreground">You can change the course folder later in the settings.</p>
          </CardFooter>
        </Card>
      </div>
    </div>

  );
}
