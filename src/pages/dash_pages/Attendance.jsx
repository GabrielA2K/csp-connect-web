import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { getAllUsers, getAttendanceQR, getAttendanceOutQR } from '../../api.js';
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
        if (allUsers) {
            console.log("Updated users:", allUsers.data);
        }
        
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
            <h2>Staff List <span className='textAccent'>{allUsers?.data?.length}</span></h2>
            <div className="contentContainer">
                <div className="staffListContainer">
                    {/* <a href={link} target="_blank" rel="noopener noreferrer">Open QR Code</a> */}
                    <ul>
                        {allUsers?.data?.map(user => (
                            <li key={user._id} onClick={() => {
                                setSelectedUser(user);
                                setSelectedUserQR(qrLinks[user._id]);
                            }}>
                                <img
                                src={user.profile?.display_picture || 'https://gpmgcm.ac.in/wp-content/uploads/2024/01/Default-Profile.jpg'}
                                alt=""
                                />
                                <div className="profileInformation">
                                <p className="fullName">
                                    {user.profile?.first_name || 'No'} {user.profile?.last_name || 'Profile'}
                                </p>
                                <p className="username">@{user.username}</p>
                                </div>
                                {
                                    <div className={"tag qrLink "+user?.attendance_status}>
                                        <p>{user?.attendance_status === 'NOT_IN' ? 'Not Signed In' : (user?.attendance_status === 'IN' ? 'On Duty' : (user?.attendance_status === 'OUT' ? 'Shift Ended' : (user?.attendance_status === 'done' ? 'Signed Out' : '')))}</p>
                                        <Icon icon="material-symbols:circle" width={10} />
                                    </div>
                                    // (qrLinks[user._id] && qrLinks[user._id].type === 'in') ? <a href={qrLinks[user._id].qr || '#'} target="_blank" rel="noopener noreferrer" className='qrLink'>QR Sign In</a> : (qrLinks[user._id] && qrLinks[user._id].type === 'out') ? <a href={qrLinks[user._id].qr || '#'} target="_blank" rel="noopener noreferrer" className='qrLink out'>QR Sign Out</a> : <p className="qrLink"></p>
                                }
                                
                            </li>
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