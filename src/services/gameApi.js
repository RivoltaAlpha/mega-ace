import axios from 'axios';

const gameApi = {
    createUser: async (username) => {
        try {
            const response = await axios.post('/user', { username });
            return response.data;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    },

    spin: async (userId, betAmount) => {
        const response = await axios.post(`/api/user/${userId}/bet`, { betAmount });
        return response.data;
    },

    getStats: async (userId) => {
        const response = await axios.get(`/api/user/${userId}/stats`);
        return response.data;
    },

    getBalance: async (userId) => {
        const response = await axios.get(`/api/user/${userId}/balance`);
        return response.data;
    }
};

export default gameApi;