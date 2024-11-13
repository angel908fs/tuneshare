import {Route,Routes} from 'react-router-dom';

import HomePage from './pages/home/HomePage';
import LoginPage from './pages/auth/Login/LoginPage';
import SignUpPage from './pages/auth/signup/SignUpPage';
import NotificationPage from './pages/notfications/NotificationPage';
import ProfilePage from './pages/Profile/ProfilePage';

import Sidebar from './components/common/Sidebar';
import RightPanel from './components/common/Rightbar';
import {Toaster} from 'react-hot-toast' // adds flare aka notifications on doing something

// can't get rid of sidebar and right panel without having authoried user
function App() {
  return (
    <div className='flex max-w-6xl mx-auto'>
      {/*common component, bc its not wrapped with routes */}
      <Sidebar /> 
      <Routes> // different pages 
        <Route path='/' element = {<HomePage />} />
        <Route path='/login' element = {<LoginPage />} />
        <Route path='/signup' element = {<SignUpPage />} />
        <Route path='/notifications' element = {<NotificationPage />} />
        <Route path ='/profile/:username' element={<ProfilePage />} />
        {}
      </Routes>
      <RightPanel />
      <Toaster />
    </div>
  );
}
export default App;
