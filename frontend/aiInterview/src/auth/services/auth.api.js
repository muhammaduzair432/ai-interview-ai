import axios from 'axios';
const api= axios.create({
    baseURL: 'http://localhost:5000/api/v1',
    withCredentials: true,
})

export const registerUser = async  (username,email,password,fullname) => {
    try {
        const response = await api.post('/user/registerUser', {
            username,
            email,
            password,
            fullname
        });
        return response.data;
    }
    catch (error) {
        console.error('Error registering user:', error);
        throw error;
    }
}

export const loginUser = async (email, password) => {
    try {
        const response = await api.post('/user/loginUser', {
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
        const response = await api.post('/user/logoutUser');    
    return response.data;
    }
    catch (error) {
        console.error('Error logging out user:', error);
        throw error;
    }


    
}