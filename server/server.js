const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const apiRoutes = require('./apiRoutes');

// Для работы с express
const app = express();

// Middleware для обработки JSON-данных
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Подключение маршрутов API
app.use('/api', apiRoutes);

/**
 * Подключение к базе данных MongoDB
 */
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/defaultdb';

// Используем mongoose.connect вместо createConnection для единого подключения
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected successfully');
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1); // Завершаем процесс при ошибке подключения
});

// Экспортируем подключение для использования в других модулях
const db = mongoose.connection;

// Глобальная переменная для доступа к базе данных из других модулей
global.mongoDb = db;

// Порт для запуска сервера
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
