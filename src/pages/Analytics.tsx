import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useBoardStore } from '../store/boardStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const Analytics = () => {
    const { boardId } = useParams<{ boardId: string }>();
    const { fetchAnalytics } = useBoardStore();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (boardId) {
            fetchAnalytics(boardId).then((res) => {
                setData(res);
                setLoading(false);
            });
        }
    }, [boardId, fetchAnalytics]);

    if (loading) return <div className="p-8 text-center">Loading analytics...</div>;
    if (!data) return <div className="p-8 text-center">Failed to load analytics</div>;

    const activityData = Object.entries(data.activityVolume).map(([date, count]) => ({
        date,
        count,
    }));

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Board Analytics</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Key Metrics */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Overview</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded">
                            <p className="text-sm text-gray-500">Total Cards</p>
                            <p className="text-2xl font-bold text-blue-600">{data.totalCards}</p>
                        </div>
                        {/* Add more metrics if available */}
                    </div>
                </div>

                {/* Cards per List */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Cards per List</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.cardsPerList}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="listName" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Activity Volume */}
                <div className="bg-white p-6 rounded-lg shadow-md col-span-1 md:col-span-2">
                    <h2 className="text-xl font-semibold mb-4">Activity Volume (Last 7 Days)</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={activityData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="count" stroke="#82ca9d" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Member Activity */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Member Activity</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.memberActivity} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={100} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#ffc658" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
