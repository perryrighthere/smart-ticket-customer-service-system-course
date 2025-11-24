import client from './client';

export interface DashboardStats {
    total_tickets: number;
    open_tickets: number;
    resolved_tickets: number;
    avg_response_time_minutes: number;
    status_distribution: Record<string, number>;
    daily_trend: Array<{ date: string; count: number }>;
}

export const statsApi = {
    getDashboardStats: async () => {
        const response = await client.get<DashboardStats>('/stats/dashboard');
        return response.data;
    }
};
