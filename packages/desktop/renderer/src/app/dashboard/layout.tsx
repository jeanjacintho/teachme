"use client";

import { MainLayoutClient } from "@/components/main-layout-client";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <MainLayoutClient>
      {children}
    </MainLayoutClient>
  );
}


