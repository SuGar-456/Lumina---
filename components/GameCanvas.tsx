import React, { useRef, useEffect } from 'react';
import { Theme, Particle, DailyChallenge, Collectible, StressBlob, Shockwave, GravityWell, WindStroke } from '../types';

interface GameCanvasProps {
  theme: Theme;
  challenge: DailyChallenge;
  onProgressUpdate: (increment: number) => void;
  breathingMode: boolean;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ theme, challenge, onProgressUpdate, breathingMode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Entity Refs
  const particlesRef = useRef<Particle[]>([]);
  const collectiblesRef = useRef<Collectible[]>([]);
  const blobsRef = useRef<StressBlob[]>([]);
  const shockwavesRef = useRef<Shockwave[]>([]);
  const gravityWellsRef = useRef<GravityWell[]>([]);
  const windStrokesRef = useRef<WindStroke[]>([]);
  
  // State Refs
  const mouseRef = useRef({ x: -1000, y: -1000, isDown: false, isRightDown: false, active: false, vx: 0, vy: 0, lastX: 0, lastY: 0 });
  const animationFrameRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const focusTimeAccumulatorRef = useRef<number>(0);
  const breathingPhaseRef = useRef<number>(0); // 0 to 2PI

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    
    window.addEventListener('resize', resize);
    resize();

    // Prevent context menu on right click for Wind Painting
    const preventContext = (e: MouseEvent) => e.preventDefault();
    canvas.addEventListener('contextmenu', preventContext);

    // Initialize Particles
    const initParticles = () => {
      const count = width < 768 ? 80 : 180; 
      particlesRef.current = [];
      for (let i = 0; i < count; i++) {
        particlesRef.current.push(createParticle(width, height, theme.colors));
      }
    };

    // Initialize Challenge Items
    const initCollectibles = () => {
      collectiblesRef.current = [];
      if (challenge.type === 'collect' && !challenge.completed) {
        const remaining = Math.max(0, challenge.target - challenge.progress);
        const toSpawn = Math.min(3, remaining);
        for(let i=0; i<toSpawn; i++) {
            collectiblesRef.current.push(createCollectible(width, height));
        }
      }
    };

    initParticles();
    initCollectibles();

    // Helper: Spawn Shockwave
    const spawnShockwave = (x: number, y: number, color: string) => {
        shockwavesRef.current.push({
            x, y, radius: 1, maxRadius: 300, alpha: 1, color
        });
    };

    // Helper: Spawn Blob (Enemy)
    const spawnBlob = () => {
        if (blobsRef.current.length < 3) {
            const r = 40 + Math.random() * 40;
            blobsRef.current.push({
                id: Math.random(),
                x: Math.random() * width,
                y: Math.random() * height,
                radius: r,
                originalRadius: r,
                health: 100,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5
            });
        }
    };

    // Main Loop
    const render = (time: number) => {
      const dt = (time - lastFrameTimeRef.current) / 1000;
      lastFrameTimeRef.current = time;

      // Calculate mouse velocity for "scrubbing" mechanic
      const mvx = mouseRef.current.x - mouseRef.current.lastX;
      const mvy = mouseRef.current.y - mouseRef.current.lastY;
      mouseRef.current.vx = mvx;
      mouseRef.current.vy = mvy;
      mouseRef.current.lastX = mouseRef.current.x;
      mouseRef.current.lastY = mouseRef.current.y;
      
      const mouseSpeed = Math.sqrt(mvx*mvx + mvy*mvy);

      // Add Wind Stroke if Right Click is down and moving
      if (mouseRef.current.isRightDown && mouseSpeed > 2) {
         windStrokesRef.current.push({
             x: mouseRef.current.x,
             y: mouseRef.current.y,
             vx: mvx * 0.2, // Dampen the input velocity
             vy: mvy * 0.2,
             life: 60 // Frames
         });
      }

      // Breathing Phase Update
      if (breathingMode) {
          // 0.2 speed = approx 5 seconds per cycle, slow and deep
          breathingPhaseRef.current += dt * 0.8; 
      }

      // --- Background & Trails ---
      // We use a lower alpha to create trails
      ctx.fillStyle = 'rgba(5, 5, 10, 0.2)'; 
      ctx.fillRect(0, 0, width, height);
      
      // --- Render Shockwaves ---
      ctx.lineWidth = 4;
      shockwavesRef.current.forEach((sw, i) => {
          sw.radius += 8; // Expand speed
          sw.alpha -= 0.02; // Fade speed

          if (sw.alpha <= 0) {
              shockwavesRef.current.splice(i, 1);
          } else {
              ctx.beginPath();
              ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
              ctx.strokeStyle = `rgba(255, 255, 255, ${sw.alpha * 0.5})`;
              ctx.stroke();
          }
      });

      // --- Render Gravity Wells ---
      gravityWellsRef.current.forEach((well, i) => {
          well.life -= 1;
          if (well.life <= 0) {
              gravityWellsRef.current.splice(i, 1);
          } else {
              // Draw swirling void
              ctx.beginPath();
              ctx.arc(well.x, well.y, 10 + Math.sin(time/100)*5, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, well.life/50) * 0.8})`;
              ctx.fill();
              
              // Draw Orbit ring
              ctx.beginPath();
              ctx.arc(well.x, well.y, 30, time/100, time/100 + Math.PI);
              ctx.strokeStyle = `rgba(100, 200, 255, ${Math.min(1, well.life/50) * 0.5})`;
              ctx.stroke();
          }
      });

      // --- Render Wind Strokes ---
      ctx.beginPath();
      windStrokesRef.current.forEach((wind, i) => {
          wind.life--;
          if (wind.life <= 0) {
              windStrokesRef.current.splice(i, 1);
          } else {
              ctx.moveTo(wind.x, wind.y);
              ctx.lineTo(wind.x - wind.vx * 3, wind.y - wind.vy * 3);
          }
      });
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.stroke();

      // --- Render Stress Blobs (Enemies) ---
      // Occasionally spawn a blob
      if (!breathingMode && Math.random() < 0.005) spawnBlob();

      blobsRef.current.forEach((blob, i) => {
          // Move blob
          blob.x += blob.vx;
          blob.y += blob.vy;

          // Wrap edges
          if (blob.x < -100) blob.x = width + 100;
          if (blob.x > width + 100) blob.x = -100;
          if (blob.y < -100) blob.y = height + 100;
          if (blob.y > height + 100) blob.y = -100;

          // Interaction: Scrub away
          const dx = mouseRef.current.x - blob.x;
          const dy = mouseRef.current.y - blob.y;
          const dist = Math.sqrt(dx*dx + dy*dy);

          if (dist < blob.radius + 20) {
              // Damage logic: Higher mouse speed = more damage
              const damage = 1 + (mouseSpeed * 0.5);
              blob.health -= damage;
              blob.radius = blob.originalRadius * (blob.health / 100);
          }

          if (blob.health <= 0) {
              // DESTROYED!
              spawnShockwave(blob.x, blob.y, '#FFF');
              blobsRef.current.splice(i, 1);
              
              // Spawn reward particles
              for(let k=0; k<20; k++) {
                  const p = createParticle(width, height, theme.colors);
                  p.x = blob.x;
                  p.y = blob.y;
                  p.vx = (Math.random() - 0.5) * 15; // Explosion velocity
                  p.vy = (Math.random() - 0.5) * 15;
                  p.color = '#FFF'; // Flash white/gold
                  p.life = 60;
                  particlesRef.current.push(p);
              }
          } else {
              // Draw Blob
              const gradient = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.radius);
              gradient.addColorStop(0, 'rgba(20, 0, 20, 0.9)');
              gradient.addColorStop(0.7, 'rgba(40, 10, 40, 0.4)');
              gradient.addColorStop(1, 'rgba(0,0,0,0)');
              
              ctx.fillStyle = gradient;
              ctx.beginPath();
              ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
              ctx.fill();
          }
      });


      // --- Collectible Logic ---
      ctx.globalCompositeOperation = 'lighter';
      if (challenge.type === 'collect' && !challenge.completed && !breathingMode) {
         const remainingNeeded = challenge.target - challenge.progress;
         const activeCollectibles = collectiblesRef.current.filter(c => !c.collected);
         if (activeCollectibles.length === 0 && remainingNeeded > 0) {
            collectiblesRef.current.push(createCollectible(width, height));
         }

         collectiblesRef.current.forEach(c => {
             if (!c.collected) {
                 drawCollectible(ctx, c, time);
                 if (mouseRef.current.active) {
                     const dx = mouseRef.current.x - c.x;
                     const dy = mouseRef.current.y - c.y;
                     if (Math.sqrt(dx*dx + dy*dy) < c.radius + 30) {
                         c.collected = true;
                         onProgressUpdate(1);
                         spawnShockwave(c.x, c.y, '#FFD700');
                     }
                 }
             }
         });
      }

      // --- Focus Logic ---
      if (challenge.type === 'focus' && !challenge.completed && mouseRef.current.isDown && !breathingMode) {
          focusTimeAccumulatorRef.current += dt;
          if (focusTimeAccumulatorRef.current >= 0.1) {
              onProgressUpdate(0.1);
              focusTimeAccumulatorRef.current = 0;
          }
      }

      // --- Particles Logic ---
      // Breathing Factor: -1 (Inhale/Contract) to 1 (Exhale/Expand)
      const breathingFactor = breathingMode ? Math.sin(breathingPhaseRef.current) : 0;
      const centerW = width / 2;
      const centerH = height / 2;

      particlesRef.current.forEach((p, index) => {
        // Shockwave interaction
        shockwavesRef.current.forEach(sw => {
            const dx = p.x - sw.x;
            const dy = p.y - sw.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            // If particle is near the shockwave ring
            if (Math.abs(dist - sw.radius) < 50) {
                const angle = Math.atan2(dy, dx);
                const force = 5 * sw.alpha;
                p.vx += Math.cos(angle) * force;
                p.vy += Math.sin(angle) * force;
            }
        });

        // Gravity Wells Interaction
        gravityWellsRef.current.forEach(well => {
            const dx = well.x - p.x;
            const dy = well.y - p.y;
            const distSq = dx*dx + dy*dy;
            const dist = Math.sqrt(distSq);
            
            if (dist < 400 && dist > 10) {
                const force = well.strength / dist; 
                const angle = Math.atan2(dy, dx);
                
                // Pull in
                p.vx += Math.cos(angle) * force;
                p.vy += Math.sin(angle) * force;

                // Spin (Tangential force)
                p.vx += Math.cos(angle + Math.PI/2) * force * 1.5;
                p.vy += Math.sin(angle + Math.PI/2) * force * 1.5;
            }
        });

        // Wind Strokes Interaction
        windStrokesRef.current.forEach(wind => {
             const dx = p.x - wind.x;
             const dy = p.y - wind.y;
             if (dx*dx + dy*dy < 2500) { // Within 50px radius
                 p.vx += wind.vx * 0.5;
                 p.vy += wind.vy * 0.5;
             }
        });

        // Blob Repulsion (Particles avoid the stress blobs)
        blobsRef.current.forEach(blob => {
            const dx = p.x - blob.x;
            const dy = p.y - blob.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < blob.radius + 20) {
                const angle = Math.atan2(dy, dx);
                p.vx += Math.cos(angle) * 0.5;
                p.vy += Math.sin(angle) * 0.5;
            }
        });

        // Breathing Mode Physics
        if (breathingMode) {
             const dx = p.x - centerW;
             const dy = p.y - centerH;
             const dist = Math.sqrt(dx*dx + dy*dy);
             
             // Normalize direction
             const nx = dx / (dist || 1);
             const ny = dy / (dist || 1);

             // Pulse logic: 
             // If breathingFactor > 0 (Exhale), push out.
             // If breathingFactor < 0 (Inhale), pull in.
             p.vx += nx * breathingFactor * 0.2;
             p.vy += ny * breathingFactor * 0.2;
             
             // Gentle rotation during breathing
             p.vx += -ny * 0.05;
             p.vy += nx * 0.05;
        }

        updateParticle(p, width, height, theme, mouseRef.current);
        drawParticle(ctx, p, challenge.completed); 
        
        if (p.life <= 0) {
           particlesRef.current[index] = createParticle(width, height, theme.colors);
        }
      });

      // Draw Breathing Guide Circle
      if (breathingMode) {
          const baseSize = Math.min(width, height) * 0.3;
          const currentSize = baseSize + (breathingFactor * 50);
          
          ctx.beginPath();
          ctx.arc(centerW, centerH, currentSize, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 + breathingFactor * 0.1})`;
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.font = "20px sans-serif";
          ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          
          let text = "Hold";
          if (breathingFactor > 0.3) text = "Exhale";
          if (breathingFactor < -0.3) text = "Inhale";
          ctx.fillText(text, centerW, centerH);
      }

      ctx.globalCompositeOperation = 'source-over';
      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('contextmenu', preventContext);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, challenge.completed, breathingMode]); 
  
  // Update theme colors dynamically
  useEffect(() => {
     particlesRef.current.forEach(p => {
        p.color = theme.colors[Math.floor(Math.random() * theme.colors.length)];
     });
  }, [theme]);

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    mouseRef.current.x = clientX;
    mouseRef.current.y = clientY;
    mouseRef.current.active = true;
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => { 
      // Check for right click
      if ('button' in e && (e as React.MouseEvent).button === 2) {
          mouseRef.current.isRightDown = true;
      } else {
          mouseRef.current.isDown = true; 
      }
      handleMouseMove(e);
  };

  const handleMouseUp = () => { 
      mouseRef.current.isDown = false; 
      mouseRef.current.isRightDown = false;
      mouseRef.current.active = false; 
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
      const well: GravityWell = {
          id: Math.random(),
          x: e.clientX,
          y: e.clientY,
          strength: 8,
          life: 900 // 15 seconds at 60fps
      };
      gravityWellsRef.current.push(well);
      
      // Initial poof effect
      shockwavesRef.current.push({
          x: e.clientX, y: e.clientY, radius: 10, maxRadius: 100, alpha: 1, color: '#FFF'
      });
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 touch-none cursor-crosshair"
      onMouseMove={handleMouseMove}
      onTouchMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onTouchStart={(e) => { handleMouseDown(e); }}
      onMouseUp={handleMouseUp}
      onTouchEnd={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDoubleClick={handleDoubleClick}
    />
  );
};

// --- Physics & Render Helpers ---

function createParticle(w: number, h: number, colors: string[]): Particle {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,
    radius: Math.random() * 15 + 5,
    color: colors[Math.floor(Math.random() * colors.length)],
    life: Math.random() * 100 + 100,
    maxLife: 200,
    friction: 0.96
  };
}

function createCollectible(w: number, h: number): Collectible {
    const padding = 50;
    return {
        id: Math.random(),
        x: padding + Math.random() * (w - padding*2),
        y: padding + Math.random() * (h - padding*2),
        radius: 15,
        pulseOffset: Math.random() * Math.PI * 2,
        collected: false
    };
}

function drawCollectible(ctx: CanvasRenderingContext2D, c: Collectible, time: number) {
    const pulse = Math.sin((time / 300) + c.pulseOffset); // Faster pulse
    const size = c.radius + (pulse * 4);
    
    // Outer Glow
    const gradient = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, size * 2.5);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.4, 'rgba(200, 230, 255, 0.4)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(c.x, c.y, size * 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Solid Core
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(c.x, c.y, size * 0.4, 0, Math.PI * 2);
    ctx.fill();
}

function updateParticle(p: Particle, w: number, h: number, theme: Theme, mouse: any) {
  let speedMult = theme.speed || 1;
  
  // Theme behaviors
  if (theme.flowType === 'calm') {
      p.vx += (Math.random() - 0.5) * 0.05;
      p.vy += (Math.random() - 0.5) * 0.05;
  } else if (theme.flowType === 'energetic') {
      p.vx += (Math.random() - 0.5) * 0.2;
      p.vy += (Math.random() - 0.5) * 0.2;
      speedMult *= 1.2;
  } else if (theme.flowType === 'focused') {
      const dx = w/2 - p.x;
      const dy = h/2 - p.y;
      p.vx += dx * 0.0001;
      p.vy += dy * 0.0001;
  }

  // Mouse Interaction (Left Click)
  if (mouse.active && mouse.isDown) {
    const dx = mouse.x - p.x;
    const dy = mouse.y - p.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const forceLimit = 300;

    if (dist < forceLimit) {
      const force = (forceLimit - dist) / forceLimit;
      
      // Gravity (Pull)
      p.vx += dx * 0.08 * force;
      p.vy += dy * 0.08 * force;
    }
  }
  // Normal Hover Repulsion (when not clicking)
  else if (mouse.active && !mouse.isDown && !mouse.isRightDown) {
    const dx = mouse.x - p.x;
    const dy = mouse.y - p.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const forceLimit = 200;

    if (dist < forceLimit) {
      const force = (forceLimit - dist) / forceLimit;
      // Repel (Push)
      p.vx -= dx * 0.03 * force;
      p.vy -= dy * 0.03 * force;
    }
  }

  p.x += p.vx * speedMult;
  p.y += p.vy * speedMult;
  p.vx *= p.friction;
  p.vy *= p.friction;

  // Wrap
  if (p.x < -50) p.x = w + 50;
  if (p.x > w + 50) p.x = -50;
  if (p.y < -50) p.y = h + 50;
  if (p.y > h + 50) p.y = -50;

  p.life--;
}

function drawParticle(ctx: CanvasRenderingContext2D, p: Particle, hasReward: boolean) {
  // Fade out near end of life
  const lifeRatio = p.life / p.maxLife;
  const opacity = lifeRatio > 0.8 ? (1-lifeRatio)*5 : lifeRatio < 0.2 ? lifeRatio*5 : 1;
  
  ctx.beginPath();
  
  // More vibrant gradients
  const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
  if (hasReward) {
      gradient.addColorStop(0, '#FFF5CC'); 
      gradient.addColorStop(0.4, '#FFD700'); 
      gradient.addColorStop(1, 'transparent');
  } else {
      gradient.addColorStop(0, '#FFFFFF'); 
      gradient.addColorStop(0.4, p.color);
      gradient.addColorStop(1, 'transparent');
  }

  ctx.fillStyle = gradient;
  ctx.globalAlpha = Math.max(0, Math.min(1, opacity * 0.7)); // Base opacity
  ctx.arc(p.x, p.y, p.radius * 2, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.globalAlpha = 1.0;
}

export default GameCanvas;