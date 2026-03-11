"use client";

import { useEffect, useRef } from "react";

interface Snowflake {
    x: number;
    y: number;
    radius: number;
    speed: number;
    opacity: number;
    drift: number;
    angle: number;
}

interface SnowEffectProps {
    enabled: boolean;
}

export default function SnowEffect({ enabled }: SnowEffectProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animFrameRef = useRef<number | null>(null);
    const snowflakesRef = useRef<Snowflake[]>([]);

    useEffect(() => {
        if (!enabled) {
            if (animFrameRef.current) {
                cancelAnimationFrame(animFrameRef.current);
                animFrameRef.current = null;
            }
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext("2d");
                ctx?.clearRect(0, 0, canvas.width, canvas.height);
            }
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        // Initialize snowflakes
        const COUNT = 160;
        snowflakesRef.current = Array.from({ length: COUNT }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            radius: Math.random() * 3 + 1,
            speed: Math.random() * 1.5 + 0.5,
            opacity: Math.random() * 0.6 + 0.3,
            drift: (Math.random() - 0.5) * 0.6,
            angle: Math.random() * Math.PI * 2,
        }));

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (const flake of snowflakesRef.current) {
                ctx.beginPath();
                ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
                ctx.fill();

                // Update position
                flake.angle += 0.01;
                flake.y += flake.speed;
                flake.x += flake.drift + Math.sin(flake.angle) * 0.3;

                // Reset when out of view
                if (flake.y > canvas.height + 10) {
                    flake.y = -10;
                    flake.x = Math.random() * canvas.width;
                }
                if (flake.x > canvas.width + 10) flake.x = -10;
                if (flake.x < -10) flake.x = canvas.width + 10;
            }

            animFrameRef.current = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener("resize", resize);
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, [enabled]);

    if (!enabled) return null;

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-[9999]"
            style={{ mixBlendMode: "screen" }}
        />
    );
}
