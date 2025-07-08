"use client";

import { MainLayoutClient } from "@/components/main-layout-client";

export default function HomeLayout({
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


