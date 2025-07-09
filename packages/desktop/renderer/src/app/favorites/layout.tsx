"use client";

import { MainLayoutClient } from "@/components/main-layout-client";

export default function FavoritesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <MainLayoutClient minimized={false}>
      {children}
    </MainLayoutClient>
  );
}


