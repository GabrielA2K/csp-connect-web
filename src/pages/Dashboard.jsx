import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";

import Attendance from "./dash_pages/Attendance.jsx";
import StaffManagement from "./dash_pages/StaffManagement.jsx";
import FoodVoucher from "./dash_pages/FoodVoucher.jsx";
import Equipment from "./dash_pages/Equipment.jsx";
import AttendanceSheet from "./dash_pages/AttendanceSheet.jsx";

import CSP from '../assets/csp.svg';

import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const [isPageFull, setIsPageFull] = useState(true);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.clear();
        navigate('/login');
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login"); // auto-redirect if no token exists
        }
    }, [navigate]);

    const [activeTab, setActiveTab] = useState('attendance');
    useEffect(() => {
        const savedTab = localStorage.getItem('dashTab');
        if (savedTab) {
            setActiveTab(savedTab);
        }
        const timer = setTimeout(() => {
            setIsPageFull(false);
            console.log("Page is now windowed"); 
        }, 10);
        return () => clearTimeout(timer);

    }, []);

    

    return (
        <div className={"page dashboard" + (isPageFull ? " full" : "")}>
            <nav className="sidebar">
                <header>
                    <img src={CSP} alt="CSP Logo" />
                    <h1 className='fontExtraBold'>CSP Connect</h1>
                </header>
                
                <ul>
                    {/* <li className={activeTab === 'home' ? 'active' : ''} onClick={() => setActiveTab('home')}>
                        <Icon icon="mingcute:chart-pie-2-line" width={28}/>
                        Dashboard
                    </li> */}
                    <li className={activeTab === 'attendance' ? 'active' : ''} onClick={() => {setActiveTab('attendance'); localStorage.setItem('dashTab', 'attendance');}}>
                        <Icon icon="mingcute:list-check-3-line" width={28}/>
                        Staff Attendance
                    </li>
                    <li className={activeTab === 'attendanceSheet' ? 'active' : ''} onClick={() => {setActiveTab('attendanceSheet'); localStorage.setItem('dashTab', 'attendanceSheet');}}>
                        <Icon icon="mingcute:table-2-line" width={28}/>
                        Attendance Sheet
                    </li>
                    <li className={activeTab === 'foodVoucher' ? 'active' : ''} onClick={() => {setActiveTab('foodVoucher'); localStorage.setItem('dashTab', 'foodVoucher');}}>
                        <Icon icon="mingcute:ticket-line" width={28}/>
                        Food Vouchers
                    </li>
                    <li className={activeTab === 'staffManagement' ? 'active' : ''} onClick={() => {setActiveTab('staffManagement'); localStorage.setItem('dashTab', 'staffManagement');}}>
                        <Icon icon="mingcute:group-2-line" width={28}/>
                        Staff Management
                    </li>
                    <li className={activeTab === 'equipments' ? 'active' : ''} onClick={() => {setActiveTab('equipments'); localStorage.setItem('dashTab', 'equipments');}}>
                        <Icon icon="mingcute:briefcase-2-line" width={28}/>
                        Equipments
                    </li>
                </ul>

                <li className="signout" onClick={handleLogout}>
                    <Icon icon="mingcute:minus-circle-line" width={28}/>
                    Sign Out
                </li>
            </nav>
            <main className={""}>
                <div className={"mainContainer"}>
                        {(() => {
                    switch (activeTab) {
                            
                            case 'attendance':
                                return <Attendance />;
                            case 'staffManagement':
                                return <StaffManagement />;
                            case 'foodVoucher':
                                return <FoodVoucher />;
                            case 'equipments':
                                return <Equipment />;
                            case 'attendanceSheet':
                                return <AttendanceSheet />;
                        }
                    })()}
                </div>
                <div className="loader">
                    <Icon icon="svg-spinners:gooey-balls-2" width={150} color="var(--accent)" />
                </div>
            </main>
            
        </div>
    );
};

export default Dashboard;