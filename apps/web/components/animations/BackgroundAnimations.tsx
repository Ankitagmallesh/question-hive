'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Floating geometric shapes with physics-based movement
export const FloatingShapes = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const shapes = [
        { size: 60, color: 'bg-blue-200/15', delay: 0, x: 10, y: 20 },
        { size: 40, color: 'bg-indigo-200/10', delay: 1, x: 80, y: 40 },
        { size: 30, color: 'bg-purple-200/15', delay: 2, x: 20, y: 70 },
    ];

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {shapes.map((shape, index) => (
                <motion.div
                    key={index}
                    className={`absolute ${shape.color} rounded-full blur-sm`}
                    style={{
                        width: shape.size,
                        height: shape.size,
                        left: `${shape.x}%`,
                        top: `${shape.y}%`,
                    }}
                    animate={{
                        x: [0, 20, 0],
                        y: [0, -30, 0],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{
                        duration: 6 + index,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: shape.delay,
                    }}
                />
            ))}
            
            {/* Mouse follower */}
            <motion.div
                className="absolute w-24 h-24 bg-gradient-to-r from-blue-400/8 to-purple-400/8 rounded-full blur-xl"
                animate={{
                    x: mousePosition.x - 48,
                    y: mousePosition.y - 48,
                }}
                transition={{
                    type: "spring",
                    stiffness: 30,
                    damping: 15,
                }}
            />
        </div>
    );
};

// Animated grid pattern
export const AnimatedGrid = () => {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 opacity-20">
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(59, 130, 246, 0.08) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(59, 130, 246, 0.08) 1px, transparent 1px)
                    `,
                    backgroundSize: '60px 60px',
                }}
            />
        </div>
    );
};

// Particle system
export const ParticleSystem = () => {
    const particles = Array.from({ length: 6 }, (_, i) => ({
        id: i,
        size: 3,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: i * 0.5,
    }));

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {particles.map((particle) => (
                <motion.div
                    key={particle.id}
                    className="absolute bg-blue-400/15 rounded-full"
                    style={{
                        width: particle.size,
                        height: particle.size,
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                    }}
                    animate={{
                        y: [0, -50, 0],
                        opacity: [0, 0.8, 0],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        delay: particle.delay,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );
};

// Gradient orbs with smooth movement
export const GradientOrbs = () => {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            <motion.div
                className="absolute top-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-blue-400/15 to-purple-400/15 rounded-full blur-3xl"
                animate={{
                    x: [0, 50, 0],
                    y: [0, -30, 0],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
            <motion.div
                className="absolute top-3/4 right-1/4 w-60 h-60 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl"
                animate={{
                    x: [0, -40, 0],
                    y: [0, 40, 0],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                }}
            />
        </div>
    );
};

// Combined background animation component
export const EnhancedBackground = ({ variant = 'default' }: { variant?: 'default' | 'minimal' | 'particles' }) => {
    switch (variant) {
        case 'minimal':
            return <FloatingShapes />;
        case 'particles':
            return (
                <>
                    <ParticleSystem />
                    <AnimatedGrid />
                </>
            );
        default:
            return (
                <>
                    <GradientOrbs />
                    <FloatingShapes />
                </>
            );
    }
};