import logo from './logo.svg';
import ErrorBoundary from './ErrorBoundary';
import GameBall from './components/GameBall';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Шаблон React успешно развернут, <br />
            Ждите обновлений от AI :)
          </p>
          <GameBall />
        </header>
      </div>
    </ErrorBoundary>
  );
}

export default App;
