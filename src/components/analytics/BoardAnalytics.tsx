import React from 'react';
import { useParams } from 'react-router-dom';
import { TopBar } from '../layout/TopBar';
import { BarChart3, TrendingUp, Users, Clock, Target } from 'lucide-react';

export function BoardAnalytics() {
    const { boardId } = useParams<{ boardId: string }>();

    return (
        <div className="flex-1 overflow-auto">
            <TopBar
                title="Board Analytics"
                subtitle="Track board performance and insights"
            />

            <div className="p-6 space-y-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics for Board {boardId}</h3>
                    <p className="text-gray-600">
                        Board-specific analytics will be displayed here.
                    </p>
                </div>

                {/* Placeholder for metrics similar to AnalyticsPage but scoped to board */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Board Productivity</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">--%</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
