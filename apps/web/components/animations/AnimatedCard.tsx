'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { Card, CardContent, CardHeader } from '../../app/components/ui/card';

interface AnimatedCardProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    hover?: boolean;
    variant?: 'default' | 'glow' | 'lift' | 'scale';
}

export const AnimatedCard = ({ 
    children, 
    className = '', 
    delay = 0, 
    hover = true,
    variant = 'default' 
}: AnimatedCardProps) => {
    const variants = {
        default: {
            hover: { y: -2, boxShadow: "0 15px 30px -8px rgba(0, 0, 0, 0.2)" }
        },
        glow: {
            hover: { 
                y: -3, 
                boxShadow: "0 15px 30px -8px rgba(59, 130, 246, 0.2)"
            }
        },
        lift: {
            hover: { 
                y: -4, 
                scale: 1.01,
                boxShadow: "0 15px 30px -8px rgba(0, 0, 0, 0.2)" 
            }
        },
        scale: {
            hover: { 
                scale: 1.02,
                boxShadow: "0 15px 30px -8px rgba(0, 0, 0, 0.2)" 
            }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
                duration: 0.4, 
                delay,
                ease: "easeOut"
            }}
            whileHover={hover ? variants[variant].hover : undefined}
            className={className}
        >
            <Card className="relative overflow-hidden border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                {children}
            </Card>
        </motion.div>
    );
};

export const GlowCard = ({ children, className = '', delay = 0 }: AnimatedCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay }}
            whileHover={{ 
                scale: 1.02,
                boxShadow: "0 0 30px rgba(59, 130, 246, 0.3)"
            }}
            className={`relative ${className}`}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Card className="relative bg-white/90 backdrop-blur-sm border border-blue-200/50">
                {children}
            </Card>
        </motion.div>
    );
};