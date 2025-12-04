'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

const gridHeight = 8;
const gridWidth = 6;
const colors = ['🔴', '🟢', '🔵', '🟡', '🟣'];

export default function Game() {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [grid, setGrid] = useState<(string | null)[][]>(
    Array.from({ length: gridHeight }, () => Array(gridWidth).fill(null))
  );
  const [nextBubble, setNextBubble] = useState<string | null>(null);

  const randomColor = () => colors[Math.floor(Math.random() * colors.length)];

  const initGame = () => {
    setScore(0);
    setGameOver(false);
    const newGrid = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(null));
    // fill row 0 and 1
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < gridWidth; c++) {
        let color;
        do {
          color = randomColor();
        } while (hasMatch(newGrid, r, c, color));
        newGrid[r][c] = color;
      }
    }
    setGrid(newGrid);
    generateNextBubble();
  };

  const hasMatch = (g: (string | null)[][], r: number, c: number, color: string) => {
    // horizontal
    let count = 1;
    let i = c - 1;
    while (i >= 0 && g[r][i] === color) {
      count++;
      i--;
    }
    i = c + 1;
    while (i < gridWidth && g[r][i] === color) {
      count++;
      i++;
    }
    if (count >= 3) return true;
    // vertical
    count = 1;
    i = r - 1;
    while (i >= 0 && g[i][c] === color) {
      count++;
      i--;
    }
    i = r + 1;
    while (i < gridHeight && g[i][c] === color) {
      count++;
      i++;
    }
    return count >= 3;
  };

  const generateNextBubble = () => {
    setNextBubble(randomColor());
  };

  const launchBubble = (colIndex: number) => {
    if (gameOver) return;
    let R = gridHeight;
    for (let r = gridHeight - 1; r >= 0; r--) {
      if (grid[r][colIndex] !== null) {
        R = r;
        break;
      }
    }
    const R_target = R - 1;
    if (R_target < 0) {
      setGameOver(true);
      return;
    }
    const newGrid = grid.map(row => [...row]);
    newGrid[R_target][colIndex] = nextBubble;
    const matched = checkForMatches(R_target, colIndex, newGrid);
    if (matched.length >= 3) {
      setScore(prev => prev + 10);
      matched.forEach(([r, c]) => {
        newGrid[r][c] = null;
      });
    }
    setGrid(newGrid);
    generateNextBubble();
  };

  const checkForMatches = (row: number, col: number, g: (string | null)[][]): [number, number][] => {
    const targetColor = g[row][col];
    if (!targetColor) return [];
    const visited = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(false));
    const stack: [number, number][] = [[row, col]];
    const matched: [number, number][] = [];
    while (stack.length) {
      const [r, c] = stack.pop()!;
      if (visited[r][c]) continue;
      visited[r][c] = true;
      if (g[r][c] !== targetColor) continue;
      matched.push([r, c]);
      const dirs = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ];
      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < gridHeight && nc >= 0 && nc < gridWidth && !visited[nr][nc]) {
          stack.push([nr, nc]);
        }
      }
    }
    return matched;
  };

  useEffect(() => {
    initGame();
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-xl">Score: {score}</div>
      <div className="text-lg">Next Bubble: {nextBubble}</div>
      <div className="grid grid-cols-6 gap-1">
        {grid.map((row, rIdx) =>
          row.map((cell, cIdx) => (
            <div key={`${rIdx}-${cIdx}`} className="w-8 h-8 flex items-center justify-center border">
              {cell ?? '⬜'}
            </div>
          ))
        )}
      </div>
      <div className="flex gap-2">
        {[...Array(gridWidth)].map((_, idx) => (
          <Button key={idx} onClick={() => launchBubble(idx)}>
            {idx + 1}
          </Button>
        ))}
      </div>
      {gameOver && <div className="text-2xl font-bold">GAME OVER — Final Score: {score}</div>}
    </div>
  );
}
