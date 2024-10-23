import {Route,Routes} from 'react-router-dom';

import HomePage from './pages/home/HomePage';
import LoginPage from './pages/auth/Login/LoginPage';
import SignUpPage from './pages/auth/signup/SignUpPage';
import Sidebar from './components/common/Sidebar';
import RightPanel from './components/common/Rightbar';


function App() {
  return (
    <div className='flex max-w-6xl mx-auto'>
      {/*common component, bc its not wrapped with routes */}
      <Sidebar />
      <Routes> // different pages 
        <Route path='/' element = {<HomePage />} />
        <Route path='/login' element = {<LoginPage />} />
        <Route path='/signup' element = {<SignUpPage />} />
      </Routes>
      <RightPanel />
    </div>
  );
}

export default App;
