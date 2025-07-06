"use client";

import { useRouter } from "next/navigation";
import { Card, CardTitle, CardFooter } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFolder } from "../../context/folder-context";
import { useState, useEffect } from "react";

export default function SelectFolderPage() {
  const router = useRouter();
  const { setFolderPath } = useFolder();
  const [loading, setLoading] = useState(false);
  const [checkingSavedPath, setCheckingSavedPath] = useState(true);

  // Carregar path salvo automaticamente
  useEffect(() => {
    const loadSavedPath = async () => {
      try {
        if (window.api) {
          const savedPath = await window.api.getRootFolderPath();
          if (savedPath) {
            console.log('📂 Found saved folder path:', savedPath);
            setFolderPath(savedPath);
            router.push('/app');
            return;
          }
        }
      } catch (error) {
        console.error('❌ Error loading saved path:', error);
      } finally {
        setCheckingSavedPath(false);
      }
    };

    loadSavedPath();
  }, [setFolderPath, router]);

  const handleSelectFolder = async () => {
    setLoading(true);
    try {
      if (window.api) {
        const folderPath = await window.api.selectFolder();
        if (folderPath) {
          // Salvar o path no banco de dados
          await window.api.saveRootFolderPath(folderPath);
          console.log('💾 Folder path saved to database:', folderPath);
          
          setFolderPath(folderPath);
          router.push('/app');
        }
      }
    } catch (error) {
      console.error('❌ Error selecting folder:', error);
    } finally {
      setLoading(false);
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
            <Button size="lg" className="w-full" onClick={handleSelectFolder} disabled={loading || checkingSavedPath}>
              {checkingSavedPath ? 'Checking saved folder...' : loading ? 'Selecting...' : 'Select folder'}
            </Button>
            <p className="text-xs text-muted-foreground">You can change the course folder later in the settings.</p>
          </CardFooter>
        </Card>
      </div>
    </div>

  );
}
