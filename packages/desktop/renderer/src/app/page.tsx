"use client";

import { useRouter } from "next/navigation";
import { Card, CardTitle, CardFooter } from "@/components/ui/card";
import { GraduationCap, LoaderCircle } from "lucide-react";
import { useFolder } from "../context/folder-context";
import { useEffect } from "react";

export default function Index() {
  const router = useRouter();
  const { setFolderPath } = useFolder();

  // Carregar path salvo automaticamente
  useEffect(() => {
    const loadSavedPath = async () => {
      try {
        if (window.api) {
          const savedPath = await window.api.getRootFolderPath();
          if (savedPath) {
            console.log("📂 Found saved folder path:", savedPath);
            setFolderPath(savedPath);
            router.push("/dashboard"); // Alterado de /app para /dashboard
            return;
          } else {
            router.push("/select-folder");
            return
          }
        }
      } catch (error) {
        console.error("❌ Error loading saved path:", error);
      }
    };
    loadSavedPath();
  }, [setFolderPath, router]);

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
          <CardTitle>Loading app</CardTitle>
          <CardFooter className="flex- flex-col gap-2">
            <LoaderCircle className="animate-spin w-13 h-12"/>
          </CardFooter>
        </Card>
      </div>
    </div>

  );
}


