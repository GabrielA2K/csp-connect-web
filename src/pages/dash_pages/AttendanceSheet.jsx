import { useState, useEffect } from 'react';
import { format } from 'date-fns'
import { Icon } from '@iconify/react/dist/iconify.js';
import { getAllUsers, getAttendanceData, exportAttendance } from '../../api.js';
import './AttendanceSheet.css';
import { da } from 'date-fns/locale';

const AttendanceSheet = () => {
    const [loaded, setLoad] = useState(false);
    const [attendanceData, setAttendanceData] = useState(null);
    const [downloading, setDownloading] = useState(false);

    const [allUsers, setAllUsers] = useState(null)
    
    const getToday = () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const [dateChosen, setDateChosen] = useState(getToday());

    useEffect(() => {
        const fetchAttendanceData = async (date) => {
        try {
            setLoad(false);
            const response = await getAttendanceData(date);
            setAttendanceData(response.data);
            console.log(response.data.data);
            
        } catch (error) {
            console.error(error);

        } finally {
            setLoad(true);
        }
        };
        fetchAttendanceData(dateChosen);
    }, [dateChosen]);


    const downloadFile = async () => {
        try {
            setDownloading(true);
            const response = await exportAttendance(dateChosen);

            // Create a blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;

            // You can hardcode a filename OR extract from response headers
            link.setAttribute("download", `CSP-Attendance_${dateChosen}.xlsx`);
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
        if (attendanceData) {
            console.log('Attendance Data:', attendanceData);
        }
    }, [attendanceData]);

    return (
        <div className={"dash_page attendanceSheet" + (loaded ? " show" : "")}>
            <div className="header">
                <h2>Attendance Sheet <span className='textAccent'></span></h2>
                <div className="actionGroup">
                    <input type="date" name="" id="" value={dateChosen} onChange={(e) => setDateChosen(e.target.value)} max={getToday()} data-date-format="DD MMMM YYYY"/>
                    <button className={'download'+(attendanceData?.data.length === 0 ? ' inactive' : '')} onClick={attendanceData?.data.length === 0 ? null : downloadFile} disabled={attendanceData?.data.length === 0 || downloading} title={attendanceData?.data.length === 0 ? "No data to export" : "Export Attendance Sheet"}>
                        {downloading && (
                            <Icon icon="svg-spinners:180-ring" width={24} />
                        ) || (
                            <Icon icon="mingcute:file-download-line" width={24} />
                        )}
                        
                    </button>
                </div>
                
                {/* <button onClick={() => { setShowForm(true); setFormData([{ username: '', password: '' }]);}}>Add Staff</button> */}
            </div>
            {/* <h2>Attendance Sheet <span className='textAccent'></span></h2> */}
            <div className={"contentContainerAttendanceSheet" + (attendanceData?.data.length === 0 ? " noData" : "")}>
                <div className="attendanceSheetContainer">
                    <div className="tables">
                        <table>
                            <thead>
                                <tr>
                                    <th colSpan="6"><p>Attendance</p></th>
                                    <th colSpan="5"><p>Equipment</p></th>
                                </tr>
                                <tr>
                                    <th>Username</th>
                                    <th>First Name</th>
                                    <th>Last Name</th>
                                    <th>Check In</th>
                                    <th>Check Out</th>
                                    <th>Food Voucher</th>

                                    <th>Item Code</th>
                                    <th>Item Type</th>
                                    <th>Item Size</th>
                                    <th>Item Check In</th>
                                    <th>Item Check Out</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendanceData?.data?.map((data,index) => (
                                    <>
                                        <tr key={index}>
                                            <td rowSpan={data.user.equipments?.length+1 || 1}>{data.user.username}</td>
                                            <td rowSpan={data.user.equipments?.length+1 || 1}>{data.user.profile.first_name}</td>
                                            <td rowSpan={data.user.equipments?.length+1 || 1}>{data.user.profile.last_name}</td>
                                            <td rowSpan={data.user.equipments?.length+1 || 1}>{data.time_in && format(new Date(data.time_in), 'hh:mm a')}</td>
                                            <td rowSpan={data.user.equipments?.length+1 || 1}>{data.time_out && format(new Date(data.time_out), 'hh:mm a')}</td>
                                            <td rowSpan={data.user.equipments?.length+1 || 1}>{data.user.is_food_taken ? "Claimed" : "Unclaimed"}</td>

                                            
                                        </tr>

                                        {data.user.equipments?.map((item, index) => (
                                            <tr key={index} className='equipmentTableRow'>
                                                <td>{item.code}</td>
                                                <td>{(item.type === 'UNIFORM' ? 'Uniform' : (item.type === 'WALKIE_TALKIE' ? 'Walkie Talkie' : (item.type === "BAG" ? "Bag" : item.type)))}</td>
                                                <td>{(item.size === 'SMALL' ? 'S' : (item.size === 'MEDIUM' ? 'M' : (item.size === 'LARGE' ? 'L' : (item.size === 'EXTRA_LARGE' ? 'XL' : item.size))))}</td>
                                                <td>{item.check_in && format(new Date(item?.check_in), 'hh:mm a')}</td>
                                                <td>{item.check_out && format(new Date(item?.check_out), 'hh:mm a')}</td>
                                            </tr>
                                        ))}
                                        
                                    </>
                                    
                                ))}

                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default AttendanceSheet;