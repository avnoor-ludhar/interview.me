import './App.css';
import { ThemeProvider } from "@/components/theme-provider";
import Login from './Pages/Login';
import Landing from './Pages/Landing';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Navbar from '@/components/navbar';
import SignUp from './Pages/SignUp';
import Home from './Pages/Home';
import Meeting from './Pages/Meeting';
import { useEffect, useState } from 'react';
import { useAppDispatch } from './redux/store';
import { addUser } from "@/redux/features/userSlice";
import { useAppSelector } from './redux/store';
import api from './lib/axios';

type userType = {
  email: string,
  token: string
}

function App(): JSX.Element {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.user.user);
  const [isUserChecked, setIsUserChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await api.get('/api/user/session');
        const user: userType = {token: '', email: response.data.email};
        dispatch(addUser(user));
        navigate('/home');
      } catch (error) {
        console.error('No active session');
      }
      setIsUserChecked(true);
    };
    checkSession();
  }, [dispatch]);

  if (!isUserChecked) {
    return <div>Loading...</div>; // or any other loading indicator
  }

  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <div className='absolute left-0 top-0 w-full'>
          <Navbar />
          <Routes>
            <Route path='/login' element={!user ? <Login /> : <Navigate to='/home' />} />
            <Route path='/' element={!user ? <Landing /> : <Navigate to='/home' />} />
            <Route path='/signup' element={!user ? <SignUp /> : <Navigate to='/home' />} />
            <Route path='/home' element={user ? <Home /> : <Navigate to='/login' />} />
            <Route path='/meeting' element={user ? <Meeting /> : <Navigate to='/login' />} />
          </Routes>
        </div>
      </ThemeProvider>
    </>
  )
}

export default App;
