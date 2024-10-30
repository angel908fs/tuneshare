import {Route,Routes} from 'react-router-dom';

import HomePage from './pages/home/HomePage';
import LoginPage from './pages/auth/Login/LoginPage';
import SignUpPage from './pages/auth/signup/SignUpPage';
import NotificationPage from './pages/notfications/NotificationPage';
import ProfilePage from './pages/Profile/ProfilePage';

import Sidebar from './components/common/Sidebar';
import RightPanel from './components/common/Rightbar';
import {Toaster} from 'react-hot-toast' // adds flare aka notifications on doing something
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';


// can't get rid of sidebar and right panel without having authoried user
function App() {
  /*
  const { data: authUser} = useQuery({
    queryKey: ["authUser"],
    queryFn: async() => {
      try{
        const res = await axios.get("where ever this might be");

        const data = res.data;
        return data;
      }catch (error){
        *insert error here*
        },
      },
    });
  */


  return (
    <div className='flex max-w-6xl mx-auto'>

      {/*common component, bc its not wrapped with routes */}
      <Sidebar /> 
      {/*whenver we get the user authentiated, replace ^ with {authUser && <Sidebar />} */}
      <Routes> // different pages 
        <Route path='/' element = {<HomePage />} /> {/* will navigate to '/login' */}
        <Route path='/login' element = {<LoginPage />} /> {/*will navigate to '/' */}
        <Route path='/signup' element = {<SignUpPage />} /> {/*will navigate to '/' */}
        <Route path='/notifications' element = {<NotificationPage />} /> {/* will navigate to '/login' */}
        <Route path ='/profile/:username' element={<ProfilePage />} /> {/* will navigate to '/login' */}
      </Routes>
      <RightPanel /> {/* authUser && <RightPanel /> */}
      <Toaster />
    </div>
  );
}
export default App;
