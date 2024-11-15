import {Route,Routes} from 'react-router-dom';

import HomePage from './pages/home/HomePage';
import LoginPage from './pages/auth/Login/LoginPage';
import SignUpPage from './pages/auth/signup/SignUpPage';
import NotificationPage from './pages/notfications/NotificationPage';
import ProfilePage from './pages/Profile/ProfilePage';

import Sidebar from './components/common/Sidebar';
import RightPanel from './components/common/Rightbar';
import {Toaster} from 'react-hot-toast' // adds flare aka notifications on doing something
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from './components/common/LoadingSpinner';



// can't get rid of sidebar and right panel without having authoried user
function App() {
  const {data: authUser, isLoading} = useQuery({
    queryKey: ['authUser'],
    queryFn: async() => {
      try{
        const res = await fetch('/api/login');
        if(!res.ok){
          throw new Error(data.error || "Could not receieve res from login");
        }
        console.log("authUser is here: ", data);
        return data;
      }catch (error){
        throw new Error(error);
      }
    },
  });
  if (isLoading){
    return(
      <div className='h-screen flex justify-center items-center'>
        <LoadingSpinner size = 'lg'/>
      </div>
    )
  }


  return (
    <div className='flex max-w-6xl mx-auto'>
      {/*common component, bc its not wrapped with routes */}
      {authUser && <Sidebar /> }
      <Routes> // different pages 
        <Route path='/' element = {authUser ? <HomePage /> : <Navigate to='/login'/>} />
        <Route path='/login' element = {!authUser ? <LoginPage /> : <Navigate to='/'/>}  />
        <Route path='/signup' element = {!authUser ? <SignUpPage /> : <Navigate to='/' />} />
        <Route path='/notifications' element = {authUser ? <NotificationPage /> : <Navigate to='/'/>} />
        <Route path ='/profile/:username' element={authUser ? <ProfilePage />: <Navigate to='/login'/>} />
      </Routes>
      {authUser && <RightPanel />}
      <Toaster />
    </div>
  );
}
export default App;
