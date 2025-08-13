import { useState, useEffect, use } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { getAllUsers, batchRegisterUsers, batchAddEquipments, getAllEquipment } from '../../api.js';
import './Equipment.css';

import Mobile from '../../assets/mobile-blue.svg'
import Bag from '../../assets/bag-pink.svg'
import Uniform from '../../assets/uniform-orange.svg'
import CheckBlue from '../../assets/check-blue.svg'

const Equipment = () => {
    const [allUsers, setAllUsers] = useState(null)
    const [selectedUser, setSelectedUser] = useState(null);
    
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState([
        {
            code: '',
            type: 'WALKIE_TALKIE',
            size: undefined
        }
    ]);
    const [prohibited, setProhibited] = useState(false);
    const [hasDuplicates, setHasDuplicates] = useState(false);
    const [triggerUpdate, setTriggerUpdate] = useState(0);

    const addUserField = () => {
        setFormData(prevFormData => [
            ...prevFormData,
            { code: '', type: 'WALKIE_TALKIE', size: undefined }
        ]);
    };
    const removeUserField = (index) => {
        setFormData(prevFormData => prevFormData.filter((_, i) => i !== index));
    };

    const handleChange = (e, index) => {
        const { name, value } = e.target;

        setFormData((prevData) => {
            const updatedData = [...prevData]; // copy array
            let updatedUser = {
                ...updatedData[index],
                [name]: value
            };

            // If type changes and is not UNIFORM, reset size to undefined
            if (name === "type" && value !== "UNIFORM") {
                updatedUser.size = undefined;
            } 
            
            if (name === "type" && value === "UNIFORM") {
                if (name === "size" && (value == undefined || value == "")) {
                    setProhibited(true);
                }
                else {
                    setProhibited(false);
                }
            }
            // console.log(value)
            

            updatedData[index] = updatedUser;
            // console.log(prohibited)
            return updatedData;
        });
    };

    function hasDuplicateUsernames(arr) {
        const seen = new Set();
        for (const user of arr) {
            const name = user.code.trim();
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
                const response = await getAllEquipment();
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

    useEffect(() => {
        console.log("Form data updated:", formData);
    }, [formData]);


    const handleRegister = async (e) => {
        e.preventDefault();
        // setLoading(true);

        try {
            const credentials = JSON.stringify(formData);
            const response = await batchAddEquipments(formData);

            // const profileResponse = await getProfile();
            // console.log(profileResponse.data);
            console.log(response.data);
            
        } catch (error) {
            // setLoading(false);
            console.error("Batch registration failed:", error);

        } finally {
            setTriggerUpdate(prev => prev + 1);
            setShowForm(false);
            setFormData([{ code: '', type: 'WALKIE_TALKIE', size: undefined }]);
            setHasDuplicates(false);
            // setLoading(false);
        }
        

    };

    const anyInputExist = formData.some(formItem =>
        allUsers?.data?.some(user => user.code === formItem.code)
    );

    

    useEffect(() => {
        setHasDuplicates(hasDuplicateUsernames(formData));
        
    }, [formData]);

    const isDuplicateUsername = (username, index) => {
        return username.trim() !== "" && 
                formData.some((user, i) => i !== index && user.code === username);
    };

    const [historyTab, setHistoryTab] = useState('attendance')
    return (
        <div className="dash_page staffManagement">
            <div className="header">
                <h2>Equipment List <span className='textAccent'>{allUsers?.meta?.total}</span></h2>
                <button onClick={() => { setShowForm(true); setFormData([{ code: '', type: 'WALKIE_TALKIE', size: undefined }]);}}>Add Equipment</button>
            </div>
            
            <div className="contentContainer">
                <div className="staffListContainer">
                    {/* <a href={link} target="_blank" rel="noopener noreferrer">Open QR Code</a> */}
                    <ul>
                        {allUsers?.data?.map(user => (
                            <li key={user._id} onClick={() => {
                                setSelectedUser(user);
                                handleFetchLocationHistory(user._id);

                            }}>
                                <img
                                src={(user.type === 'UNIFORM') ? Uniform : (user.type === 'WALKIE_TALKIE') ? Mobile : (user.type === 'BAG') ? Bag : CheckBlue}
                                alt=""
                                />
                                <div className="profileInformation">
                                <p className="fullName">
                                    {(user.type === 'UNIFORM') ? 'Uniform ' : (user.type === 'WALKIE_TALKIE') ? 'Walkie Talkie' : (user.type === 'BAG') ? 'Bag' : user.type} 
                                    {(user.size === 'SMALL') ? '(Small)' : (user.size === 'MEDIUM') ? '(Medium)' : (user.size === 'LARGE') ? '(Large)' : (user.size === 'EXTRA_LARGE') ? '(XL)' : (!user.size ? '' : '(' + user.size + ')')}
                                </p>
                                <p className="username">CODE: {user.code}</p>
                                </div>
                                
                            </li>
                        ))}
                    </ul>
                </div>
                {/* <div className="selectedUserContainer">
                    
                    {!selectedUser && <p>Select an equipment.</p>}
                    <br />
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
                            
                            
                        </div>
                    }
                    
                </div> */}
                <div className="selectedUserContainer">
                    {!selectedUser && <p>Select an equipment.</p>}
                    <br />
                    {
                        selectedUser && (
                            <>
                                <img src={`https://quickchart.io/qr?text=${selectedUser.code}&dark=282828&ecLevel=L&size=200&format=svg`} alt="" />
                                <p className="fullName">
                                {(selectedUser?.type === 'UNIFORM') ? 'Uniform ' : (selectedUser?.type === 'WALKIE_TALKIE') ? 'Walkie Talkie' : (selectedUser?.type === 'BAG') ? 'Bag' : selectedUser?.type} {(selectedUser?.size === 'SMALL') ? '(Small)' : (selectedUser?.size === 'MEDIUM') ? '(Medium)' : (selectedUser?.size === 'LARGE') ? '(Large)' : (selectedUser?.size === 'EXTRA_LARGE') ? '(XL)' : (!selectedUser.size ? '' : '(' + selectedUser.size + ')')}
                                </p>
                                <p className="username">CODE: {selectedUser?.code}</p>
                            </>
                        )
                    }
                </div>
            </div>




































            <div className={"overlay "+ (showForm ? "visible" : "")} onClick={() => setShowForm(false)}>
                <div className="addUserModal" onClick={(e) => e.stopPropagation()}>
                    <div className="header">
                        <h2>Register Equipment</h2>
                        <button className="close" onClick={() => addUserField()}>
                            Add Field
                        </button>
                    </div>
                    
                    <form action="" className="addUsersForm" onSubmit={handleRegister}>
                        <div className="allInputContainer">

                        
                        {
                            formData.map((user, index) => {
                                const duplicate = isDuplicateUsername(user.code, index);

                                return (
                                    <div className="userInputContainer" key={index}>
                                        <div className="bar">
                                            <div className="line"></div>
                                        </div>
                                        <div className="userInputGroup">
                                            <div className={"upperInput"}>
                                                <div className="selectContainer">
                                                <select defaultValue={'WALKIE_TALKIE'} value={user.type} name="type" id="" onChange={(e) => {handleChange(e, index); user.type !== 'UNIFORM' && (user.size = undefined);}}>
                                                        <option value="WALKIE_TALKIE">Walkie Talkie</option>
                                                        <option value="UNIFORM">Uniform</option>
                                                        <option value="BAG">Bag</option>
                                                    </select>
                                                </div>
                                                { (formData.length > 1) && (
                                                    <button type="button" className="removeField" onClick={() => removeUserField(index)}>
                                                        <Icon icon="mingcute:minus-circle-line" width={24} />
                                                    </button>
                                                )}
                                            </div>

                                            {
                                                (user.type === 'UNIFORM') && (
                                                    <div className="selectContainer">
                                                        <input className='hide' type="text" required value={user.size} autoComplete='off' />
                                                        <select defaultValue={""} value={user.size} name="size" id="" onChange={(e) => handleChange(e, index)}>
                                                            <option value="" disabled>Select Size</option>
                                                            <option value="SMALL">Small</option>
                                                            <option value="MEDIUM">Medium</option>
                                                            <option value="LARGE">Large</option>
                                                            <option value="EXTRA_LARGE">Extra Large</option>
                                                        </select>
                                                    </div>
                                                )
                                            }
                                            
                                            <input
                                                type="text"
                                                name="code"
                                                placeholder="Code"
                                                value={user.code}
                                                onChange={(e) => handleChange(e, index)}
                                                autoComplete='off'
                                                required
                                            />
                                            
                                            {duplicate && <p className="error">Duplicate code.</p>}
                                            {(allUsers?.data.some(item => item.code === user.code) && <p className="error">Code already exists in the system.</p>)}
                                        </div>
                                        
                                    </div>
                                )
                            })
                        }
                        </div>
                        <button type="submit" disabled={anyInputExist || hasDuplicates || prohibited}>Add Equipments</button>

                    </form>
                </div>
            </div>
        </div>
    )
}
export default Equipment;