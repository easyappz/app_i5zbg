import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import './GameBall.css';

const GAME_WIDTH = 800;
const GAME_HEIGHT = 500;
const BALL_SIZE = 30;
const GRAVITY = 0.5;
const JUMP_FORCE = -10;
const MOVE_SPEED = 5;

const GameBall = () => {
  const [ballPosition, setBallPosition] = useState({ x: 50, y: GAME_HEIGHT - BALL_SIZE });
  const [ballVelocity, setBallVelocity] = useState({ x: 0, y: 0 });
  const [isJumping, setIsJumping] = useState(false);
  const [keysPressed, setKeysPressed] = useState({});

  const handleKeyDown = useCallback((event) => {
    setKeysPressed((prev) => ({ ...prev, [event.key]: true }));
    if (event.key === 'ArrowUp' && !isJumping) {
      setBallVelocity((prev) => ({ ...prev, y: JUMP_FORCE }));
      setIsJumping(true);
    }
  }, [isJumping]);

  const handleKeyUp = useCallback((event) => {
    setKeysPressed((prev) => ({ ...prev, [event.key]: false }));
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  useEffect(() => {
    const gameLoop = setInterval(() => {
      setBallPosition((prevPosition) => {
        let newX = prevPosition.x;
        let newY = prevPosition.y;

        // Update velocity with gravity
        setBallVelocity((prevVelocity) => {
          const newVelocityY = prevVelocity.y + GRAVITY;
          return { ...prevVelocity, y: newVelocityY };
        });

        // Update position based on velocity
        newY += ballVelocity.y;

        // Handle horizontal movement based on key presses
        if (keysPressed['ArrowLeft']) {
          newX -= MOVE_SPEED;
        }
        if (keysPressed['ArrowRight']) {
          newX += MOVE_SPEED;
        }

        // Boundary checks
        if (newX < 0) newX = 0;
        if (newX > GAME_WIDTH - BALL_SIZE) newX = GAME_WIDTH - BALL_SIZE;
        if (newY < 0) {
          newY = 0;
          setBallVelocity((prev) => ({ ...prev, y: 0 }));
        }
        if (newY > GAME_HEIGHT - BALL_SIZE) {
          newY = GAME_HEIGHT - BALL_SIZE;
          setBallVelocity((prev) => ({ ...prev, y: 0 }));
          setIsJumping(false);
        }

        return { x: newX, y: newY };
      });
    }, 1000 / 60); // 60 FPS

    return () => clearInterval(gameLoop);
  }, [ballVelocity, keysPressed]);

  return (
    <Box
      sx={{
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
        background: 'linear-gradient(135deg, #e0f7fa, #ffe0b2)',
        border: '2px solid #1976d2',
        borderRadius: 2,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        margin: '0 auto',
      }}
    >
      <Typography
        variant="h6"
        sx={{
          position: 'absolute',
          top: 10,
          left: 10,
          color: '#1976d2',
          fontWeight: 'bold',
        }}
      >
        Ball Game
      </Typography>
      <Box
        className="ball"
        sx={{
          width: BALL_SIZE,
          height: BALL_SIZE,
          backgroundColor: '#d32f2f',
          borderRadius: '50%',
          position: 'absolute',
          left: ballPosition.x,
          top: ballPosition.y,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
          transition: 'left 0.016s linear, top 0.016s linear', // Smooth animation at 60 FPS
        }}
      />
    </Box>
  );
};

export default GameBall;
