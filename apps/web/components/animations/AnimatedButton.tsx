'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { Button } from '../../app/components/ui/button';

interface AnimatedButtonProps {
    children: ReactNode;
    onClick?: () => void;
    className?: string;
    variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    animation?: 'bounce' | 'pulse' | 'glow' | 'shimmer';
}

export const AnimatedButton = ({ 
    children, 
    onClick, 
    className = '', 
    variant = 'default',
    size = 'default',
    disabled = false,
    type = 'button',
    animation = 'bounce'
}: AnimatedButtonProps) => {
    const animations = {
        bounce: {
            whileHover: { scale: 1.02, y: -1 },
            whileTap: { scale: 0.98 }
        },
        pulse: {
            whileHover: { scale: 1.01 },
            whileTap: { scale: 0.99 }
        },
        glow: {
            whileHover: { 
                scale: 1.02, 
                boxShadow: "0 0 15px rgba(59, 130, 246, 0.3)" 
            },
            whileTap: { scale: 0.98 }
        },
        shimmer: {
            whileHover: { scale: 1.02 },
            whileTap: { scale: 0.98 }
        }
    };

    return (
        <motion.div
            {...animations[animation]}
            className={animation === 'shimmer' ? 'relative overflow-hidden' : ''}
        >
            <Button
                onClick={onClick}
                variant={variant}
                size={size}
                disabled={disabled}
                type={type}
                className={`relative transition-all duration-300 ${className}`}
            >
                {animation === 'shimmer' && (
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />
                )}
                {children}
            </Button>
        </motion.div>
    );
};

export const FloatingActionButton = ({ 
    children, 
    onClick, 
    className = '' 
}: { 
    children: ReactNode; 
    onClick?: () => void; 
    className?: string; 
}) => {
    return (
        <motion.div
            whileHover={{ 
                scale: 1.05, 
                boxShadow: "0 8px 25px rgba(59, 130, 246, 0.25)" 
            }}
            whileTap={{ scale: 0.95 }}
        >
            <Button
                onClick={onClick}
                className={`shadow-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 ${className}`}
            >
                {children}
            </Button>
        </motion.div>
    );
};