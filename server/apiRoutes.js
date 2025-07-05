const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

// Определение схемы для позиции шарика
const BallPositionSchema = new mongoose.Schema({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

// Определение схемы для лучших результатов игрока
const PlayerScoreSchema = new mongoose.Schema({
  playerId: { type: String, required: true },
  score: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

// Модели для работы с данными
const BallPosition = mongoose.model('BallPosition', BallPositionSchema);
const PlayerScore = mongoose.model('PlayerScore', PlayerScoreSchema);

// GET /api/hello
router.get('/hello', (req, res) => {
  res.json({ message: 'Hello from API!' });
});

// GET /api/status
router.get('/status', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// POST /api/ball-position - Сохранение текущей позиции шарика
router.post('/ball-position', async (req, res) => {
  try {
    const { x, y } = req.body;
    if (x === undefined || y === undefined) {
      return res.status(400).json({ error: 'Missing x or y coordinates' });
    }

    const newPosition = new BallPosition({ x, y });
    await newPosition.save();
    res.status(201).json({ message: 'Ball position saved', data: newPosition });
  } catch (error) {
    console.error('Error saving ball position:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/ball-position - Получение последней позиции шарика
router.get('/ball-position', async (req, res) => {
  try {
    const latestPosition = await BallPosition.findOne().sort({ timestamp: -1 });
    if (!latestPosition) {
      return res.status(404).json({ error: 'No ball position found' });
    }
    res.json({ data: latestPosition });
  } catch (error) {
    console.error('Error fetching ball position:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/player-score - Сохранение результата игрока
router.post('/player-score', async (req, res) => {
  try {
    const { playerId, score } = req.body;
    if (!playerId || score === undefined) {
      return res.status(400).json({ error: 'Missing playerId or score' });
    }

    const newScore = new PlayerScore({ playerId, score });
    await newScore.save();
    res.status(201).json({ message: 'Player score saved', data: newScore });
  } catch (error) {
    console.error('Error saving player score:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/player-score - Получение лучших результатов игрока
router.get('/player-score', async (req, res) => {
  try {
    const { playerId } = req.query;
    if (!playerId) {
      return res.status(400).json({ error: 'Missing playerId' });
    }

    const scores = await PlayerScore.find({ playerId }).sort({ score: -1 }).limit(10);
    res.json({ data: scores });
  } catch (error) {
    console.error('Error fetching player scores:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/top-scores - Получение топ-10 лучших результатов всех игроков
router.get('/top-scores', async (req, res) => {
  try {
    const topScores = await PlayerScore.aggregate([
      { $group: { _id: '$playerId', maxScore: { $max: '$score' } } },
      { $sort: { maxScore: -1 } },
      { $limit: 10 }
    ]);
    res.json({ data: topScores });
  } catch (error) {
    console.error('Error fetching top scores:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
