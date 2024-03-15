'use client';

import { NextUIProvider } from "@nextui-org/react";
import { Toaster } from "sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <NextUIProvider>
            <Toaster theme="dark" />
            {children}
        </NextUIProvider>
    )
}