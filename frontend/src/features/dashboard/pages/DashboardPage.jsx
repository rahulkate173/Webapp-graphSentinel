import React, { useEffect, useState } from 'react';
import Layout from '../../layer1/components/Layout';
import { fetchDashboardStats } from '../services/dashboard.api';
import { LayoutDashboard, Users, Target, AlertTriangle, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import '../styles/dashboard.css';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchDashboardStats();
        setStats(data);
      } catch (err) {
        setError('Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="dashboard-loading">
          <Activity className="spin" size={32} />
          <p>Loading overview metrics...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="dashboard-loading" style={{ color: '#ef4444' }}>
          <AlertTriangle size={32} />
          <p>{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="dashboard-page custom-scrollbar">
        <div className="dashboard-header">
          <div className="dashboard-title-group">
            <LayoutDashboard className="dashboard-header-icon" />
            <div>
              <h1 className="dashboard-title">Platform Overview</h1>
              <p className="dashboard-subtitle">Key metrics and ML analysis insights.</p>
            </div>
          </div>
        </div>

        {/* Top Metrics Cards */}
        <div className="dashboard-metrics-grid">
          <div className="dashboard-metric-card">
            <div className="metric-icon-wrapper blue">
              <Users size={24} />
            </div>
            <div className="metric-content">
              <span className="metric-label">Total Accounts Analyzed</span>
              <span className="metric-value">{stats?.total_accounts_analyzed?.toLocaleString() || 0}</span>
            </div>
          </div>

          <div className="dashboard-metric-card">
            <div className="metric-icon-wrapper orange">
              <Target size={24} />
            </div>
            <div className="metric-content">
              <span className="metric-label">Total Fraud Rings</span>
              <span className="metric-value">{stats?.total_rings?.toLocaleString() || 0}</span>
            </div>
          </div>

          <div className="dashboard-metric-card">
            <div className="metric-icon-wrapper red">
              <AlertTriangle size={24} />
            </div>
            <div className="metric-content">
              <span className="metric-label">Suspicious This Week</span>
              <span className="metric-value">{stats?.suspicious_accounts_this_week?.toLocaleString() || 0}</span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="dashboard-charts-grid">
          
          {/* Patterns Pie Chart */}
          <div className="dashboard-chart-card">
            <h3 className="chart-title">Detected Patterns Distribution</h3>
            <div className="chart-container">
              {stats?.pieData?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => [value, 'Rings']} />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="dashboard-loading">No pattern data available</div>
              )}
            </div>
          </div>

          {/* Suspicion Score Bar Graph */}
          <div className="dashboard-chart-card">
            <h3 className="chart-title">Suspicion Score Ranges</h3>
            <div className="chart-container">
              {stats?.barData?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.barData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <RechartsTooltip 
                      cursor={{fill: '#f1f5f9'}} 
                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                    />
                    <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={40} name="Accounts" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="dashboard-loading">No score data available</div>
              )}
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
