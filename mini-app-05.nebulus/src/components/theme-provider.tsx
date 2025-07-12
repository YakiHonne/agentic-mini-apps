"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {

    if (typeof window === "undefined") {
        return null;
    }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}