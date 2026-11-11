import { useCallback, useEffect, useRef } from 'react';
import { PlayerInputSnapshot } from '../services/player-service';

export interface GameInputController {
  consumeSnapshot: (
    cameraX: number,
    cameraY: number,
    viewportWidth: number,
    viewportHeight: number
  ) => PlayerInputSnapshot;
  bindMouseHandlers: {
    onMouseMove: (event: React.MouseEvent<HTMLCanvasElement>) => void;
    onMouseDown: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  };
}

function readMovementAxes(keys: Set<string>): { moveX: number; moveY: number } {
  let moveX = 0;
  let moveY = 0;
  if (keys.has('KeyA') || keys.has('ArrowLeft')) moveX -= 1;
  if (keys.has('KeyD') || keys.has('ArrowRight')) moveX += 1;
  if (keys.has('KeyW') || keys.has('ArrowUp')) moveY -= 1;
  if (keys.has('KeyS') || keys.has('ArrowDown')) moveY += 1;
  return { moveX, moveY };
}

function useKeyboardListeners(
  keysRef: React.RefObject<Set<string>>,
  dashQueuedRef: React.RefObject<boolean>,
  ultimateQueuedRef: React.RefObject<boolean>,
  onTogglePause: () => void,
  onToggleAutoAim: () => void
): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      const code = event.code;
      keysRef.current.add(code);
      if (code === 'Space' || code === 'ShiftLeft' || code === 'ShiftRight') {
        dashQueuedRef.current = true;
      } else if (code === 'KeyE') {
        ultimateQueuedRef.current = true;
      } else if (code === 'KeyQ') {
        onToggleAutoAim();
      } else if (code === 'Escape' || code === 'KeyP') {
        onTogglePause();
      }
    };
    const handleKeyUp = (event: KeyboardEvent): void => {
      keysRef.current.delete(event.code);
    };
    const handleBlur = (): void => {
      keysRef.current.clear();
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [dashQueuedRef, keysRef, onToggleAutoAim, onTogglePause, ultimateQueuedRef]);
}

export function useGameInput(
  onTogglePause: () => void,
  onToggleAutoAim: () => void
): GameInputController {
  const keysRef = useRef<Set<string>>(new Set());
  const mouseScreenRef = useRef<{ x: number; y: number }>({ x: 640, y: 360 });
  const dashQueuedRef = useRef<boolean>(false);
  const ultimateQueuedRef = useRef<boolean>(false);

  useKeyboardListeners(keysRef, dashQueuedRef, ultimateQueuedRef, onTogglePause, onToggleAutoAim);

  const onMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>): void => {
    const rect = event.currentTarget.getBoundingClientRect();
    mouseScreenRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }, []);

  const onMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>): void => {
    if (event.button === 2) ultimateQueuedRef.current = true;
  }, []);

  const consumeSnapshot = useCallback(
    (camX: number, camY: number, viewW: number, viewH: number): PlayerInputSnapshot => {
      const { moveX, moveY } = readMovementAxes(keysRef.current);
      const dashPressed = dashQueuedRef.current;
      const ultimatePressed = ultimateQueuedRef.current;
      dashQueuedRef.current = false;
      ultimateQueuedRef.current = false;
      return {
        moveX,
        moveY,
        mouseWorldX: mouseScreenRef.current.x - viewW / 2 + camX,
        mouseWorldY: mouseScreenRef.current.y - viewH / 2 + camY,
        dashPressed,
        ultimatePressed,
      };
    },
    []
  );

  return { consumeSnapshot, bindMouseHandlers: { onMouseMove, onMouseDown } };
}
