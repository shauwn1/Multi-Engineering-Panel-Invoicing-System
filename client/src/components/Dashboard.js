import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Line, Doughnut } from 'react-chartjs-2';
import { 
    Chart as ChartJS, 
    CategoryScale, 
    LinearScale, 
    PointElement, 
    LineElement, 
    Title, 
    Tooltip, 
    Legend,
    ArcElement 
} from 'chart.js';
import { FaMoneyBillWave, FaChartLine, FaHourglassHalf, FaFileInvoice, FaCheckDouble, FaExclamationTriangle } from 'react-icons/fa';
import './Dashboard.css';

ChartJS.register(
    CategoryScale, 
    LinearScale, 
    PointElement, 
    LineElement, 
    Title, 
    Tooltip, 
    Legend,
    ArcElement
);

const formatCurrency = (amount) => new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR"
}).format(amount);

const StatCard = ({ title, value, count, icon, className }) => (
    <div className={`stat-card ${className || ''}`}>
        <div className="stat-icon">{icon}</div>
        <div className="stat-info">
            <p className="stat-title">{title}</p>
            <p className="stat-value">{value}</p>
            <p className="stat-count">{count}</p>
        </div>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        dailySales: { total: 0, count: 0 },
        monthlySales: { total: 0, count: 0 },
        totalOutstandingCredit: { total: 0, count: 0 }
    });
    const [lineChartData, setLineChartData] = useState({});
    const [doughnutChartData, setDoughnutChartData] = useState({});
    const [recentInvoices, setRecentInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState('User');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const token = userInfo ? userInfo.token : null;
            
            if (userInfo && userInfo.username) {
                setUsername(userInfo.username);
            }

            if (!token) {
                navigate('/login');
                return;
            }
            const headers = { "Authorization": `Bearer ${token}` };

            try {
                const [statsRes, lineChartRes, statusChartRes, recentInvoicesRes] = await Promise.all([
    fetch(`${process.env.REACT_APP_API_URL}/api/invoices/stats`, { headers }),
    fetch(`${process.env.REACT_APP_API_URL}/api/invoices/sales/over-time`, { headers }),
    fetch(`${process.env.REACT_APP_API_URL}/api/invoices/stats/status`, { headers }),
    fetch(`${process.env.REACT_APP_API_URL}/api/invoices?sort=date&limit=5`, { headers })
]);

                if ([statsRes, lineChartRes, statusChartRes, recentInvoicesRes].some(res => res.status === 401)) {
                    localStorage.removeItem('userInfo');
                    navigate('/login');
                    return;
                }

                if (!statsRes.ok) throw new Error('Failed to fetch stats');
                const statsData = await statsRes.json();
                setStats(statsData);

                if (!lineChartRes.ok) throw new Error('Failed to fetch line chart data');
                const lineData = await lineChartRes.json();
                const labels = lineData.map(d => new Date(d._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
                const data = lineData.map(d => d.totalSales);
                setLineChartData({
                    labels,
                    datasets: [{
                        label: 'Sales (LKR)',
                        data,
                        fill: true,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        tension: 0.3
                    }]
                });

                if (!statusChartRes.ok) throw new Error('Failed to fetch status chart data');
                const statusData = await statusChartRes.json();
                setDoughnutChartData({
                    labels: ['Paid', 'Partially Paid', 'Unpaid'],
                    datasets: [{
                        data: [statusData.paid, statusData.partial, statusData.unpaid],
                        backgroundColor: [
                            '#28a745',
                            '#ffc107',
                            '#dc3545'
                        ],
                        borderColor: [ '#fff' ],
                        borderWidth: 2,
                    }]
                });

                if (!recentInvoicesRes.ok) throw new Error('Failed to fetch recent invoices');
                const recentData = await recentInvoicesRes.json();
                setRecentInvoices(recentData);

            } catch (err) {
                console.error("Failed to load dashboard data:", err.message);
                if (err.message.includes('401')) {
                    localStorage.removeItem('userInfo');
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [navigate]);
    
    if (loading) return <p>Loading Dashboard...</p>;
    
    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Dashboard</h1>
                <h2>Welcome back, {username}!</h2>
            </div>
            
            <div className="dashboard-layout">
                <div className="main-content">
                    <div className="dashboard-grid">
                        <StatCard 
                            title="Today's Sales" 
                            value={formatCurrency(stats.dailySales.total)} 
                            count={`${stats.dailySales.count} Invoices`}
                            icon={<FaMoneyBillWave />}
                            className="sales-today"
                        />
                        <StatCard 
                            title="This Month's Sales" 
                            value={formatCurrency(stats.monthlySales.total)}
                            count={`${stats.monthlySales.count} Invoices`}
                            icon={<FaChartLine />}
                            className="sales-month"
                        />
                        <StatCard 
                            title="Outstanding Credit" 
                            value={formatCurrency(stats.totalOutstandingCredit.total)}
                            count={`${stats.totalOutstandingCredit.count} Invoices`}
                            icon={<FaHourglassHalf />}
                            className="sales-credit"
                        />
                    </div>

                    <div className="chart-container large-chart">
                        <h3>Sales Trend (Last 30 Days)</h3>
                        {lineChartData.labels && <Line data={lineChartData} />}
                    </div>
                </div>
                
                <div className="sidebar">
                    <div className="chart-container">
                        <h3>Invoice Status</h3>
                        {doughnutChartData.labels && 
                            <Doughnut 
                                data={doughnutChartData} 
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { position: 'bottom' } }
                                }}
                            />
                        }
                    </div>
                    
                    <div className="chart-container recent-invoices">
                        <h3>Recent Invoices</h3>
                        <ul className="recent-invoices-list">
                            {recentInvoices.length > 0 ? recentInvoices.map(inv => (
                                <li key={inv._id}>
                                    <div className="invoice-icon">
                                        {inv.balance <= 0 ? <FaCheckDouble className="icon-paid" /> : 
                                         (inv.advance > 0 ? <FaExclamationTriangle className="icon-partial" /> : 
                                                              <FaFileInvoice className="icon-unpaid" />)}
                                    </div>
                                    <div className="invoice-details">
                                        <Link to={`/invoices/${inv._id}`} className="invoice-link">{inv.invoiceNo}</Link>
                                        <span className="invoice-customer">{inv.customerName}</span>
                                    </div>
                                    <span className="invoice-amount">{formatCurrency(inv.grandTotal)}</span>
                                </li>
                            )) : (
                                <p className="no-invoices-msg">No recent invoices found.</p>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;