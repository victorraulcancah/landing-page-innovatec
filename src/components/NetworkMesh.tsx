import { useEffect, useRef } from 'react';

type Node = { x: number; y: number; vx: number; vy: number; r: number; glow: number };
type Packet = { from: number; to: number; t: number; speed: number };

const LINK_DISTANCE = 150;
const POINTER_RADIUS = 190;
const MAX_PACKETS = 16;
const WAVE_EVERY_MS = 14000;

/**
 * Red de nodos en movimiento lento. La idea de movimiento del sitio es "señal
 * viajando por una red": paquetes que recorren los enlaces, una onda que
 * ilumina los nodos y un puntero que atrae la malla.
 */
export function NetworkMesh({ animate = true }: { animate?: boolean }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');

        if (!canvas || !ctx) {
            return;
        }

        let width = 0;
        let height = 0;
        let nodes: Node[] = [];
        let packets: Packet[] = [];
        let frame = 0;
        let running = false;
        let wave = { r: 0, active: false };
        let lastWave = 0;
        const pointer = { x: -9999, y: -9999 };

        const populate = () => {
            const count = Math.min(120, Math.max(36, Math.round((width * height) / 11000)));

            nodes = Array.from({ length: count }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.28,
                vy: (Math.random() - 0.5) * 0.28,
                r: 0.8 + Math.random() * 1.6,
                glow: 0,
            }));
            packets = [];
        };

        const neighbors = (index: number): number[] => {
            const a = nodes[index];
            const found: number[] = [];

            for (let j = 0; j < nodes.length; j++) {
                if (j !== index && Math.hypot(a.x - nodes[j].x, a.y - nodes[j].y) < LINK_DISTANCE) {
                    found.push(j);
                }
            }

            return found;
        };

        const spawnPacket = () => {
            if (packets.length >= MAX_PACKETS || nodes.length === 0) {
                return;
            }

            const from = Math.floor(Math.random() * nodes.length);
            const options = neighbors(from);

            if (options.length === 0) {
                return;
            }

            packets.push({
                from,
                to: options[Math.floor(Math.random() * options.length)],
                t: 0,
                speed: 0.012 + Math.random() * 0.02,
            });
        };

        const draw = () => {
            ctx.clearRect(0, 0, width, height);
            ctx.lineWidth = 1;

            for (let i = 0; i < nodes.length; i++) {
                const a = nodes[i];

                for (let j = i + 1; j < nodes.length; j++) {
                    const b = nodes[j];
                    const d = Math.hypot(a.x - b.x, a.y - b.y);

                    if (d < LINK_DISTANCE) {
                        ctx.strokeStyle = `rgba(6, 194, 240, ${(1 - d / LINK_DISTANCE) * 0.42})`;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                }

                const pd = Math.hypot(a.x - pointer.x, a.y - pointer.y);

                if (pd < POINTER_RADIUS) {
                    ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - pd / POINTER_RADIUS) * 0.5})`;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(pointer.x, pointer.y);
                    ctx.stroke();
                }
            }

            // Onda de señal que recorre la red.
            if (wave.active) {
                const max = Math.hypot(width, height);
                const fade = Math.max(0, 1 - wave.r / max);

                ctx.strokeStyle = `rgba(6, 194, 240, ${0.32 * fade})`;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(width * 0.72, height * 0.38, wave.r, 0, Math.PI * 2);
                ctx.stroke();
                ctx.lineWidth = 1;
            }

            // Paquetes viajando por los enlaces.
            for (const p of packets) {
                const a = nodes[p.from];
                const b = nodes[p.to];
                const x = a.x + (b.x - a.x) * p.t;
                const y = a.y + (b.y - a.y) * p.t;
                const t0 = Math.max(0, p.t - 0.22);
                const tx = a.x + (b.x - a.x) * t0;
                const ty = a.y + (b.y - a.y) * t0;
                const grad = ctx.createLinearGradient(tx, ty, x, y);

                grad.addColorStop(0, 'rgba(6, 194, 240, 0)');
                grad.addColorStop(1, 'rgba(210, 250, 255, 0.95)');
                ctx.strokeStyle = grad;
                ctx.lineWidth = 1.6;
                ctx.beginPath();
                ctx.moveTo(tx, ty);
                ctx.lineTo(x, y);
                ctx.stroke();
                ctx.lineWidth = 1;

                ctx.fillStyle = 'rgba(230, 252, 255, 1)';
                ctx.beginPath();
                ctx.arc(x, y, 2.2, 0, Math.PI * 2);
                ctx.fill();
            }

            for (const n of nodes) {
                ctx.fillStyle = `rgba(${190 + n.glow * 60}, ${240 + n.glow * 15}, 255, ${0.9})`;
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r * (1 + n.glow * 1.8), 0, Math.PI * 2);
                ctx.fill();

                if (n.glow > 0.05) {
                    ctx.fillStyle = `rgba(6, 194, 240, ${n.glow * 0.25})`;
                    ctx.beginPath();
                    ctx.arc(n.x, n.y, n.r * 5, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        };

        const step = (now: number) => {
            for (const n of nodes) {
                const dx = n.x - pointer.x;
                const dy = n.y - pointer.y;
                const d = Math.hypot(dx, dy);

                if (d < POINTER_RADIUS && d > 0.1) {
                    const pull = (1 - d / POINTER_RADIUS) * 0.05;
                    n.vx -= (dx / d) * pull;
                    n.vy -= (dy / d) * pull;
                }

                n.vx *= 0.995;
                n.vy *= 0.995;
                n.x += n.vx;
                n.y += n.vy;
                n.glow *= 0.94;

                if (n.x < -20) n.x = width + 20;
                if (n.x > width + 20) n.x = -20;
                if (n.y < -20) n.y = height + 20;
                if (n.y > height + 20) n.y = -20;
            }

            if (wave.active) {
                wave.r += 7;
                const cx = width * 0.72;
                const cy = height * 0.38;

                for (const n of nodes) {
                    if (Math.abs(Math.hypot(n.x - cx, n.y - cy) - wave.r) < 28) {
                        n.glow = 1;
                    }
                }

                if (wave.r > Math.hypot(width, height)) {
                    wave = { r: 0, active: false };
                }
            } else if (now - lastWave > WAVE_EVERY_MS) {
                wave = { r: 0, active: true };
                lastWave = now;
            }

            if (Math.random() < 0.18) {
                spawnPacket();
            }

            packets = packets.filter((p) => {
                p.t += p.speed;

                if (p.t >= 1) {
                    nodes[p.to].glow = 1;

                    return false;
                }

                return true;
            });
        };

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = canvas.clientWidth;
            height = canvas.clientHeight;
            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            populate();
            draw();
        };

        const loop = (now: number) => {
            step(now);
            draw();
            frame = requestAnimationFrame(loop);
        };

        const start = () => {
            if (!running && animate) {
                running = true;
                lastWave = performance.now();
                wave = { r: 0, active: true };
                frame = requestAnimationFrame(loop);
            }
        };

        const stop = () => {
            running = false;
            cancelAnimationFrame(frame);
        };

        const onMove = (e: PointerEvent) => {
            const rect = canvas.getBoundingClientRect();
            pointer.x = e.clientX - rect.left;
            pointer.y = e.clientY - rect.top;
        };

        const observer = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()));

        resize();

        if (!animate) {
            // Sin animación: la malla avanza unos pasos y queda quieta, sin paquetes.
            for (let i = 0; i < 120; i++) {
                for (const n of nodes) {
                    n.x += n.vx;
                    n.y += n.vy;
                }
            }

            draw();
        }

        observer.observe(canvas);
        window.addEventListener('resize', resize);
        window.addEventListener('pointermove', onMove);

        return () => {
            stop();
            observer.disconnect();
            window.removeEventListener('resize', resize);
            window.removeEventListener('pointermove', onMove);
        };
    }, [animate]);

    return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 size-full" />;
}
