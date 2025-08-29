import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { MapContainer, TileLayer, useMap, Marker, Popup, Polyline } from 'react-leaflet'
import { format } from 'date-fns'
import L from 'leaflet';

import { getAllUsers, batchRegisterUsers, getUserLocationHistory, getUserAttendanceHistory, exportLocation } from '../../api.js';
import { getToday, getFormattedDate } from '../../components/functions/DateTime.js';
import { arrayHasDuplicates } from '../../components/functions/ObjectsArrays.js';

import ListItemAvatar from '../../components/ListItemAvatar.jsx';
import MapMover from '../../components/MapMover.jsx';

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


const StaffManagement = () => {
    const [loaded, setLoad] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [tinyLoaderVisible, setTinyLoaderVisible] = useState(false);
    const [softReload, setSoftReload] = useState(false);
    const [allUsers, setAllUsers] = useState(null)
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedUserLocationHistory, setSelectedUserLocationHistory] = useState(null);
    const [selectedUserAttendanceHistory, setSelectedUserAttendanceHistory] = useState(null);
    const [hasDuplicates, setHasDuplicates] = useState(false);
    const [triggerUpdate, setTriggerUpdate] = useState(0);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState([{ username: '', password: '' }]);
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


    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoad(false);
                const response = await getAllUsers();
                setAllUsers(response.data)
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoad(true);
            }
        };
        fetchUsers();
    }, [triggerUpdate]);

    
    const handleRegister = async (e) => {
            e.preventDefault();
            // setLoading(true);
    
            try {
                const credentials = JSON.stringify(formData);
                const response = await batchRegisterUsers(formData);
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
            (response.data.length > 0) && setCoords([response.data[0]?.location?.coordinates[1], response.data[0]?.location?.coordinates[0]]);
            setZoom({level: 13, animated: true});

            coordinates = response.data.map(item => {
                const [lng, lat] = item.location.coordinates;
                return [lat, lng];
            });
            handleShowPolyline(coordinates);
            
            const attendanceResponse = await getUserAttendanceHistory({ user: userId });
            setSelectedUserAttendanceHistory(attendanceResponse.data);
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
        setHasDuplicates(arrayHasDuplicates(formData));
    }, [formData]);

    const isDuplicateUsername = (username, index) => {
        return username.trim() !== "" && 
                formData.some((user, i) => i !== index && user.username === username);
    };

    const mapMarkerStart = L.icon({
        iconUrl: MapStart,
        iconSize: [48, 48], 
        iconAnchor: [24, 48], 
        popupAnchor: [0, -48] 
    });
    const mapMarkerMid = L.icon({
        iconUrl: MapPoint,
        iconSize: [32, 32],
        iconAnchor: [16, 16], 
        popupAnchor: [0, -32] 
    });
    const mapMarkerEnd = L.icon({
        iconUrl: MapEnd,
        iconSize: [48, 48], 
        iconAnchor: [24, 48], 
        popupAnchor: [0, -48] 
    });

    
    const [coords, setCoords] = useState([15.2183658, 120.6601309]);
    const [zoom, setZoom] = useState({level:13,animated:true});

    const [polylineCoords, setPolylineCoords] = useState([]);

    const handleShowPolyline = (route) => {
        setPolylineCoords(route);
    };
    
    const [historyTab, setHistoryTab] = useState('attendance')


    const downloadFile = async () => {
        try {
            setDownloading(true);
            const response = await exportLocation({ user: selectedUser._id, date: dateChosen });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;

            link.setAttribute("download", `CSP-LocationHistory_${dateChosen}.xlsx`);
            document.body.appendChild(link);
            link.click();

            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading file:", error);
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className={"dash_page staffManagement" + (loaded ? " show" : "")}>
            <div className="header">
                <div className="textGroup">
                    <h2>Staff Management</h2>
                    <p className="subtitle">Add staff members, view staff attendance and location history.</p>
                </div>
                
                <button className='withIcon' onClick={() => { setShowForm(true); setFormData([{ username: '', password: '' }]);}}><Icon icon='mingcute:user-add-2-line' width={20} /> Add Staff</button>
            </div>
            
            <div className="contentContainer">
                <div className="staffListContainer">
                    <ul>
                        {allUsers?.data?.filter(user => user.profile?.first_name || user.profile?.last_name).map(user => (
                            <ListItemAvatar
                                id={user._id}
                                className={(selectedUser?._id === user._id ? "selected" : "")+(tinyLoaderVisible ? " lock" : "")}
                                avatar={user.profile?.display_picture}
                                largeText={`${user.profile?.first_name} ${user.profile?.last_name}`}
                                smallText={user.username}
                                onClick={() => {
                                    setSelectedUser(user);
                                    handleFetchLocationHistory(user._id);
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
                                className={'unavailable'}
                                avatar={user.profile?.display_picture}
                                largeText={user.username}
                                smallText={'No Profile'}
                            />
                        ))}
                    </ul>
                </div>
                <div className="selectedUserContainer">
                    {!selectedUser && <p>Select a user.</p>}
                    <br />
                    {
                        selectedUser &&
                        <div className="userDetails">
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
                                                                <p className="time_">{equipment.check_out ? `Returned at ${format(new Date(equipment.check_out), "h:mm a")}` : 'Not Returned'}</p>
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
                            </div>
                        </div>
                    }
                    
                </div>
            </div>




































            <div className={"overlay "+ (showForm ? "visible" : "")} onClick={() => setShowForm(false)}>
                <div className="addUserModal" onClick={(e) => e.stopPropagation()}>
                    <div className="header">
                        <h2>Add Staff</h2>
                        <button className="" onClick={() => addUserField()}>
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