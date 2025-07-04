import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
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
  const [score, setScore] = useState(0);
  const [playerId, setPlayerId] = useState('');
  const [topScores, setTopScores] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Generate a simple player ID if none exists
  useEffect(() => {
    const storedId = localStorage.getItem('playerId');
    if (!storedId) {
      const newId = 'player_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('playerId', newId);
      setPlayerId(newId);
    } else {
      setPlayerId(storedId);
    }
  }, []);

  // Fetch top scores on component mount
  useEffect(() => {
    const fetchTopScores = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/top-scores');
        const data = await response.json();
        if (response.ok) {
          setTopScores(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching top scores:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopScores();
  }, []);

  // Send ball position to backend periodically
  useEffect(() => {
    const positionInterval = setInterval(async () => {
      try {
        await fetch('/api/ball-position', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(ballPosition),
        });
      } catch (error) {
        console.error('Error sending ball position:', error);
      }
    }, 5000); // Send every 5 seconds

    return () => clearInterval(positionInterval);
  }, [ballPosition]);

  // Save score when game ends or on certain conditions
  const saveScore = useCallback(async () => {
    if (!playerId || score === 0) return;

    try {
      const response = await fetch('/api/player-score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerId, score }),
      });

      if (response.ok) {
        // Refresh top scores after saving
        const topScoresResponse = await fetch('/api/top-scores');
        const topScoresData = await topScoresResponse.json();
        if (topScoresResponse.ok) {
          setTopScores(topScoresData.data || []);
        }
      }
    } catch (error) {
      console.error('Error saving score:', error);
    }
  }, [playerId, score]);

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

        // Update score based on movement (simple scoring system)
        if (newX > prevPosition.x) {
          setScore((prev) => prev + 1);
        }

        return { x: newX, y: newY };
      });
    }, 1000 / 60); // 60 FPS

    return () => clearInterval(gameLoop);
  }, [ballVelocity, keysPressed]);

  // Save score when component unmounts (game ends)
  useEffect(() => {
    return () => {
      saveScore();
    };
  }, [saveScore]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: 3 }}>
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
        <Typography
          variant="h6"
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            color: '#1976d2',
            fontWeight: 'bold',
          }}
        >
          Score: {score}
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

      <Box sx={{ width: GAME_WIDTH }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
          Leaderboard
        </Typography>
        <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Rank</TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Player ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Score</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">Loading...</TableCell>
                </TableRow>
              ) : topScores.length > 0 ? (
                topScores.map((entry, index) => (
                  <TableRow key={entry._id} hover>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{entry._id}</TableCell>
                    <TableCell>{entry.maxScore}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center">No scores available</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default GameBall;
