import './App.css';
import { ThemeProvider } from "@/components/theme-provider";
import Login from './Pages/Login';
import Landing from './Pages/Landing';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '@/components/navbar';
import SignUp from './Pages/SignUp';
import Home from './Pages/Home';
import Meeting from './Pages/Meeting';
import Results from './Pages/Results';
import { useEffect, useState } from 'react';
import { useAppDispatch } from './redux/store';
import { addUser, removeUser } from "@/redux/features/userSlice";
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
  const location = useLocation(); // Get the current route location

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await api.get('/api/user/session');
        const user: userType = { token: '', email: response.data.email };
        dispatch(addUser(user));
      } catch (error) {
        console.error('No active session');
        dispatch(removeUser());
      }
      setIsUserChecked(true);
    };
    checkSession();
  }, [dispatch]);

  if (!isUserChecked) {
    return <div>Loading...</div>; // or any other loading indicator
  }

  // Condition to hide Navbar for /home and /meeting routes
  const hideNavbarRoutes = ['/home', '/meeting'];
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <div className='absolute left-0 top-0 w-full'>
          {shouldShowNavbar && <Navbar />} {/* Conditionally render Navbar */}
          <Routes>
            <Route path='/login' element={!user ? <Login /> : <Navigate to='/home' />} />
            <Route path='/' element={!user ? <Landing /> : <Navigate to='/home' />} />
            <Route path='/signup' element={!user ? <SignUp /> : <Navigate to='/home' />} />
            <Route path='/home' element={user ? <Home /> : <Navigate to='/login' />} />
            <Route path='/meeting' element={user ? <Meeting /> : <Navigate to='/login' />} />
            <Route path='/results' element={user ? <Results /> : <Navigate to='/login' />} />
          </Routes>
        </div>
      </ThemeProvider>
    </>
  );
}

export default App;
