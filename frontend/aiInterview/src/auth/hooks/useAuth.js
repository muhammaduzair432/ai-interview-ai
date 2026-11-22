import { useContext } from 'react';
import { AuthContext } from '../services/auth.context.jsx';
import {loginUser, registerUser,getCurrentUser, logoutUser} from '../services/auth.api.js';

export const useAuth = () => {
    const context = useContext(AuthContext);
    const { user, setUser, loading, setloading } = context;

    const handleRegister = async (username, email, password, fullname) => {
        setloading(true);
        try {
            const data = await registerUser(username, email, password, fullname);
            setUser(data.user);
            return data;
        } catch (error) {
           console.log('Error in handleRegister:', error);
            throw error;
        } finally {
            setloading(false);
        }

    };
     const handleLogin = async (email, password) => {
        setloading(true);
        try {
            const data = await loginUser(email, password);
            setUser(data.user);
            return data;
        } catch (error) {
            console.log('Error in handleLogin:', error);
            throw error;
        } finally {
            setloading(false);
        }               
    };

    const handleLogout = async () => {
        setloading(true);
        try {
            await logoutUser();
            setUser(null);
        } catch (error) {
            console.log('Error in handleLogout:', error);
            throw error;
        } finally {
            setloading(false);
        }   
    }
    const handleGetCurrentUser = async () => {
        try {
            const data = await getCurrentUser()
            setUser(data.user)
            return data
        } catch (error) {
            setUser(null)
            throw error
        }
    }

    return { user, loading, handleRegister, handleLogin, handleLogout ,handleGetCurrentUser}
}

