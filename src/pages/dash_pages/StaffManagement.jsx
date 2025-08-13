import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { getAllUsers, batchRegisterUsers, getUserLocationHistory, getUserAttendanceHistory } from '../../api.js';
import { MapContainer, TileLayer, useMap, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet';
import './StaffManagement.css';
import 'leaflet/dist/leaflet.css';

import MapMarkerIcon from '../../assets/map-marker.png';
import CheckBlue from '../../assets/check-blue.svg'
import ExitOrange from '../../assets/exit-orange.svg'

function MapMover({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);

  return null;
}

const StaffManagement = () => {
    const [allUsers, setAllUsers] = useState(null)
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedUserLocationHistory, setSelectedUserLocationHistory] = useState(null);
    const [selectedUserAttendanceHistory, setSelectedUserAttendanceHistory] = useState(null);

    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState([
        {
            username: '',
            password: ''
        }
    ]);
    const [hasDuplicates, setHasDuplicates] = useState(false);
    const [triggerUpdate, setTriggerUpdate] = useState(0);

    let coordinates = []
    const addUserField = () => {
        setFormData(prevFormData => [
            ...prevFormData,
            { username: '', password: '' }
        ]);
    };
    const removeUserField = (index) => {
        setFormData(prevFormData => prevFormData.filter((_, i) => i !== index));
    };

    const handleChange = (e, index) => {
        const { name, value } = e.target;

        setFormData((prevData) => {
            const updatedData = [...prevData]; // copy array
            updatedData[index] = {
                ...updatedData[index], // copy object at index
                [name]: value // update the right field
            };
            return updatedData;
        });

    };

    function hasDuplicateUsernames(arr) {
        const seen = new Set();
        for (const user of arr) {
            const name = user.username.trim();
            if (name === "") continue; // skip empty usernames
            if (seen.has(name)) {
            return true; // duplicate found
            }
            seen.add(name);
        }
        return false; // no duplicates
    }

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
        // setShowForm(false);
    }, [triggerUpdate]);

    
    useEffect(() => {
        if (allUsers) {
            console.log("Updated users:", allUsers);
        }
        
    }, [allUsers]);


    const handleRegister = async (e) => {
            e.preventDefault();
            // setLoading(true);
    
            try {
                const credentials = JSON.stringify(formData);
                const response = await batchRegisterUsers(formData);
    
                // const profileResponse = await getProfile();
                // console.log(profileResponse.data);
                console.log(response.data);
                
            } catch (error) {
                // setLoading(false);
                console.error("Batch registration failed:", error);

            } finally {
                setTriggerUpdate(prev => prev + 1);
                setShowForm(false);
                setFormData([{ username: '', password: '' }]);
                setHasDuplicates(false);
                // setLoading(false);
            }
            
    
        };

        const anyInputExist = formData.some(formItem =>
            allUsers?.data?.some(user => user.username === formItem.username)
        );

    const handleFetchLocationHistory = async (userId) => {
        
        try {
            setHistoryTab('attendance');
            const response = await getUserLocationHistory({ user: userId, date: '2025-08-12' });
            setSelectedUserLocationHistory(response.data);
            console.log(response.data);
            (response.data.length > 0) && setCoords([response.data[0]?.location?.coordinates[1], response.data[0]?.location?.coordinates[0]]);
            setZoom(13);

            coordinates = response.data.map(item => {
                const [lng, lat] = item.location.coordinates;
                return [lat, lng]; // Swap positions
            });
            handleShowPolyline(coordinates);
            
            // console.log("Coordinates:", coordinates);
            const attendanceResponse = await getUserAttendanceHistory({ user: userId });
            setSelectedUserAttendanceHistory(attendanceResponse.data);
            console.log("Attendance Data:", attendanceResponse.data);
        } catch (error) {
            // setLoading(false);
            console.error("Batch registration failed:", error);

        } finally {
           
            
            // setLoading(false);
        }
    }

        useEffect(() => {
        // console.log("Form Data:", formData);
        // console.log(JSON.stringify(formData))
        // console.log(anyInputExist)
        setHasDuplicates(hasDuplicateUsernames(formData));
        
    }, [formData]);

    const isDuplicateUsername = (username, index) => {
        return username.trim() !== "" && 
                formData.some((user, i) => i !== index && user.username === username);
    };

    const mapMarker = L.icon({
        iconUrl: MapMarkerIcon,
        iconSize: [32, 32], // size of the icon
        iconAnchor: [16, 32], // point of the icon which will correspond to marker's location
        popupAnchor: [0, -32] // point from which the popup should open relative to the iconAnchor
    });

    
    const [coords, setCoords] = useState([15.2183658, 120.6601309]);
    const [zoom, setZoom] = useState(7);

    const [polylineCoords, setPolylineCoords] = useState([]);

    const handleShowPolyline = (route) => {
        setPolylineCoords(route);
    };
    
    const [historyTab, setHistoryTab] = useState('attendance')
    return (
        <div className="dash_page staffManagement">
            <div className="header">
                <h2>Staff List <span className='textAccent'>{allUsers?.meta?.total}</span></h2>
                <button onClick={() => { setShowForm(true); setFormData([{ username: '', password: '' }]);}}>Add Staff</button>
            </div>
            
            <div className="contentContainer">
                <div className="staffListContainer">
                    {/* <a href={link} target="_blank" rel="noopener noreferrer">Open QR Code</a> */}
                    <ul>
                        {allUsers?.data?.map(user => (
                            <li key={user._id} onClick={() => {
                                setSelectedUser(user);
                                handleFetchLocationHistory(user._id);

                                // useMap().setView([selectedUserLocationHistory[0]?.location?.coordinates[1], selectedUserLocationHistory[0]?.location?.coordinates[0]], 13, { animate: true });
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
                                
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="selectedUserContainer">
                    {!selectedUser && <p>Select a user.</p>}
                    <br />
                    {/* {selectedUser && <p>{selectedUser.profile?.first_name || 'No'} {selectedUser.profile?.last_name || 'Profile'}</p>}
                    {selectedUser && <p className="username">@{selectedUser.username}</p>} */}
                    {
                        selectedUser &&
                        <div className="userDetails">
                            <div className="profile">
                                <li>
                                    <img className='profileImage'
                                    src={selectedUser.profile?.display_picture || 'https://gpmgcm.ac.in/wp-content/uploads/2024/01/Default-Profile.jpg'}
                                    alt=""
                                    />
                                    <div className="profileInformation">
                                    <p className="fullName">
                                        {selectedUser.profile?.first_name || 'No'} {selectedUser.profile?.last_name || 'Profile'}
                                    </p>
                                    <p className="username">@{selectedUser.username}</p>
                                    </div>
                                    
                                </li>
                            </div>
                            <div className="header">
                                <p className={'tabHead'+(historyTab === 'attendance' ? ' active' : '')} onClick={() => setHistoryTab('attendance')}>Attendance History</p>
                                <p className={'tabHead'+(historyTab === 'location' ? ' active' : '')} onClick={() => setHistoryTab('location')}>Location History</p>
                            </div>
                            {historyTab === 'attendance' && (
                                <div className="attendanceList">
                                    {
                                        selectedUserAttendanceHistory?.data.map((attendance, index) => (
                                            <div className="attendanceDayGroup" key={index}>
                                                {attendance.data?.time_in && 
                                                <div className="attendanceItem">
                                                    <li className='profileAttendance'>
                                                        <img className='profileAttendance'
                                                        src={CheckBlue}
                                                        alt=""
                                                        />
                                                        <div className="profileInformation">
                                                        <p className="sign_">
                                                            Signed In
                                                        </p>
                                                        <p className="time_">{new Date(attendance.data?.time_in).toLocaleString()}</p>
                                                        </div>
                                                        
                                                    </li>
                                                </div>}
                                                {attendance.data?.time_out && 
                                                <div className="attendanceItem">
                                                    <li className='profileAttendance'>
                                                        <img className='profileAttendance'
                                                        src={ExitOrange}
                                                        alt=""
                                                        />
                                                        <div className="profileInformation">
                                                        <p className="sign_">
                                                            Signed Out
                                                        </p>
                                                        <p className="time_">{new Date(attendance.data?.time_out).toLocaleString()}</p>
                                                        </div>
                                                        
                                                    </li>
                                                </div>}
                                            </div>
                                        ))
                                    }
                                </div>
                            )}
                            {historyTab === 'location' && (
                                <div className="historyMap">
                                    <MapContainer center={[15.2183658, 120.6601309]} zoom={5} scrollWheelZoom={true}>
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        {selectedUserLocationHistory?.map((location, index) => (
                                            <Marker key={index} position={[location?.location?.coordinates[1], location?.location?.coordinates[0]]} icon={mapMarker}>
                                                <Popup>
                                                    <div className="locationPopup">
                                                        <h2 className="locationName">{location?.address || 'No Name'}</h2>
                                                        <h3 className="locationTime">{new Date(location?.createdAt).toLocaleString()}</h3>
                                                    </div>
                                                </Popup>
                                            </Marker>
                                        ))}
                                        <Polyline pathOptions={{ color: '#007AFF', weight: 5, opacity: 0.8 }} positions={polylineCoords ? polylineCoords : []} />
                                        <MapMover center={coords} zoom={zoom} />
                                    </MapContainer>
                                </div>
                            )}
                        </div>
                    }
                    
                </div>
            </div>




































            <div className={"overlay "+ (showForm ? "visible" : "")} onClick={() => setShowForm(false)}>
                <div className="addUserModal" onClick={(e) => e.stopPropagation()}>
                    <div className="header">
                        <h2>Add Staff</h2>
                        <button className="close" onClick={() => addUserField()}>
                            Add Field
                        </button>
                    </div>
                    
                    <form action="" className="addUsersForm" onSubmit={handleRegister}>
                        <div className="allInputContainer">

                        
                        {
                            formData.map((user, index) => {
                                const duplicate = isDuplicateUsername(user.username, index);

                                return (
                                    <div className="userInputContainer" key={index}>
                                        <div className="bar">
                                            <div className="line"></div>
                                        </div>
                                        <div className="userInputGroup">
                                            <div className={"upperInput"}>
                                                <input
                                                    type="text"
                                                    name="username"
                                                    placeholder="Username"
                                                    value={user.username}
                                                    onChange={(e) => handleChange(e, index)}
                                                    autoComplete='off'
                                                    required
                                                />
                                                { (formData.length > 1) && (
                                                    <button type="button" className="removeField" onClick={() => removeUserField(index)}>
                                                        <Icon icon="mingcute:minus-circle-line" width={24} />
                                                    </button>
                                                )}
                                            </div>
                                            
                                            <input
                                                type="text"
                                                name="password"
                                                placeholder="Password"
                                                value={user.password}
                                                onChange={(e) => handleChange(e, index)}
                                                required
                                            />
                                            {duplicate && <p className="error">Duplicate username.</p>}
                                            {(allUsers?.data.some(item => item.username === user.username) && <p className="error">Username already exists in the system.</p>)}
                                        </div>
                                        
                                    </div>
                                )
                            })
                        }
                        </div>
                        <button type="submit" disabled={anyInputExist || hasDuplicates}>Add Users</button>

                    </form>
                </div>
            </div>
        </div>
    )
}
export default StaffManagement;