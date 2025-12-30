"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TooltipProps {
    content: React.ReactNode;
    children: React.ReactNode;
}

export default function Tooltip({ content, children }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);

    // 터치 기기 감지
    useEffect(() => {
        setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    }, []);

    // 외부 클릭/터치 시 툴팁 닫기
    const handleClickOutside = useCallback((event: MouseEvent | TouchEvent) => {
        if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
            setIsVisible(false);
        }
    }, []);

    useEffect(() => {
        if (isVisible && isTouchDevice) {
            document.addEventListener('touchstart', handleClickOutside);
            document.addEventListener('click', handleClickOutside);
            return () => {
                document.removeEventListener('touchstart', handleClickOutside);
                document.removeEventListener('click', handleClickOutside);
            };
        }
    }, [isVisible, isTouchDevice, handleClickOutside]);

    // 터치 기기에서는 hover 무시, 클릭으로만 토글
    const handleMouseEnter = () => {
        if (!isTouchDevice) {
            setIsVisible(true);
        }
    };

    const handleMouseLeave = () => {
        if (!isTouchDevice) {
            setIsVisible(false);
        }
    };

    const handleClick = (e: React.MouseEvent) => {
        if (isTouchDevice) {
            e.preventDefault();
            e.stopPropagation();
            setIsVisible(!isVisible);
        }
    };

    return (
        <div
            ref={tooltipRef}
            className="relative inline-flex"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
        >
            {children}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-1/2 top-full mt-2 -translate-x-1/2 z-50 whitespace-nowrap pointer-events-none"
                    >
                        <div className="bg-grey-900/90 text-grey-50 text-xs px-3 py-1.5 rounded-lg shadow-xl backdrop-blur-sm border border-grey-700/20">
                            {content}
                            <div className="absolute -top-1 left-1/2 -ml-1 border-4 border-transparent border-b-grey-900/90" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
