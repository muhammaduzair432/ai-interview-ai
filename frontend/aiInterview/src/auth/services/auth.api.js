import axios from 'axios';

const apiOrigin = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

const api= axios.create({
    baseURL: `${apiOrigin}/api/v1`,
    withCredentials: true,
})

export const registerUser = async  (username,email,password,fullname,avatar) => {
    try {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('fullname', fullname);
        if (avatar) formData.append('avatar', avatar);

        const response = await api.post('/user/registerUser', formData);
        return response.data;
    }
    catch (error) {
        console.error('Error registering user:', error);
        throw error;
    }
}

export const loginUser = async (email, password) => {
    try {
        const response = await api.post('/user/login', {
            email,
            password
        });
        return response.data;
    }
    catch (error) {
        console.error('Error logging in user:', error);
        throw error;
    }
}
export const logoutUser = async () => {
    try {
        const response = await api.post('/user/logout');
    return response.data;
    }
    catch (error) {
        console.error('Error logging out user:', error);
        throw error;
    }


    
}
export const getCurrentUser = async () => {
    try {
        const response = await api.get('/user/current-user');
        return response.data;
    } catch (error) {
        console.error('Error fetching current user:', error);
        throw error;
    }
}

export const getUserProfile = async () => {
    try {
        const response = await api.get('/user/profile');
        return response.data;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
}