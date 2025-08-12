import { useState, useEffect } from 'react';
import { getAllUsers, getAttendanceQR, getAttendanceOutQR } from '../../api.js';
import './Attendance.css';

const Attendance = () => {
    const [allUsers, setAllUsers] = useState(null)
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await getAllUsers();
                setAllUsers(response.data)
                // console.log(allUsers);
            } catch (error) {
                console.error("Error fetching users:", error);
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
                    [user._id]: { qr: `https://quickchart.io/qr?text=${JSON.stringify(response.data)}&ecLevel=L&size=200&format=svg`, type: 'in' }
                }));
                })
                .catch(error => {
                    // if (error.response.status === 409) {
                    //     setQrLinks(prev => ({
                    //         ...prev,
                    //         [user._id]: `Already Checked In`
                    //     }));
                    // }
                    getAttendanceOutQR(userData)
                    .then(response => {
                    setQrLinks(prev => ({
                        ...prev,
                        [user._id]: { qr: `https://quickchart.io/qr?text=${JSON.stringify(response.data)}&ecLevel=L&size=200&format=svg`, type: 'out' }
                    }));
                    })
                    
                console.log("Error fetching QR code:", error.response.status);
                });
            });
            
        }
    }, [allUsers]);


    return (
        <div className="dash_page attendance">
            <h2>Staff List <span className='textAccent'>{allUsers?.data?.length}</span></h2>
            <div className="staffListContainer">
                {/* <a href={link} target="_blank" rel="noopener noreferrer">Open QR Code</a> */}
                <ul>
                    {allUsers?.data?.map(user => (
      <li key={user._id}>
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
            (qrLinks[user._id] && qrLinks[user._id].type === 'in') ? <a href={qrLinks[user._id].qr || '#'} target="_blank" rel="noopener noreferrer" className='qrLink'>QR Sign In</a> : (qrLinks[user._id] && qrLinks[user._id].type === 'out') ? <a href={qrLinks[user._id].qr || '#'} target="_blank" rel="noopener noreferrer" className='qrLink signout'>QR Sign Out</a> : <p className="qrLink"></p>
        }
        
      </li>
    ))}
                </ul>
            </div>
        </div>
    )
}
export default Attendance;