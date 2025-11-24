import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Spin, Typography } from 'antd';
import ReactECharts from 'echarts-for-react';
import { DashboardStats, statsApi } from '../api/stats';

const { Title } = Typography;

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await statsApi.getDashboardStats();
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return <div style={{ textAlign: 'center', marginTop: 50 }}><Spin size="large" /></div>;
    }

    if (!stats) {
        return <div>Failed to load data.</div>;
    }

    const trendOption = {
        title: { text: 'Ticket Trend (Last 7 Days)' },
        tooltip: { trigger: 'axis' },
        xAxis: {
            type: 'category',
            data: stats.daily_trend.map(item => item.date),
        },
        yAxis: { type: 'value' },
        series: [
            {
                data: stats.daily_trend.map(item => item.count),
                type: 'line',
                smooth: true,
            },
        ],
    };

    const statusOption = {
        title: { text: 'Ticket Status Distribution', left: 'center' },
        tooltip: { trigger: 'item' },
        legend: { orient: 'vertical', left: 'left' },
        series: [
            {
                name: 'Status',
                type: 'pie',
                radius: '50%',
                data: Object.entries(stats.status_distribution).map(([name, value]) => ({
                    name,
                    value,
                })),
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)',
                    },
                },
            },
        ],
    };

    return (
        <div style={{ padding: 24 }}>
            <Title level={2}>Dashboard</Title>

            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={8}>
                    <Card>
                        <Statistic title="Total Tickets" value={stats.total_tickets} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic title="Open Tickets" value={stats.open_tickets} valueStyle={{ color: '#cf1322' }} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic title="Resolved Tickets" value={stats.resolved_tickets} valueStyle={{ color: '#3f8600' }} />
                    </Card>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Card>
                        <ReactECharts option={trendOption} />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card>
                        <ReactECharts option={statusOption} />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;
