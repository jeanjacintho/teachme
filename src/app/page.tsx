"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset,SidebarProvider } from "@/components/ui/sidebar"
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <SidebarProvider style={{
      "--sidebar-width": "calc(var(--spacing) * 72)",
      "--header-height": "calc(var(--spacing) * 12)",
    } as React.CSSProperties}>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <h1>TeachMe - Seus Cursos</h1>
              <p>Selecione uma pasta no menu lateral para começar.</p>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
