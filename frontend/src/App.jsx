import { Route, Routes, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { sha512 } from 'js-sha512';

import HomePage from './pages/home/HomePage';
import LoginPage from './pages/auth/Login/LoginPage';
import SignUpPage from './pages/auth/signup/SignUpPage';
import NotificationPage from './pages/notfications/NotificationPage';
import ProfilePage from './pages/Profile/ProfilePage';
import AdminPage from './pages/admin/AdminPage';
import LogsDashboard from './pages/admin/LogsDashboard';
import UsersDashboard from './pages/admin/UsersDashboard';
import PostsDashboard from './pages/admin/PostsDashboard';

import LeftPanel from './components/common/Sidebar';
import RightPanel from './components/common/Rightbar';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [adminAccessAllowed, setAdminAccessAllowed] = useState(false);

  const hideSidebars = ['/login', '/signup', '/admin', '/admin/logs', '/admin/users', '/admin/posts'].includes(location.pathname);

  useEffect(() => {
    const cookieValue = Cookies.get("tuneshare_cookie");
    if (!cookieValue && !['/login', '/signup'].includes(location.pathname)) {
      navigate('/login');
    }
  }, [navigate, location.pathname]);

  useEffect(() => {
    const checkAdminAccess = () => {
      const key = import.meta.env.VITE_ADMIN_DASHBOARD_KEY;
      const expectedHash = import.meta.env.VITE_ADMIN_DASHBOARD_HASH_SHA_512;

      if (!key || !expectedHash) {
        console.warn("Missing admin key or hash in env");
        return;
      }

      const computedHash = sha512(key);

      if (computedHash === expectedHash) {
        setAdminAccessAllowed(true);
      } else if (['/admin', '/admin/logs'].includes(location.pathname)) {
        navigate('/');
      }
    };

    checkAdminAccess();
  }, [location.pathname, navigate]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className='flex max-w-6xl mx-auto'>
        {!hideSidebars && <LeftPanel />}
        <Routes>
          <Route path='/login' element={<LoginPage />} />
          <Route path='/signup' element={<SignUpPage />} />
          <Route path='/' element={<HomePage />} />
          <Route path='/notifications' element={<NotificationPage />} />
          <Route path='/profile/:userId' element={<ProfilePage />} />
          {adminAccessAllowed && (
            <>
              <Route path='/admin' element={<AdminPage />} />
              <Route path='/admin/logs' element={<LogsDashboard />} />
              <Route path='/admin/users' element={<UsersDashboard />} />
              <Route path='/admin/posts' element={<PostsDashboard />} />
            </>
          )}
          {/* redirect invalid routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        {!hideSidebars && <RightPanel />}
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;
