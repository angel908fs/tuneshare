import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Cookies from 'js-cookie'; 

import HomePage from './pages/home/HomePage';
import LoginPage from './pages/auth/Login/LoginPage';
import SignUpPage from './pages/auth/signup/SignUpPage';
import NotificationPage from './pages/notfications/NotificationPage';
import ProfilePage from './pages/Profile/ProfilePage';

import LeftPanel from './components/common/Sidebar';
import RightPanel from './components/common/Rightbar';
import { Toaster } from 'react-hot-toast'; 
import { QueryClient, QueryClientProvider } from 'react-query'; 

const queryClient = new QueryClient();

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const hideSidebars = ['/login', '/signup'].includes(location.pathname);

  useEffect(() => {
    const cookieValue = Cookies.get("tuneshare_cookie");
    if (!cookieValue && !['/login', '/signup'].includes(location.pathname)) {
      navigate('/login');
    }
  }, [navigate, location.pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className='flex max-w-6xl mx-auto'>
        {!hideSidebars && <LeftPanel />}
        <Routes> {/* different pages */}
          <Route path='/login' element={<LoginPage />} />
          <Route path='/signup' element={<SignUpPage />} />
          <Route path='/' element={<HomePage />} />
          <Route path='/notifications' element={<NotificationPage />} />
          <Route path='/profile/:userId' element={<ProfilePage />} />
        </Routes>
        {!hideSidebars && <RightPanel />}
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;
