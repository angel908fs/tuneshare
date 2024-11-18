import {Route,Routes, useLocation} from 'react-router-dom';

import HomePage from './pages/home/HomePage';
import LoginPage from './pages/auth/Login/LoginPage';
import SignUpPage from './pages/auth/signup/SignUpPage';
import NotificationPage from './pages/notfications/NotificationPage';
import ProfilePage from './pages/Profile/ProfilePage';

import LeftPanel from './components/common/Sidebar';
import RightPanel from './components/common/Rightbar';
import {Toaster} from 'react-hot-toast' // adds flare aka notifications on doing something



function App() {
  const location = useLocation();
  const hideSidebars = ['/login','/signup'].includes(location.pathname);
  // side bars wont show up for only login and signup

  return (
    <div className='flex max-w-6xl mx-auto'>
      {!hideSidebars && <LeftPanel />}
      <Routes> // different pages 
        <Route path='/login' element = {<LoginPage />} />
        <Route path='/signup' element = {<SignUpPage />} />
        <Route path='/' element = {<HomePage />} />
        <Route path='/notifications' element = {<NotificationPage />} />
        <Route path ='/profile/:username' element={<ProfilePage />} />
      </Routes>
      {!hideSidebars && <RightPanel />}
      <Toaster />
    </div>
  );
}
export default App;
