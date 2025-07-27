import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
// import { store } from './features/store'; // To be implemented

function App() {
  return (
    // <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            {/* Add more routes as you build the app */}
          </Routes>
        </div>
      </Router>
    // </Provider>
  );
}

// Temporary placeholder components
const HomePage = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Social Media App
      </h1>
      <p className="text-gray-600 mb-8">
        Welcome to your graduation project! Start building your social media platform.
      </p>
      <div className="space-x-4">
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Get Started
        </button>
        <button className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300">
          Learn More
        </button>
      </div>
    </div>
  </div>
);

const LoginPage = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="bg-white p-8 rounded-lg shadow-md w-96">
      <h2 className="text-2xl font-bold mb-6">Login</h2>
      <p className="text-gray-600">Login form to be implemented</p>
    </div>
  </div>
);

const RegisterPage = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="bg-white p-8 rounded-lg shadow-md w-96">
      <h2 className="text-2xl font-bold mb-6">Register</h2>
      <p className="text-gray-600">Registration form to be implemented</p>
    </div>
  </div>
);

export default App;