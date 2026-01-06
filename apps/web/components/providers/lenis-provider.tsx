"use client";

import { ReactLenis } from 'lenis/react';
import { ReactNode } from 'react';

interface LenisProviderProps {
    children: ReactNode;
}

export default function LenisProvider({ children }: LenisProviderProps) {
    return (
        <ReactLenis
            root
            options={{
                lerp: 0.15,
                duration: 0.75,
                orientation: 'vertical',
                gestureOrientation: 'vertical',
                smoothWheel: true,
                wheelMultiplier: 1.5,
                touchMultiplier: 2.5,
                infinite: false,
                syncTouch: true,
                syncTouchLerp: 0.1,
                // Remove custom easing to avoid serialization issues
                // Lenis will use its default easing which is already smooth
            }}
        >
            {children}
        </ReactLenis>
    );
}