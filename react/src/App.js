import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import GameBall from './components/GameBall';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={
            <div className="App">
              <header className="App-header">
                <h1>Welcome to the React App</h1>
                <p>
                  React template successfully deployed. <br />
                  Navigate to <a href="/game">Game</a> to play Ball Game.
                </p>
              </header>
            </div>
          } />
          <Route path="/game" element={
            <div className="App">
              <header className="App-header">
                <h1>Ball Game</h1>
                <GameBall />
              </header>
            </div>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
