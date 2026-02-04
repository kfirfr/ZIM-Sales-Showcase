"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface AnimatedTitleProps {
    children: React.ReactNode;
    className?: string;
    as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "span";
    delay?: number;
}

export const AnimatedTitle: React.FC<AnimatedTitleProps> = ({
    children,
    className = "",
    as = "h2",
    delay = 0
}) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Component = motion[as] as any;

    return (
        <Component
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
            className={`animated-gradient-text font-bold ${className}`}
        >
            {children}
        </Component>
    );
};
