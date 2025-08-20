import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import styles from './PulseBackground.module.scss';

const PulseBackground = forwardRef((props, ref) => {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const deadParticles = useRef([]); // 物件池：存放死亡的粒子以便重用
  const animationFrameId = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // 粒子限制和管理
  const MAX_PARTICLES = 10; // 最大活躍粒子數
  const MAX_DEAD_PARTICLES = 15; // 物件池最大容量

  // 粒子顏色
  const colors = ["#FF0000", "#FFFF00", "#0000FF"];

  // 漫遊粒子類別
  class WanderingParticle {
    // 四個移動方向常數（按順時針順序排列）
    static DIRECTIONS = [
      { dx: 0, dy: -1 },  // 上 (0)
      { dx: -1, dy: 0 },  // 左 (1)
      { dx: 0, dy: 1 },   // 下 (2)
      { dx: 1, dy: 0 }    // 右 (3)
    ];

    constructor(x, y, canvas) {
      this.x = x;
      this.y = y;
      this.canvas = canvas;
      this.size = 3;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      
      // 隨機選擇四個方向之一：上、下、左、右
      const direction = WanderingParticle.DIRECTIONS[Math.floor(Math.random() * 4)];
      const speed = 2; // 統一速度
      this.dx = direction.dx * speed;
      this.dy = direction.dy * speed;
      
      // 轉向計時器
      this.turnTimer = 0;
      this.turnInterval = 2000 + Math.random() * 2000; 
      this.lastTime = performance.now();
      
      // 拖尾軌跡
      this.trail = [];
      this.maxTrailLength = 55; // 拖尾長度
      
    }

    update() {
      const currentTime = performance.now();
      const deltaTime = currentTime - this.lastTime;
      this.lastTime = currentTime;
      
      // 記錄當前位置到拖尾軌跡
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > this.maxTrailLength) {
        this.trail.shift();
      }
      
      // 更新位置
      this.x += this.dx;
      this.y += this.dy;
      
      // 轉向邏輯
      this.turnTimer += deltaTime;
      if (this.turnTimer >= this.turnInterval) {
        this.changeDirection();
        this.turnTimer = 0;
        this.turnInterval = 2000 + Math.random() * 1000; // 重設下次轉向時間
      }
    }

    changeDirection() {
      // 70% 機率轉向
      if (Math.random() < 0.7) {
        const speed = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
        
        // 獲取當前方向
        let currentDir = 0;
        if (this.dx === 0 && this.dy < 0) currentDir = 0; // 上
        else if (this.dx > 0 && this.dy === 0) currentDir = 1; // 左
        else if (this.dx === 0 && this.dy > 0) currentDir = 2; // 下
        else if (this.dx < 0 && this.dy === 0) currentDir = 3; // 右
        
        // 選擇轉向：0=繼續直行, 1=左轉90度, 2=右轉90度
        const turnChoice = Math.floor(Math.random() * 3);
        
        let newDir = currentDir;
        if (turnChoice === 1) {
          // 左轉90度
          newDir = (currentDir + 1) % 4;
        } else if (turnChoice === 2) {
          // 右轉90度
          newDir = (currentDir + 3) % 4;
        }
        
        this.dx = WanderingParticle.DIRECTIONS[newDir].dx * speed;
        this.dy = WanderingParticle.DIRECTIONS[newDir].dy * speed;
      }
    }

    draw(ctx) {
      ctx.save();
      
      // 繪製拖尾軌跡
      if (this.trail.length > 1) {
        for (let i = 0; i < this.trail.length - 1; i++) {
          const point = this.trail[i];
          const nextPoint = this.trail[i + 1];
          
          // 計算透明度和大小（從後到前漸增）
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
      
      // 恢復透明度
      ctx.globalAlpha = 1;
      
      // 繪製主粒子
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      
      // 添加發光效果
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 100;
      ctx.fill();
      
      ctx.restore();
    }

    isDead() {
      // 設定邊界容許範圍
      const margin = 100;
      
      // 檢查是否超出畫布邊界
      if (this.x < -margin || this.x > this.canvas.width + margin || 
          this.y < -margin || this.y > this.canvas.height + margin) {
        return true;
      }
      
      return false;
    }

    // 清理方法，用於物件重用
    cleanup() {
      this.trail.length = 0; // 清空軌跡陣列
      this.turnTimer = 0;
      this.lastTime = performance.now();
    }

    // 重新初始化方法，用於物件池
    reset(x, y, canvas) {
      this.x = x;
      this.y = y;
      this.canvas = canvas;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      
      // 隨機選擇四個方向之一：上、下、左、右
      const direction = WanderingParticle.DIRECTIONS[Math.floor(Math.random() * 4)];
      const speed = 2; // 統一速度
      this.dx = direction.dx * speed;
      this.dy = direction.dy * speed;
      
      this.turnInterval = 2000 + Math.random() * 2000;
      
      this.cleanup();
    }
  }

  // 暴露給父組件的方法
  useImperativeHandle(ref, () => ({
    addParticleAt: (x, y) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // 限制粒子數量，如果超過限制則移除最舊的粒子
      if (particles.current.length >= MAX_PARTICLES) {
        const oldParticle = particles.current.shift();
        if (deadParticles.current.length < MAX_DEAD_PARTICLES) {
          oldParticle.cleanup();
          deadParticles.current.push(oldParticle);
        }
      }
      
      // 在指定位置產生新粒子（使用物件池）
      const particle = createOrReuseParticle(x, y, canvas);
      particles.current.push(particle);
    }
  }));

  // 動畫循環
  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // 清除畫布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 更新和繪製所有粒子，同時移除死亡的粒子
    for (let i = particles.current.length - 1; i >= 0; i--) {
      const particle = particles.current[i];
      particle.update();
      
      if (particle.isDead()) {
        // 將死亡的粒子移到物件池（如果池子未滿）
        if (deadParticles.current.length < MAX_DEAD_PARTICLES) {
          particle.cleanup(); // 清理粒子狀態
          deadParticles.current.push(particle);
        }
        particles.current.splice(i, 1);
      } else {
        particle.draw(ctx);
      }
    }

    animationFrameId.current = requestAnimationFrame(animate);
  };

  // 創建或重用粒子的輔助函數
  const createOrReuseParticle = (x, y, canvas) => {
    if (deadParticles.current.length > 0) {
      // 從物件池重用粒子
      const particle = deadParticles.current.pop();
      particle.reset(x, y, canvas);
      return particle;
    } else {
      // 創建新粒子
      return new WanderingParticle(x, y, canvas);
    }
  };

  // 產生新漫遊粒子
  const generateParticle = () => {
    const canvas = canvasRef.current;
    if (canvas && particles.current.length < MAX_PARTICLES) {
      const particle = createOrReuseParticle(
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

    // 初始化粒子
    for (let i = 0; i < 3; i++) {
      const particle = createOrReuseParticle(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        canvas
      );
      particles.current.push(particle);
    }

    // 開始動畫
    animate();

    // 定期產生新粒子（每3秒）
    const particleInterval = setInterval(generateParticle, 3000);

    // 清理函數（cleanup function）
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      clearInterval(particleInterval);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      
      // 清理所有粒子和物件池，釋放記憶體
      particles.current.forEach(particle => particle.cleanup());
      deadParticles.current.forEach(particle => particle.cleanup());
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