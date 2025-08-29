import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { getAllUsers, getAttendanceQR, getAttendanceOutQR, getVoucherQR } from '../../api.js';

import ListItemAvatar from '../../components/ListItemAvatar.jsx';

import './FoodVoucher.css';

const FoodVoucher = () => {
    const [allUsers, setAllUsers] = useState(null)
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedUserQR, setSelectedUserQR] = useState(null);
    const [loaded, setLoad] = useState(false);
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoad(false);
                const response = await getAllUsers();
                setAllUsers(response.data)
                // console.log(allUsers);
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
                setLoad(false);
            getVoucherQR(userData)
                .then(response => {
                    setLoad(true);
                setQrLinks(prev => ({
                    ...prev,
                    [user._id]: { qr: `https://quickchart.io/qr?text=${JSON.stringify(response.data)}&dark=282828&ecLevel=L&size=200&format=svg`, type: 'unclaimed' }
                }));
                })
                .catch(error => {
                    setLoad(true);
                    setQrLinks(prev => ({
                        ...prev,
                        [user._id]: { qr: null, type: (error.response.data.message === 'User does not have food voucher yet') ? 'unavailable' : ((error.response.data.message === 'User already used their food voucher') ? 'claimed' : null) }
                    }));
                    console.log("Error fetching Out QR code:", error.response.data.message);
                    
                // console.log("Error fetching In QR code:", error.response.data.message);
                });
            });
            
        }
    }, [allUsers]);


    return (
        <div className={"dash_page attendance" + (loaded ? " show" : "")}>
            <div className="header">
                <div className="textGroup">
                    <h2>Food Vouchers</h2>
                    <p className="subtitle">Manage food vouchers for staff members.</p>
                </div>
                
            </div>
            <div className="contentContainer">
                <div className="staffListContainer">
                    {/* <a href={link} target="_blank" rel="noopener noreferrer">Open QR Code</a> */}
                    <ul>
                        {allUsers?.data?.filter(user => user.profile?.first_name || user.profile?.last_name).map(user => (
                            <ListItemAvatar
                                id={user._id}
                                className={(selectedUser?._id === user._id ? "selected" : "")}
                                avatar={user.profile?.display_picture}
                                largeText={`${user.profile?.first_name} ${user.profile?.last_name}`}
                                smallText={user.username}
                                status={qrLinks[user._id]?.type === 'unclaimed' ? 'Not Redeemed' : (qrLinks[user._id]?.type === 'claimed' ? 'Redeemed' : (qrLinks[user._id]?.type === 'unavailable' ? 'Unavailable' : (qrLinks[user._id]?.type === 'done' ? 'Done' : '')))}
                                statusRaw={qrLinks[user._id]?.type}
                                icon="mingcute:ticket-fill"
                                iconWidth={18}
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
                                avatar={user.profile?.display_picture}
                                largeText={user.username}
                                smallText={'No Profile'}
                                className={'unavailable'}
                            />
                        ))}
                    </ul>
                </div>
                <div className="selectedUserContainer">
                    {!selectedUser && <p>Select a user.</p>}
                    {(selectedUserQR?.type === 'unclaimed') && <img src={selectedUserQR?.qr} alt="" />}
                    {(selectedUser && (selectedUserQR?.type === 'unclaimed')) && <p className='note'>Scan to Claim Food Voucher</p>}
                    <br />
                    {selectedUser && <p>{selectedUser.profile?.first_name || 'No'} {selectedUser.profile?.last_name || 'Profile'}</p>}
                    {selectedUser && <p className="username">@{selectedUser.username}</p>}
                </div>
            </div>
            
        </div>
    )
}
export default FoodVoucher;