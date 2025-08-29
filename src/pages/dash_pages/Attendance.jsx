import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { getAllUsers, getAttendanceQR, getAttendanceOutQR } from '../../api.js';
import ListItemAvatar from '../../components/ListItemAvatar.jsx';
import './Attendance.css';

const Attendance = () => {
    const [loaded, setLoad] = useState(false);
    const [allUsers, setAllUsers] = useState(null)
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedUserQR, setSelectedUserQR] = useState(null);
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoad(false);
                const response = await getAllUsers();
                setAllUsers(response.data)
                console.log(response.data);
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoad(true);
            }
        };
        fetchUsers();
    }, []);
    
    const [qrLinks, setQrLinks] = useState({});

    useEffect(() => {        
        if (allUsers?.data) {
            allUsers.data.forEach(user => {
            const userData = { user: user._id };
                
            getAttendanceQR(userData)
                .then(response => {
                    
                setQrLinks(prev => ({
                    ...prev,
                    [user._id]: { qr: `https://quickchart.io/qr?text=${JSON.stringify(response.data)}&light=f5f5f900&dark=282828&ecLevel=L&size=200&format=svg`, type: 'in' }
                }));
                })
                .catch(error => {
                    
                    getAttendanceOutQR(userData)
                    .then(response => {
                        
                    setQrLinks(prev => ({
                        ...prev,
                        [user._id]: { qr: `https://quickchart.io/qr?text=${JSON.stringify(response.data)}&light=f5f5f900&dark=282828&ecLevel=L&size=200&format=svg`, type: 'out' }
                    }));
                    })
                    .catch (error => {
                        
                        setQrLinks(prev => ({
                            ...prev,
                            [user._id]: { qr: null, type: (error.response.data.message === 'User has equipments that are not logged out') ? 'pendingOut' : ((error.response.data.message === 'User did not timed in') ? 'done' : null) }
                        }));
                        console.log("Error fetching Out QR code:", error.response.data.message);
                    });
                    
                console.log("Error fetching In QR code:", error.response.data.message);
                });
            });
            
        }
    }, [allUsers]);


    return (
        <div className={"dash_page attendance" + (loaded ? " show" : "")}>
            <div className="header">
                <div className="textGroup">
                    <h2>Staff Attendance</h2>
                    <p className="subtitle">Record attendance for staff members using QR code scanning.</p>
                </div>
                
            </div>
            <div className="contentContainer">
                <div className="staffListContainer">
                    <ul>
                        {allUsers?.data?.filter(user => user.profile?.first_name || user.profile?.last_name).map(user => (
                            <ListItemAvatar
                                id={user._id}
                                className={(selectedUser?._id === user._id ? "selected" : "")}
                                avatar={user.profile?.display_picture}
                                largeText={`${user.profile?.first_name} ${user.profile?.last_name}`}
                                smallText={user.username}
                                status={user?.attendance_status === 'NOT_IN' ? 'Not Signed In' : (user?.attendance_status === 'IN' ? 'On Duty' : (user?.attendance_status === 'OUT' ? 'Shift Ended' : (user?.attendance_status === 'done' ? 'Signed Out' : '')))}
                                statusRaw={user?.attendance_status}
                                icon="material-symbols:circle"
                                iconWidth={10}
                                onClick={() => {
                                    setSelectedUser(user);
                                    setSelectedUserQR(qrLinks[user._id]);
                                }}
                            />

                        ))}
                        {
                            allUsers?.data?.filter(user => !user.profile?.first_name || !user.profile?.last_name).length > 0 && (
                                <div className="separator">
                                    <p>Not registered</p>
                                </div>
                            )
                        }
                        {allUsers?.data?.filter(user => !user.profile?.first_name || !user.profile?.last_name).map(user => (
                            <ListItemAvatar
                                id={user._id}
                                avatar={'https://gpmgcm.ac.in/wp-content/uploads/2024/01/Default-Profile.jpg'}
                                largeText={user.username}
                                smallText={'No Profile'}
                                className={'unavailable'}
                            />
                        ))}
                    </ul>
                </div>
                <div className="selectedUserContainer">
                    {!selectedUser && <p>Select a user.</p>}
                    {(selectedUserQR?.type === 'in' || selectedUserQR?.type === 'out') && <img src={selectedUserQR?.qr} alt="" />}
                    {(selectedUser && (selectedUserQR?.type === 'in' || selectedUserQR?.type === 'out')) && <p className='note'>Scan to {selectedUserQR?.type === 'in' ? 'Sign In' : 'Sign Out'}</p>}
                    <br />
                    {selectedUser && <p>{selectedUser.profile?.first_name || 'No'} {selectedUser.profile?.last_name || 'Profile'}</p>}
                    {selectedUser && <p className="username">@{selectedUser.username}</p>}
                </div>
            </div>
            
        </div>

    )
}
export default Attendance;