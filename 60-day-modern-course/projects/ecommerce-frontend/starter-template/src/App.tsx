import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>E-Commerce Store</h1>
        </header>
        
        <main>
          <Routes>
            <Route path="/" element={<div>Home Page - TODO</div>} />
            <Route path="/products" element={<div>Products Page - TODO</div>} />
            <Route path="/cart" element={<div>Cart Page - TODO</div>} />
            {/* TODO: 添加更多路由 */}
          </Routes>
        </main>
        
        <footer className="App-footer">
          <p>&copy; 2024 E-Commerce Store</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;