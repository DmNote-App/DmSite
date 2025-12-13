"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef, ReactNode } from "react";

interface ParallaxProps {
  children: ReactNode;
  speed?: number; // 양수: 느리게, 음수: 빠르게
  className?: string;
}

// 패럴랙스 효과를 위한 컴포넌트
export function Parallax({ children, speed = 0.5, className = "" }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [speed * 100, -speed * 100]);
  // 스프링 설정 최적화 - 높은 damping으로 떨림 방지
  const smoothY = useSpring(y, { stiffness: 300, damping: 50, restDelta: 0.001 });

  return (
    <motion.div ref={ref} style={{ y: smoothY }} className={`${className} will-change-transform`}>
      {children}
    </motion.div>
  );
}

interface ScrollFadeProps {
  children: ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
  delay?: number;
}

// 스크롤 시 페이드 인 효과
export function ScrollFade({
  children,
  className = "",
  direction = "up",
  distance = 60,
  delay = 0,
}: ScrollFadeProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  const directions = {
    up: { x: 0, y: distance },
    down: { x: 0, y: -distance },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
  };

  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.5, 1]);
  const x = useTransform(
    scrollYProgress,
    [0, 1],
    [directions[direction].x, 0]
  );
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [directions[direction].y, 0]
  );

  // 스프링 설정 최적화 - 높은 damping으로 떨림 방지
  const springConfig = { stiffness: 300, damping: 50, restDelta: 0.001 };
  const smoothOpacity = useSpring(opacity, springConfig);
  const smoothX = useSpring(x, springConfig);
  const smoothY = useSpring(y, springConfig);

  return (
    <motion.div
      ref={ref}
      style={{
        opacity: smoothOpacity,
        x: smoothX,
        y: smoothY,
      }}
      transition={{ delay }}
      className={`${className} will-change-[transform,opacity]`}
    >
      {children}
    </motion.div>
  );
}

interface ScrollScaleProps {
  children: ReactNode;
  className?: string;
  scaleFrom?: number;
  scaleTo?: number;
}

// 스크롤 시 스케일 효과
export function ScrollScale({
  children,
  className = "",
  scaleFrom = 0.8,
  scaleTo = 1,
}: ScrollScaleProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [scaleFrom, scaleTo]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 1], [0, 0.5, 1]);

  // 스프링 설정 최적화 - 높은 damping으로 떨림 방지
  const springConfig = { stiffness: 300, damping: 50, restDelta: 0.001 };
  const smoothScale = useSpring(scale, springConfig);
  const smoothOpacity = useSpring(opacity, springConfig);

  return (
    <motion.div
      ref={ref}
      style={{
        scale: smoothScale,
        opacity: smoothOpacity,
      }}
      className={`${className} will-change-[transform,opacity]`}
    >
      {children}
    </motion.div>
  );
}

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  staggerChildren?: number;
}

// 순차적으로 나타나는 효과 (카드 그리드 등에 사용)
export function ScrollReveal({
  children,
  className = "",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 0.5], [30, 0]);

  return (
    <motion.div
      ref={ref}
      style={{ opacity, y }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
