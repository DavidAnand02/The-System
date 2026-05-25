
import React, { useEffect, useRef } from 'react';

interface BackgroundProps {
  themeColor?: string;
}

const Background: React.FC<BackgroundProps> = React.memo(({ themeColor }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, radius: 300 });
  const ripplesRef = useRef<any[]>([]);
  const requestRef = useRef<number>(0);
  const baseHueRef = useRef(190);
  const bgColorRef = useRef('#020617');

  const getThemeColors = (theme?: string) => {
    switch (theme) {
      case 'emerald': return { hue: 150, bg: '#022c22' };
      case 'amber': return { hue: 45, bg: '#451a03' };
      case 'rose': return { hue: 350, bg: '#4c0519' };
      case 'violet': return { hue: 260, bg: '#2e1065' };
      case 'blue': return { hue: 210, bg: '#172554' };
      default: return { hue: 190, bg: '#020617' }; // Cyan/Default
    }
  };

  useEffect(() => {
    const { hue, bg } = getThemeColors(themeColor);
    baseHueRef.current = hue;
    bgColorRef.current = bg;
  }, [themeColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width: number;
    let height: number;
    let dpr = window.devicePixelRatio || 1;
    let globalHue = baseHueRef.current;

    class Ripple {
      x: number; y: number; radius: number; maxRadius: number; speed: number; life: number;
      constructor(x: number, y: number) {
        this.x = x; this.y = y; this.radius = 0; this.maxRadius = 500; this.speed = 10; this.life = 1.0;
      }
      update() {
        this.radius += this.speed;
        this.life -= 0.015;
        return this.life > 0;
      }
    }

    class MagneticNode {
      x: number; y: number; vx: number; vy: number; strength: number; swirl: boolean; active: boolean;
      constructor(w: number, h: number) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.strength = (Math.random() - 0.5) * 3;
        this.swirl = Math.random() > 0.7; // Some nodes cause orbital swirls
        this.active = true;
      }
      update(w: number, h: number) {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > w) this.vx *= -1;
        if (this.y < 0 || this.y > h) this.vy *= -1;
        // Occasionally flip swirl behavior
        if (Math.random() < 0.001) this.swirl = !this.swirl;
      }
    }

    class Particle {
      x: number; y: number; size: number; baseSize: number; vx: number; vy: number;
      angle: number; spin: number; opacity: number; pulse: number; pulseSpeed: number;
      glowScale: number; depth: number; hueOffset: number;
      history: { x: number, y: number }[];
      maxHistory: number;

      constructor(w: number, h: number) {
        this.depth = Math.random();
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        // Increased variety in base size
        this.baseSize = 0.8 + this.depth * 4.5;
        this.size = this.baseSize;
        const speedMult = (0.3 + this.depth * 0.7);
        this.vx = (Math.random() - 0.5) * speedMult;
        this.vy = (Math.random() - 0.5) * speedMult;
        this.angle = Math.random() * Math.PI * 2;
        this.spin = (Math.random() - 0.5) * 0.02;
        this.opacity = 0.1 + this.depth * 0.5;
        this.pulse = Math.random() * Math.PI;
        this.pulseSpeed = 0.01 + Math.random() * 0.03;
        // Significantly increased variety in glow scale
        this.glowScale = 3 + this.depth * 12;
        this.hueOffset = Math.random() * 40 - 20;
        this.history = [];
        this.maxHistory = 6; // Number of trail segments
      }

      update(w: number, h: number, mouse: any, nodes: MagneticNode[], ripples: Ripple[], currentScrollY: number) {
        const scrollFactor = 0.15 + this.depth * 0.45;
        const effY = this.y - currentScrollY * scrollFactor;

        // Store history for trails
        this.history.unshift({ x: this.x, y: this.y });
        if (this.history.length > this.maxHistory) this.history.pop();

        this.angle += this.spin;
        this.pulse += this.pulseSpeed;
        this.size = this.baseSize * (0.8 + Math.sin(this.pulse) * 0.2);

        // Movement with ambient drift
        this.x += this.vx + Math.cos(this.angle) * 0.1;
        this.y += this.vy + Math.sin(this.angle) * 0.1;

        // --- RIPPLE REACTION (Shockwaves) ---
        ripples.forEach(r => {
          const rdx = this.x - r.x;
          // Calculate relative to the effective y position
          const rdy = effY - r.y;
          const rdist = Math.sqrt(rdx * rdx + rdy * rdy);
          const diff = Math.abs(rdist - r.radius);
          if (diff < 100) {
            const force = (1 - diff / 100) * r.life * 15 * (0.5 + this.depth);
            this.vx += (rdx / rdist) * force;
            this.vy += (rdy / rdist) * force;
          }
        });

        // --- MAGNETIC NODES & SWIRLS ---
        nodes.forEach(node => {
          const dx = node.x - this.x;
          // Calculate relative to effective y position
          const dy = node.y - effY;
          const distSq = dx * dx + dy * dy;
          const dist = Math.sqrt(distSq);
          if (dist < 350) {
            const force = (350 - dist) / 4000 * node.strength;
            if (node.swirl) {
              // Tangential force for spiraling clusters
              this.vx += (dy / dist) * force * 1.5;
              this.vy -= (dx / dist) * force * 1.5;
              // Add slight pull to center
              this.vx += (dx / dist) * force * 0.5;
              this.vy += (dy / dist) * force * 0.5;
            } else {
              this.vx += (dx / dist) * force;
              this.vy += (dy / dist) * force;
            }
          }
        });

        // Limit velocity
        const maxVel = 3.5 * (0.4 + this.depth * 0.6);
        const curSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (curSpeed > maxVel) {
          this.vx = (this.vx / curSpeed) * maxVel;
          this.vy = (this.vy / curSpeed) * maxVel;
        }

        // Friction / Decay
        this.vx *= 0.98;
        this.vy *= 0.98;

        // --- SYSTEM SHIELD (Central Area) ---
        const shieldWidth = Math.min(w * 0.85, 700);
        const shieldHeight = h * 0.9;
        const shieldX = (w - shieldWidth) / 2;
        const shieldY = (h - shieldHeight) / 2;

        if (this.x > shieldX - 40 && this.x < shieldX + shieldWidth + 40 &&
            effY > shieldY - 40 && effY < shieldY + shieldHeight + 40) {
          const centerX = w / 2;
          const centerY = h / 2;
          const dx = this.x - centerX;
          const dy = effY - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const force = 0.5;
          this.x += (dx / dist) * force;
          this.y += (dy / dist) * force;
        }

        // Mouse avoidance/attraction
        const mdx = mouse.x - this.x;
        const mdy = mouse.y - effY;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < mouse.radius) {
          const mforce = (mouse.radius - mdist) / mouse.radius;
          this.x -= (mdx / mdist) * mforce * 4;
          this.y -= (mdy / mdist) * mforce * 4;
        }

        // Screen wrap (incorporating active scroll bounds)
        const buffer = 100;
        if (this.x > w + buffer) this.x = -buffer;
        else if (this.x < -buffer) this.x = w + buffer;

        // Check if effective (rendered) Y goes out of viewport bounds
        if (effY > h + buffer) {
          // Warp up to top of screen
          const shift = h + 2 * buffer;
          this.y -= shift;
          this.history = this.history.map(pt => ({ x: pt.x, y: pt.y - shift }));
        } else if (effY < -buffer) {
          // Warp down to bottom of screen
          const shift = h + 2 * buffer;
          this.y += shift;
          this.history = this.history.map(pt => ({ x: pt.x, y: pt.y + shift }));
        }
      }

      draw(context: CanvasRenderingContext2D, mouse: any, currentScrollY: number) {
        const scrollFactor = 0.15 + this.depth * 0.45;
        const effY = this.y - currentScrollY * scrollFactor;

        const mdx = mouse.x - this.x;
        const mdy = mouse.y - effY;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        const proximity = mdist < mouse.radius ? (1 - mdist / mouse.radius) : 0;
        
        const hue = (globalHue + this.hueOffset) % 360;
        const currentOpacity = this.opacity * (0.6 + Math.sin(this.pulse) * 0.4 + proximity * 0.4);
        const glowRadius = this.size * (this.glowScale + proximity * 8);

        context.save();
        
        // Draw Trail from history (with wrap detection)
        if (this.history.length > 1) {
          context.beginPath();
          // Start trail drawing from effective current coordinates
          context.moveTo(this.x, effY);
          let lastX = this.x;
          let lastY = effY;

          for (let i = 0; i < this.history.length; i++) {
            const p = this.history[i];
            const pEffY = p.y - currentScrollY * scrollFactor;
            
            // If the distance is too large, it wrapped around the screen
            // Stop drawing this trail segment to prevent "energy beams"
            const dx = Math.abs(p.x - lastX);
            const dy = Math.abs(pEffY - lastY);
            if (dx > 200 || dy > 200) break; 

            context.lineTo(p.x, pEffY);
            lastX = p.x;
            lastY = pEffY;
          }
          context.strokeStyle = `hsla(${hue}, 80%, 60%, ${currentOpacity * 0.3})`;
          context.lineWidth = this.size * 0.8;
          context.lineCap = 'round';
          context.stroke();
        }

        const grad = context.createRadialGradient(this.x, effY, 0, this.x, effY, glowRadius);
        grad.addColorStop(0, `hsla(${hue}, 90%, 80%, ${currentOpacity})`);
        grad.addColorStop(0.2, `hsla(${hue}, 80%, 60%, ${currentOpacity * 0.5})`);
        grad.addColorStop(1, `hsla(${hue}, 80%, 50%, 0)`);

        context.beginPath();
        context.arc(this.x, effY, glowRadius, 0, Math.PI * 2);
        context.fillStyle = grad;
        context.fill();

        // High intensity core
        context.beginPath();
        context.arc(this.x, effY, this.size * 0.5, 0, Math.PI * 2);
        context.fillStyle = '#ffffff';
        context.fill();
        context.restore();
      }
    }

    const particles: Particle[] = [];
    const nodes: MagneticNode[] = [];
    const pCount = 140;
    const nCount = 6;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);

      particles.length = 0;
      for (let i = 0; i < pCount; i++) particles.push(new Particle(width, height));
      nodes.length = 0;
      for (let i = 0; i < nCount; i++) nodes.push(new MagneticNode(width, height));
    };

    resize();

    const animate = () => {
      // FULL CLEAR every frame to ensure no permanent marks
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = bgColorRef.current; 
      ctx.fillRect(0, 0, width, height);
      
      // Get current scroll position
      const currentScrollY = window.pageYOffset || window.scrollY || 0;
      
      // Adjusted globalHue oscillation to target the base theme hue
      globalHue = baseHueRef.current + Math.sin(Date.now() * 0.00015) * 20;

      // Update ripples
      ripplesRef.current = ripplesRef.current.filter(r => r.update());
      
      // Update nodes
      nodes.forEach(n => n.update(width, height));

      // Draw interactive shockwaves (visual only)
      ripplesRef.current.forEach(r => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        // Reduced ripple opacity
        ctx.strokeStyle = `rgba(165, 243, 252, ${r.life * 0.15})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      });

      particles.forEach(p => {
        p.update(width, height, mouseRef.current, nodes, ripplesRef.current, currentScrollY);
        p.draw(ctx, mouseRef.current, currentScrollY);
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleClick = (e: MouseEvent) => {
      ripplesRef.current.push(new Ripple(e.clientX, e.clientY));
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };

    window.addEventListener('mousedown', handleClick);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', resize);
    
    return () => {
      cancelAnimationFrame(requestRef.current);
      window.removeEventListener('mousedown', handleClick);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none" 
      style={{ touchAction: 'none', background: getThemeColors(themeColor).bg }}
    />
  );
});

export default Background;
