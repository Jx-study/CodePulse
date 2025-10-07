import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import styles from './PulseBackground.module.scss';

const PulseBackground = forwardRef((props, ref) => {
  const canvasRef = useRef(null);
  // Wandering particles
  const particles = useRef([]);
  const deadParticles = useRef([]); // Object pool for wandering particles
  
  const animationFrameId = useRef(null);
  const particleIntervalId = useRef(null);
  const isAttractingMode = useRef(false);

  // Particle limits
  const MAX_WANDERING_PARTICLES = 15;
  const MAX_DEAD_PARTICLES = 15;

  // Particle colors
  const colors = ["#FF0000", "#FFFF00", "#0000FF"];

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
  };

  // --- WanderingParticle Class ---
  class WanderingParticle {
    static DIRECTIONS = [
      { dx: 0, dy: -1 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 1, dy: 0 }
    ];

    constructor(x, y, canvas) {
      this.x = x;
      this.y = y;
      this.canvas = canvas;
      this.size = 3;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      
      this.currentDirection = Math.floor(Math.random() * 4);
      const direction = WanderingParticle.DIRECTIONS[this.currentDirection];
      this.normalSpeed = 2;
      this.attractSpeed = 4;
      this.dx = direction.dx * this.normalSpeed;
      this.dy = direction.dy * this.normalSpeed;
      
      this.turnTimer = 0;
      this.turnInterval = 2000 + Math.random() * 2000; 
      this.lastTime = performance.now();
      
      this.trail = [];
      this.maxTrailLength = 55;
      
      this.isAttracted = false;
      this.targetX = 0;
      this.targetY = 0;
    }

    update() {
      const currentTime = performance.now();
      const deltaTime = currentTime - this.lastTime;
      this.lastTime = currentTime;
      
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > this.maxTrailLength) {
        this.trail.shift();
      }
      
      if (this.isAttracted) {
        this.updateWithAttraction();
      } else {
        this.updateNormal(deltaTime);
      }
    }

    updateNormal(deltaTime) {
      this.x += this.dx;
      this.y += this.dy;
      
      this.turnTimer += deltaTime;
      if (this.turnTimer >= this.turnInterval) {
        this.changeDirection();
        this.turnTimer = 0;
        this.turnInterval = 2000 + Math.random() * 1000;
      }
    }

    updateWithAttraction() {
      // 貪婪算法：選擇使距離目標最近的方向
      const distanceX = this.targetX - this.x;
      const distanceY = this.targetY - this.y;
      
      // 檢查是否已經接近目標 - 使用較小的距離以確保能進入銷毀狀態
      if (Math.abs(distanceX) < 10 && Math.abs(distanceY) < 10) {
        return; // 停止移動，已經足夠接近目標
      }
      
      // 選擇移動方向（上下左右）
      let bestDirection = 0;
      let minDistance = Infinity;
      
      // 檢查四個可能的方向
      WanderingParticle.DIRECTIONS.forEach((dir, index) => {
        const newX = this.x + dir.dx * this.attractSpeed;
        const newY = this.y + dir.dy * this.attractSpeed;
        const distance = Math.abs(this.targetX - newX) + Math.abs(this.targetY - newY);
        
        if (distance < minDistance) {
          minDistance = distance;
          bestDirection = index;
        }
      });
      
      // 設置新的方向和速度
      this.currentDirection = bestDirection;
      const direction = WanderingParticle.DIRECTIONS[bestDirection];
      this.dx = direction.dx * this.attractSpeed;
      this.dy = direction.dy * this.attractSpeed;
      
      // 移動
      this.x += this.dx;
      this.y += this.dy;
    }


    changeDirection() {
      if (Math.random() < 0.7) {
        const speed = this.normalSpeed;
        const turnChoice = Math.floor(Math.random() * 3);
        
        let newDirection = this.currentDirection;
        if (turnChoice === 1) {
          newDirection = (this.currentDirection + 1) % 4;
        } else if (turnChoice === 2) {
          newDirection = (this.currentDirection + 3) % 4;
        }
        
        this.currentDirection = newDirection;
        this.dx = WanderingParticle.DIRECTIONS[newDirection].dx * speed;
        this.dy = WanderingParticle.DIRECTIONS[newDirection].dy * speed;
      }
    }

    draw(ctx) {
      ctx.save();
      
      if (this.trail.length > 1) {
        for (let i = 0; i < this.trail.length - 1; i++) {
          const point = this.trail[i];
          const nextPoint = this.trail[i + 1];
          
          const alpha = (i / this.trail.length) * 0.2 + 0.05;
          const size = (i / this.trail.length) * this.size;
          
          if (alpha > 0.05) {
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = this.color;
            ctx.lineWidth = Math.max(size, 0.5);
            ctx.lineCap = 'round';
            
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(nextPoint.x, nextPoint.y);
            ctx.stroke();
          }
        }
      }
      
      ctx.globalAlpha = 1;
      
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 100;
      ctx.fill();
      
      ctx.restore();
    }

    isDead() {
      const margin = 100;
      
      // 檢查邊界條件
      const outOfBounds = (this.x < -margin || this.x > this.canvas.width + margin || 
                          this.y < -margin || this.y > this.canvas.height + margin);
      
      // 檢查是否到達目標點（CTA）
      const reachedTarget = this.isAttracted && 
                           Math.abs(this.targetX - this.x) < 20 && 
                           Math.abs(this.targetY - this.y) < 20;
      
      return outOfBounds || reachedTarget;
    }

    cleanup() {
      this.trail.length = 0;
      this.turnTimer = 0;
      this.lastTime = performance.now();
    }

    setAttractTarget(targetX, targetY) {
      this.isAttracted = true;
      this.targetX = targetX;
      this.targetY = targetY;
    }

    resetAttract() {
      this.isAttracted = false;
      // 恢復正常移動
      const direction = WanderingParticle.DIRECTIONS[this.currentDirection];
      this.dx = direction.dx * this.normalSpeed;
      this.dy = direction.dy * this.normalSpeed;
    }

    reset(x, y, canvas) {
      this.x = x;
      this.y = y;
      this.canvas = canvas;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      
      this.currentDirection = Math.floor(Math.random() * 4);
      const direction = WanderingParticle.DIRECTIONS[this.currentDirection];
      this.dx = direction.dx * this.normalSpeed;
      this.dy = direction.dy * this.normalSpeed;
      
      this.turnInterval = 2000 + Math.random() * 2000;
      
      this.isAttracted = false;
      this.targetX = 0;
      this.targetY = 0;
      
      this.cleanup();
    }
  }

  useImperativeHandle(ref, () => ({
    addWanderingParticle: (x, y) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      if (particles.current.length >= MAX_WANDERING_PARTICLES) {
        const oldParticle = particles.current.shift();
        if (deadParticles.current.length < MAX_DEAD_PARTICLES) {
          oldParticle.cleanup();
          deadParticles.current.push(oldParticle);
        }
      }

      const particle = createOrReuseWanderingParticle(x, y, canvas);
      particles.current.push(particle);
    },
    attractParticles: (targetX, targetY) => {
      // 設置吸引模式，停止生成新粒子
      isAttractingMode.current = true;
      if (particleIntervalId.current) {
        clearInterval(particleIntervalId.current);
        particleIntervalId.current = null;
      }
      
      particles.current.forEach((particle) => {
        particle.setAttractTarget(targetX, targetY);
      });
    },
    resetParticles: () => {
      // 退出吸引模式，恢復粒子生成
      isAttractingMode.current = false;
      if (!particleIntervalId.current) {
        particleIntervalId.current = setInterval(generateWanderingParticle, 3000);
      }
      
      particles.current.forEach((particle) => {
        particle.resetAttract();
      });
    }
  }));

  // --- Animation Loop ---
  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw WanderingParticles
    for (let i = particles.current.length - 1; i >= 0; i--) {
      const particle = particles.current[i];
      particle.update();
      
      if (particle.isDead()) {
        if (deadParticles.current.length < MAX_DEAD_PARTICLES) {
          particle.cleanup();
          deadParticles.current.push(particle);
        }
        particles.current.splice(i, 1);
      } else {
        particle.draw(ctx);
      }
    }

    animationFrameId.current = requestAnimationFrame(animate);
  };

  // Helper for WanderingParticles
  const createOrReuseWanderingParticle = (x, y, canvas) => {
    if (deadParticles.current.length > 0) {
      const particle = deadParticles.current.pop();
      particle.reset(x, y, canvas);
      return particle;
    } else {
      return new WanderingParticle(x, y, canvas);
    }
  };

  // Helper to generate new WanderingParticles periodically
  const generateWanderingParticle = () => {
    const canvas = canvasRef.current;
    // 只有在非吸引模式下才生成新粒子
    if (canvas && !isAttractingMode.current && particles.current.length < MAX_WANDERING_PARTICLES) {
      const particle = createOrReuseWanderingParticle(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        canvas
      );
      particles.current.push(particle);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize WanderingParticles
    for (let i = 0; i < 3; i++) {
      const particle = createOrReuseWanderingParticle(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        canvas
      );
      particles.current.push(particle);
    }

    animate();

    // 開始粒子生成定時器
    particleIntervalId.current = setInterval(generateWanderingParticle, 3000);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (particleIntervalId.current) {
        clearInterval(particleIntervalId.current);
      }
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      
      particles.current.forEach(p => p.cleanup && p.cleanup());
      deadParticles.current.forEach(p => p.cleanup && p.cleanup());
      particles.current.length = 0;
      deadParticles.current.length = 0;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={styles.pulseCanvas}
    />
  );
});

export default PulseBackground;