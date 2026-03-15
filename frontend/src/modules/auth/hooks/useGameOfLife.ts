import { useRef, useState, useEffect, useCallback } from 'react';

const CELL_SIZE = 8;
const TICK_RATE = 300;

const COLORS = {
  dark: {
    background: '#0d0f1a',
    liveCell: '#2563EB',
  },
  light: {
    background: '#1a1f35',
    liveCell: '#2563EB',
  },
};

interface UseGameOfLifeReturn {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isPlaying: boolean;
  randomize: () => void;
  clear: () => void;
  togglePlay: () => void;
  handleMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleMouseUp: () => void;
}

function useGameOfLife(theme: 'light' | 'dark'): UseGameOfLifeReturn {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  const grid = useRef<boolean[][]>([]);
  const isDragging = useRef<boolean>(false);
  const drawMode = useRef<boolean>(true);
  const intervalId = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPlayingRef = useRef<boolean>(true);
  const themeRef = useRef<'light' | 'dark'>(theme);

  // Keep themeRef in sync with theme prop
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  // Keep isPlayingRef in sync with isPlaying state
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const initGrid = useCallback((rows: number, cols: number) => {
    grid.current = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => false)
    );
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Re-initialize grid if canvas size changed or grid is empty
    const expectedRows = Math.floor(canvas.height / CELL_SIZE);
    const expectedCols = Math.floor(canvas.width / CELL_SIZE);
    if (
      expectedRows > 0 &&
      expectedCols > 0 &&
      (grid.current.length !== expectedRows ||
        (grid.current[0]?.length ?? 0) !== expectedCols)
    ) {
      grid.current = Array.from({ length: expectedRows }, () =>
        Array.from({ length: expectedCols }, () => false)
      );
    }

    const colors = COLORS[themeRef.current];
    const rows = grid.current.length;
    const cols = rows > 0 ? grid.current[0].length : 0;

    // Fill background
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw live cells with glow
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#2563EB';
    ctx.fillStyle = colors.liveCell;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid.current[r][c]) {
          ctx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      }
    }

    // Reset shadow to avoid affecting other rendering
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
  }, []);

  const computeNextGeneration = useCallback(() => {
    const rows = grid.current.length;
    if (rows === 0) return;
    const cols = grid.current[0].length;

    const next = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => false)
    );

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let neighbors = 0;

        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = (r + dr + rows) % rows;
            const nc = (c + dc + cols) % cols;
            if (grid.current[nr][nc]) neighbors++;
          }
        }

        const alive = grid.current[r][c];
        if (alive) {
          next[r][c] = neighbors === 2 || neighbors === 3;
        } else {
          next[r][c] = neighbors === 3;
        }
      }
    }

    grid.current = next;
  }, []);

  const tick = useCallback(() => {
    if (!isPlayingRef.current) return;
    computeNextGeneration();
    draw();
  }, [computeNextGeneration, draw]);

  // Initialize grid on canvas mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rows = Math.floor(canvas.height / CELL_SIZE);
    const cols = Math.floor(canvas.width / CELL_SIZE);
    initGrid(rows, cols);
    draw();
  }, [initGrid, draw]);

  // Set up/tear down interval when isPlaying changes
  useEffect(() => {
    if (intervalId.current !== null) {
      clearInterval(intervalId.current);
      intervalId.current = null;
    }

    if (isPlaying) {
      intervalId.current = setInterval(tick, TICK_RATE);
    }

    return () => {
      if (intervalId.current !== null) {
        clearInterval(intervalId.current);
        intervalId.current = null;
      }
    };
  }, [isPlaying, tick]);

  const randomize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (grid.current.length === 0) {
      const rows = Math.floor(canvas.height / CELL_SIZE);
      const cols = Math.floor(canvas.width / CELL_SIZE);
      if (rows === 0 || cols === 0) return;
      grid.current = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => false)
      );
    }
    const rows = grid.current.length;
    const cols = grid.current[0].length;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        grid.current[r][c] = Math.random() < 0.6;
      }
    }
    draw();
  }, [draw]);

  const clear = useCallback(() => {
    const rows = grid.current.length;
    if (rows === 0) return;
    const cols = grid.current[0].length;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        grid.current[r][c] = false;
      }
    }
    draw();
  }, [draw]);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const getCellCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { row: 0, col: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const col = Math.floor((e.clientX - rect.left) * scaleX / CELL_SIZE);
    const row = Math.floor((e.clientY - rect.top) * scaleY / CELL_SIZE);
    return { row, col };
  };

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      isDragging.current = true;
      const { row, col } = getCellCoords(e);
      const rows = grid.current.length;
      if (rows === 0) return;
      const cols = grid.current[0].length;
      if (row < 0 || row >= rows || col < 0 || col >= cols) return;

      const newState = !grid.current[row][col];
      grid.current[row][col] = newState;
      drawMode.current = newState;
      draw();
    },
    [draw]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDragging.current) return;
      const { row, col } = getCellCoords(e);
      const rows = grid.current.length;
      if (rows === 0) return;
      const cols = grid.current[0].length;
      if (row < 0 || row >= rows || col < 0 || col >= cols) return;

      grid.current[row][col] = drawMode.current;
      draw();
    },
    [draw]
  );

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  return {
    canvasRef,
    isPlaying,
    randomize,
    clear,
    togglePlay,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}

export default useGameOfLife;
