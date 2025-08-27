import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { getAllUsers, batchRegisterUsers, getUserLocationHistory, getUserAttendanceHistory, exportLocation } from '../../api.js';
import { MapContainer, TileLayer, useMap, Marker, Popup, Polyline } from 'react-leaflet'
import { format } from 'date-fns'
import L from 'leaflet';
import './StaffManagement.css';
import 'leaflet/dist/leaflet.css';

import MapMarkerIcon from '../../assets/map-marker.png';
import CheckBlue from '../../assets/check-blue.svg'
import ExitOrange from '../../assets/exit-orange.svg'
import Mobile from '../../assets/mobile-blue.svg'
import Bag from '../../assets/bag-pink.svg'
import Uniform from '../../assets/uniform-orange.svg'

import MapStart from '../../assets/map-start.svg';
import MapEnd from '../../assets/map-end.svg';
import MapPoint from '../../assets/map-point.svg';

function MapMover({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (zoom?.animated) {
        map.flyTo(center, zoom.level, { duration: 1.5 });
    }
  }, [center, zoom, map]);

  return null;
}

const StaffManagement = () => {
    const [loaded, setLoad] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [tinyLoaderVisible, setTinyLoaderVisible] = useState(false);
    const [softReload, setSoftReload] = useState(false);
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

    const getToday = () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };
    const [dateChosen, setDateChosen] = useState(getToday());
    
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

    function getFormattedDate(dateString) {
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const date = new Date(dateString);
        return `${dayNames[date.getDay()]}, ${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    }

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
        // setShowForm(false);
    }, [triggerUpdate]);

    
    useEffect(() => {
        if (allUsers) {
            console.log("Updated users:", allUsers);
        }
        
    }, [allUsers]);

    // useEffect(() => {
    //     if (selectedUser) {
    //         console.log("Selected User:", selectedUser);
    //     }
        
    // }, [selectedUser]);


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
        setTinyLoaderVisible(true);
        try {
            // setHistoryTab('attendance');
            const response = await getUserLocationHistory({ user: userId, date: dateChosen });
            setSelectedUserLocationHistory(response.data);
            console.log('COORDINATES', response.data);
            (response.data.length > 0) && setCoords([response.data[0]?.location?.coordinates[1], response.data[0]?.location?.coordinates[0]]);
            setZoom({level: 13, animated: true});

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
            console.error(error);

        } finally {
            setTinyLoaderVisible(false);
            // setLoading(false);
        }
    }

    const handleRefetchLocationHistory = async (userId, date) => {
        setSoftReload(true);
        try {
            const response = await getUserLocationHistory({ user: userId, date });
            setSelectedUserLocationHistory(response.data);
            (response.data.length > 0) && setCoords([response.data[0]?.location?.coordinates[1], response.data[0]?.location?.coordinates[0]]);
            setZoom({level: 13, animated: true});

            coordinates = response.data.map(item => {
                const [lng, lat] = item.location.coordinates;
                return [lat, lng]; // Swap positions
            });
            handleShowPolyline(coordinates);
            
        } catch (error) {
            // setLoading(false);
            console.error(error);

        } finally {
            setSoftReload(false);
            // setLoading(false);
        }
    }
    const handleRefetchCoords = async (userId, date) => {
        setSoftReload(true);
        try {
            const response = await getUserLocationHistory({ user: userId, date });
            setSelectedUserLocationHistory(response.data);
            (response.data.length > 0) && setCoords([response.data[0]?.location?.coordinates[1], response.data[0]?.location?.coordinates[0]]);
            setZoom({level: 13, animated: false});

            coordinates = response.data.map(item => {
                const [lng, lat] = item.location.coordinates;
                return [lat, lng]; // Swap positions
            });
            handleShowPolyline(coordinates);
            
        } catch (error) {
            // setLoading(false);
            console.error(error);

        } finally {
            setSoftReload(false);
            // setLoading(false);
        }
    }

    useEffect(() => {
        setHasDuplicates(hasDuplicateUsernames(formData));
    }, [formData]);

    const isDuplicateUsername = (username, index) => {
        return username.trim() !== "" && 
                formData.some((user, i) => i !== index && user.username === username);
    };

    const mapMarkerStart = L.icon({
        iconUrl: MapStart,
        iconSize: [48, 48], // size of the icon
        iconAnchor: [24, 48], // point of the icon which will correspond to marker's location
        popupAnchor: [0, -48] // point from which the popup should open relative to the iconAnchor
    });
    const mapMarkerMid = L.icon({
        iconUrl: MapPoint,
        iconSize: [32, 32], // size of the icon
        iconAnchor: [16, 16], // point of the icon which will correspond to marker's location
        popupAnchor: [0, -32] // point from which the popup should open relative to the iconAnchor
    });
    const mapMarkerEnd = L.icon({
        iconUrl: MapEnd,
        iconSize: [48, 48], // size of the icon
        iconAnchor: [24, 48], // point of the icon which will correspond to marker's location
        popupAnchor: [0, -48] // point from which the popup should open relative to the iconAnchor
    });

    
    const [coords, setCoords] = useState([15.2183658, 120.6601309]);
    const [zoom, setZoom] = useState({level:13,animated:true});

    const [polylineCoords, setPolylineCoords] = useState([]);

    const handleShowPolyline = (route) => {
        setPolylineCoords(route);
    };
    
    const [historyTab, setHistoryTab] = useState('attendance')


    const years = [2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036, 2037];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const days = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31];
    

    const downloadFile = async () => {
        try {
            setDownloading(true);
            const response = await exportLocation({ user: selectedUser._id, date: dateChosen });

            // Create a blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;

            // You can hardcode a filename OR extract from response headers
            link.setAttribute("download", `CSP-LocationHistory_${dateChosen}.xlsx`);
            document.body.appendChild(link);
            link.click();

            // Cleanup
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading file:", error);
        } finally {
            setDownloading(false);
        }
    };

    useEffect(() => {
        console.log("Selected date:", dateChosen);
    }, [dateChosen]);

    useEffect(() => {
        console.log("USER ATTENDANCE:", selectedUserAttendanceHistory);
    }, [selectedUserAttendanceHistory]);

    return (
        <div className={"dash_page staffManagement" + (loaded ? " show" : "")}>
            <div className="header">
                <h2>Staff List <span className='textAccent'>{allUsers?.meta?.total}</span></h2>
                <button onClick={() => { setShowForm(true); setFormData([{ username: '', password: '' }]);}}>Add Staff</button>
            </div>
            
            <div className="contentContainer">
                <div className="staffListContainer">
                    {/* <a href={link} target="_blank" rel="noopener noreferrer">Open QR Code</a> */}
                    <ul>
                        {allUsers?.data?.map(user => (
                            <li className={(selectedUser?._id === user._id ? "selected" : "")+(tinyLoaderVisible ? " lock" : "")} key={user._id} onClick={() => {
                                setSelectedUser(user);
                                handleFetchLocationHistory(user._id);

                                // useMap().setView([selectedUserLocationHistory[0]?.location?.coordinates[1], selectedUserLocationHistory[0]?.location?.coordinates[0]], 13, { animate: true });
                            }}>
                                <img className={selectedUser?._id === user._id ? "selected" : ""}
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
                            {/* <div className="profile">
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
                            </div> */}
                            <div className="selectedHeader">
                                <p className={'tabHead'+(historyTab === 'attendance' ? ' active' : '')} onClick={() => setHistoryTab('attendance')}>Attendance History</p>
                                <p className={'tabHead'+(historyTab === 'location' ? ' active' : '')} onClick={() => setHistoryTab('location')}>Location History</p>
                                {(historyTab === 'location') && (
                                    <>
                                        <div className="datePicker">
                                            {(polylineCoords.length > 0) && (!downloading && <Icon icon="mingcute:download-line" width={24} onClick={downloadFile} /> || <Icon icon="svg-spinners:180-ring" width={24} />) || null}
                                            <Icon icon="mingcute:calendar-line" width={24} onClick={() => document.getElementById('locationDatePicker').showPicker()} />
                                            <Icon icon="mingcute:refresh-3-line" width={24} onClick={() => handleRefetchCoords(selectedUser?._id, dateChosen)} />
                                        </div>
                                        <p className="date">{getFormattedDate(dateChosen)}</p>
                                        <input className='dateInput' type="date" id='locationDatePicker' max={getToday()} value={dateChosen} onChange={(e) => {e.target.value === "" ? setDateChosen(getToday()) : setDateChosen(e.target.value); handleRefetchLocationHistory(selectedUser?._id, e.target.value); }} />
                                    </>
                                )}
                            </div>
                            {historyTab === 'attendance' && (
                                <div className="attendanceList">
                                    {
                                        selectedUserAttendanceHistory?.data.map((attendance, index) => (
                                            <div className="attendanceDayGroup" key={index}>
                                                <p className="attendanceDate">
                                                    {format(new Date(attendance?.time_in), "dd MMM yyyy")}
                                                </p>
                                                {attendance?.time_in && 
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
                                                        <p className="time_">{format(new Date(attendance?.time_in), "h:mm a")}</p>
                                                        </div>
                                                        
                                                    </li>
                                                </div>}

                                                {
                                                    attendance?.user?.equipments?.map((equipment, index) => (
                                                        <div className="attendanceItem">
                                                            <li className='profileAttendance equipment'>
                                                                <img className='profileAttendance'
                                                                src={equipment.type === 'WALKIE_TALKIE' ? Mobile : equipment.type === 'BAG' ? Bag : Uniform}
                                                                alt=""
                                                                />
                                                                <div className="profileInformation">
                                                                <p className="sign_">
                                                                    {equipment.code}
                                                                </p>
                                                                <p className="time_">{equipment.check_out ? `Returned at ${format(new Date(equipment.check_out), "h:mm a")}` : 'Item Not Returned the Same Day'}</p>
                                                                </div>
                                                                
                                                            </li>
                                                        </div>
                                                    ))
                                                }

                                                {attendance?.time_out && 
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
                                                        <p className="time_">{format(new Date(attendance?.time_out), "h:mm a")}</p>
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
                                    <MapContainer center={coords} zoom={zoom.level} scrollWheelZoom={true}>
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        {selectedUserLocationHistory?.map((location, index) => (
                                            <Marker key={index} position={[location?.location?.coordinates[1], location?.location?.coordinates[0]]} icon={(index === 0 ? mapMarkerStart : index === selectedUserLocationHistory.length - 1 ? mapMarkerEnd : mapMarkerMid)}>
                                                <Popup>
                                                    <div className="locationPopup">
                                                        <h2 className="locationName">{location?.address || 'No Name'}</h2>
                                                        <h3 className="locationTime">{new Date(location?.createdAt).toLocaleString()}</h3>
                                                    </div>
                                                </Popup>
                                            </Marker>
                                        ))}
                                        <Polyline pathOptions={{ color: '#007AFF', weight: 5, opacity: 0.2 }} positions={polylineCoords ? polylineCoords : []} />
                                        <MapMover center={coords} zoom={zoom} />
                                    </MapContainer>
                                </div>
                            )}
                            <div className={"tinyLoader " + (tinyLoaderVisible ? "visible" : "") + (softReload ? " softReload" : "")}>
                                <Icon icon="eos-icons:bubble-loading" width={100} color="var(--accent)" />
                                {/* <br />
                                <br />
                                <p>Loading...</p> */}
                            </div>
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