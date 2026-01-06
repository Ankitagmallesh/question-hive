'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface PageTransitionProps {
    children: ReactNode;
    className?: string;
}

export const PageTransition = ({ children, className = '' }: PageTransitionProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export const SlideTransition = ({ children, direction = 'right' }: { 
    children: ReactNode; 
    direction?: 'left' | 'right' | 'up' | 'down' 
}) => {
    const variants = {
        left: { x: -100 },
        right: { x: 100 },
        up: { y: -100 },
        down: { y: 100 }
    };

    return (
        <motion.div
            initial={{ opacity: 0, ...variants[direction] }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, ...variants[direction] }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
        >
            {children}
        </motion.div>
    );
};

export const ScaleTransition = ({ children }: { children: ReactNode }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
        >
            {children}
        </motion.div>
    );
};

export const StaggerContainer = ({ children, staggerDelay = 0.1 }: { 
    children: ReactNode; 
    staggerDelay?: number 
}) => {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: {
                        staggerChildren: staggerDelay
                    }
                }
            }}
        >
            {children}
        </motion.div>
    );
};

export const StaggerItem = ({ children, className = '' }: { 
    children: ReactNode; 
    className?: string 
}) => {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    );
};