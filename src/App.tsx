import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import CityPage from './pages/CityPage';
import CategoryPage from './pages/CategoryPage';
import SearchPage from './pages/SearchPage';
import Footer from './components/Footer';
import PostAdModal from './components/PostAdModal';
import SignInModal from './components/SignInModal';

function App() {
  const [isPostAdModalOpen, setIsPostAdModalOpen] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // This would be managed by your auth system

  const handlePostAd = () => {
    if (isLoggedIn) {
      setIsPostAdModalOpen(true);
    } else {
      setIsSignInModalOpen(true);
    }
  };

  const handleSignInSuccess = () => {
    setIsLoggedIn(true);
    setIsSignInModalOpen(false);
    setIsPostAdModalOpen(true);
  };
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <Header 
        onPostAd={handlePostAd}
        onSignIn={() => setIsSignInModalOpen(true)}
        isLoggedIn={isLoggedIn}
        onSignOut={() => setIsLoggedIn(false)}
      />
      
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/city/:cityName" element={<CityPage />} />
        <Route path="/category/:categoryName" element={<CategoryPage />} />
        <Route path="/search" element={<SearchPage />} />
      </Routes>
      
      <Footer />
      
      {/* Post Ad Modal */}
      <PostAdModal 
        isOpen={isPostAdModalOpen} 
        onClose={() => setIsPostAdModalOpen(false)} 
        isLoggedIn={isLoggedIn}
      />
      
      {/* Sign In Modal */}
      <SignInModal 
        isOpen={isSignInModalOpen} 
        onClose={() => setIsSignInModalOpen(false)}
        onSignInSuccess={handleSignInSuccess}
      />
    </div>
  );
}

export default App;