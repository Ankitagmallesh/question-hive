'use client';

import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    color?: 'blue' | 'green' | 'purple' | 'white';
    text?: string;
}

export const LoadingSpinner = ({ 
    size = 'md', 
    color = 'blue', 
    text 
}: LoadingSpinnerProps) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };

    const colorClasses = {
        blue: 'border-blue-600',
        green: 'border-green-600',
        purple: 'border-purple-600',
        white: 'border-white'
    };

    return (
        <div className="flex flex-col items-center justify-center space-y-2">
            <motion.div
                className={`${sizeClasses[size]} border-2 ${colorClasses[color]} border-t-transparent rounded-full`}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            {text && (
                <motion.p
                    className="text-sm text-gray-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    {text}
                </motion.p>
            )}
        </div>
    );
};

export const PulseLoader = ({ color = 'blue' }: { color?: 'blue' | 'green' | 'purple' }) => {
    const colorClasses = {
        blue: 'bg-blue-600',
        green: 'bg-green-600',
        purple: 'bg-purple-600'
    };

    return (
        <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className={`w-2 h-2 ${colorClasses[color]} rounded-full`}
                    animate={{ y: [0, -8, 0] }}
                    transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.2
                    }}
                />
            ))}
        </div>
    );
};

export const SkeletonLoader = ({ className = '' }: { className?: string }) => {
    return (
        <motion.div
            className={`bg-gray-200 rounded animate-pulse ${className}`}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
        />
    );
};