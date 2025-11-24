import client from './client';

export const authApi = {
    login: async (username: string, password: string) => {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        const response = await client.post('/auth/token', formData);
        return response.data;
    },

    register: async (email: string, password: string, name?: string) => {
        const response = await client.post('/auth/register', { email, password, name });
        return response.data;
    },

    getMe: async () => {
        const response = await client.get('/auth/me');
        return response.data;
    }
};
