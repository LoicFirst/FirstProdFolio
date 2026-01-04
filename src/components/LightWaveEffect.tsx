'use client';

import { useEffect, useRef, useState } from 'react';

interface LightWaveEffectProps {
  enabled?: boolean;
}

export default function LightWaveEffect({ enabled = true }: LightWaveEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const animationRef = useRef<number | undefined>(undefined);
  const [isVisible, setIsVisible] = useState(false);
  const isVisibleRef = useRef(isVisible);
  
  // Keep ref in sync with state
  useEffect(() => {
    isVisibleRef.current = isVisible;
  }, [isVisible]);

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor;
    };

    // Set initial canvas size
    const updateSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateSize();

    // Animation loop
    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Smooth mouse movement
      mouseRef.current.x = lerp(mouseRef.current.x, mouseRef.current.targetX, 0.08);
      mouseRef.current.y = lerp(mouseRef.current.y, mouseRef.current.targetY, 0.08);

      const { x, y } = mouseRef.current;

      // Create larger gradient for better visibility across the page
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 600);
      
      // Primary color wave (blue) - increased opacity for better visibility
      gradient.addColorStop(0, 'rgba(52, 152, 219, 0.25)');
      gradient.addColorStop(0.2, 'rgba(52, 152, 219, 0.15)');
      gradient.addColorStop(0.5, 'rgba(46, 204, 113, 0.08)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Secondary smaller glow - increased visibility
      const innerGradient = ctx.createRadialGradient(x, y, 0, x, y, 250);
      innerGradient.addColorStop(0, 'rgba(52, 152, 219, 0.2)');
      innerGradient.addColorStop(0.4, 'rgba(155, 89, 182, 0.1)');
      innerGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = innerGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animationRef.current = requestAnimationFrame(animate);
    };

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
      
      if (!isVisibleRef.current) {
        setIsVisible(true);
        mouseRef.current.x = e.clientX;
        mouseRef.current.y = e.clientY;
      }
    };

    // Touch move handler for mobile
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current.targetX = e.touches[0].clientX;
        mouseRef.current.targetY = e.touches[0].clientY;
        
        if (!isVisibleRef.current) {
          setIsVisible(true);
          mouseRef.current.x = e.touches[0].clientX;
          mouseRef.current.y = e.touches[0].clientY;
        }
      }
    };

    // Mouse leave handler
    const handleMouseLeave = () => {
      // Fade out by moving to edge
      mouseRef.current.targetX = -500;
      mouseRef.current.targetY = -500;
    };

    window.addEventListener('resize', updateSize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Start animation
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[5]"
      style={{ 
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.5s ease-out',
        mixBlendMode: 'screen',
      }}
      aria-hidden="true"
    />
  );
}
