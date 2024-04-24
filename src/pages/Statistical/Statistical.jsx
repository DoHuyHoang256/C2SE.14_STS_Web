import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import 'tailwindcss/tailwind.css';
import Sidebar from "../../components/Siderbar/Siderbar";
import { registerLocale } from 'react-datepicker';
import vn from 'date-fns/locale/vi';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDatabase,faTrashCan,faPlus } from "@fortawesome/free-solid-svg-icons";
import axios from 'axios';
import { format } from 'date-fns';

// Đăng ký ngôn ngữ
registerLocale('vi', vn);

const StatisticsPage = () => {
    const [data, setData] = useState([]);
    const chartRef = useRef(null);
    const [selectedBases, setSelectedBases] = useState([]);
    const [startDate, setStartDate] = useState(null); // Ensure startDate is initialized as a Date object
    const [endDate, setEndDate] = useState(null);
    const [numberOfDays, setNumberOfDays] = useState(0); // Thêm state để lưu trữ số ngày giữa startDate và endDate
    const [showAddBaseModal, setShowAddBaseModal] = useState(false);
    const [newBaseName, setNewBaseName] = useState('');
    const [locations, setLocations] = useState([]);
    const [selectedLocations, setSelectedLocations] = useState([]);

    
    const formatDate = (isoDate) => {
        const date = new Date(isoDate);
        return format(date, 'dd-MM-yyyy');
    };

    const fetchDataFromApi = async () => {
        try {
            const response = await axios.get('https://c2se-14-sts-api.onrender.com/api/transactions/count', {
                params: {
                    startDate: startDate,
                    endDate: endDate,
                    location: selectedLocations.join(',')
                }
            });
            const formattedData = response.data.map(item => ({
                name: item.location_name,
                label: formatDate(item.transaction_date),
                value: { [item.location_name]: parseInt(item.total_transactions) },
            }));            
            setData(formattedData);
            console.log(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };


    useEffect(() => {
        fetchDataFromApi()
        fetchData();
    }, [startDate, endDate, selectedLocations]);

    useEffect(() => {
        updateChart();
    }, [selectedBases, startDate, endDate]);

    const fetchData = async () => {
        try {
            const response = await axios.get('https://c2se-14-sts-api.onrender.com/api/locations');
            setLocations(response.data);
            console.log('Locations:', response.data);
        } catch (error) {
            console.error('Error fetching locations:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);
    
    useEffect(() => {
    console.log('Locations:', locations);
}, [locations]);

    const colors = [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)',
        'rgba(255, 0, 0, 0.2)',
        'rgba(0, 255, 0, 0.2)',
        'rgba(0, 0, 255, 0.2)',
        'rgba(128, 0, 128, 0.2)'
    ];

    
    const updateChart = () => {
        const ctx = document.getElementById('myChart');
    
        // Destroy the previous chart instance if it exists
        if (chartRef.current) {
            chartRef.current.destroy();
        }
    
        const filteredData = data.filter(item => {
            const currentDate = new Date(item.label.replace(/-/g, '/'));
            const startDateWithoutTime = startDate ? new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()) : null;
            const endDateWithoutTime = endDate ? new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()) : null;
            return (!startDate || currentDate >= startDateWithoutTime) && (!endDate || currentDate <= endDateWithoutTime);
        });
    
        const allDates = [];
        if (startDate && endDate) {
            const currentDate = new Date(startDate);
            while (currentDate <= endDate) {
                allDates.push(currentDate.toISOString().slice(5, 7) + "-" + currentDate.toISOString().slice(8, 10) + "-" + currentDate.getFullYear()); // Format ngày thành 'MM-DD-YYYY'
                currentDate.setDate(currentDate.getDate() + 1);
            }
        }
    
        const labels = allDates;
    
        chartRef.current = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: selectedBases.map((base, index) => ({
                    label: base,
                    data: labels.map(date => {
                        const foundData = filteredData.find(item => item.label === date);
                        return foundData ? foundData.value[base] : 0; // Trả về giá trị của cơ sở tại ngày hiện tại hoặc 0 nếu không tìm thấy
                    }),
                    backgroundColor: colors[index % colors.length],
                    borderColor: colors[index % colors.length].replace('0.2', '2'),
                    borderWidth: 1,
                })),
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
                barPercentage: 0.5,
                categorySpacing: 8,
            },
        });
    
        if (startDate && endDate) {
            const diffInTime = endDate.getTime() - startDate.getTime();
            const diffInDays = diffInTime / (1000 * 3600 * 24);
            setNumberOfDays(diffInDays);
        } else {
            setNumberOfDays(0);
        }
    };
    
    const handleBaseChange = (event, baseId) => {
        const selectedBaseName = locations.find(location => location.location_id === baseId)?.location_name;
        const isChecked = event.target.checked;
        if (isChecked) {
            setSelectedLocations(prevSelectedLocations => [...prevSelectedLocations, baseId]);
        } else {
            setSelectedLocations(prevSelectedLocations => prevSelectedLocations.filter(id => id !== baseId));
        }
        setSelectedBases(prevSelectedBases => {
            if (isChecked) {
                // Nếu được kiểm tra, thêm tên địa điểm vào mảng nếu chưa tồn tại
                return prevSelectedBases.includes(selectedBaseName)
                    ? prevSelectedBases
                    : [...prevSelectedBases, selectedBaseName];
            } else {
                // Nếu không được kiểm tra, loại bỏ tên địa điểm khỏi mảng
                return prevSelectedBases.filter(base => base !== selectedBaseName);
            }
        });
    
    };
    
    const handleDeleteSelectedLocations = async () => {
        // Gửi yêu cầu DELETE để xóa các địa điểm đã chọn
        try {
            const response = await axios.delete('https://c2se-14-sts-api.onrender.com/api/locations', {
                data: {
                    selectedLocations: selectedLocations
                }
            });
            console.log(response.data);
            // Xóa các địa điểm đã chọn khỏi danh sách hiển thị và cập nhật biểu đồ
            fetchData();
            setSelectedBases([]);
            setSelectedLocations([]);
        } catch (error) {
            console.error('Error deleting selected locations:', error);
        }
    };

    

    const handleStartDateChange = (event) => {
        const date = new Date(event.target.value);
        setStartDate(date);
        
        updateChart();
    };

    const handleEndDateChange = (event) => {
        const date = new Date(event.target.value);
        setEndDate(date);
        
        updateChart();
    };

    const handleAddBase = () => {
        setShowAddBaseModal(true);
    };

    const updateChartData = (newData) => {
        setData(prevData => [...prevData, newData]); // Thêm dữ liệu mới vào data
        updateChart(); // Cập nhật biểu đồ
    };
    

    const handleAddNewBase = async () => {
        if (newBaseName.trim() !== '') {
            try {
                // Gửi yêu cầu POST để thêm địa điểm mới
                const response = await axios.post('https://c2se-14-sts-api.onrender.com/api/locations', {
                    location_name: newBaseName.trim()
                });
                console.log('New location added:', response.data);
                
                // Cập nhật danh sách địa điểm và các cơ sở đã chọn
                fetchData(); // Cập nhật danh sách địa điểm
                setSelectedBases(prevSelectedBases => [...prevSelectedBases, newBaseName.trim()]); // Thêm cơ sở mới vào danh sách đã chọn
                
                // Đặt lại trạng thái của modal và tên cơ sở mới
                setShowAddBaseModal(false);
                setNewBaseName('');
            } catch (error) {
                console.error('Error adding new location:', error);
            }
        }
    };
    

    const handleCancelAddBase = () => {
        setShowAddBaseModal(false);
        setNewBaseName('');
    };

    return (
        <div className="grid grid-cols-12 gap-10">
            {/* Sidebar */}
            <div className="col-span-3">
                <div className="border border-white h-screen flex flex-col justify-between">
                    <Sidebar />
                </div>
            </div>
            {/* Main Content */}
            <div className="text-center bg-white w-[1000px] col-span-9 px-4">
                <h3 className="py-2 mb-8 w-full text-center bg-[#F3F7FA]">Rất vui được gặp bạn, Hien 👋</h3>
                <div className="mt-2 flex font-bold bg-[#F5F5F5] p-3 rounded-xl justify-between">
                <div className="flex h-[90px] text-xl px-2 items-center justify-center">
                {locations.map((location) => (
                    <div key={location.location_id} className="flex items-center mr-3 bg-[#FFFFF] rounded-md mx-2 mb-6">
                        <input
                            className="h-5 w-5 mr-2"
                            type="checkbox"
                            id={`base-${location.location_id}`}
                            value={location.location_id}
                            onChange={(event) => handleBaseChange(event, location.location_id)}
                            checked={selectedBases.includes(location.location_name)} // Thay đổi từ location_id sang location_name
                        />
                        <label htmlFor={`base-${location.location_id}`} className="text-sm">
                            {location.location_name}
                        </label>
                    </div>
                ))}
                </div>
                <div className="flex">
                    <div className="mr-2 bg-[#212143] w-[40px] rounded-e mb-2 text-center flex items-center justify-center">
                        <button className="text-xl font-bold text-white" onClick={handleAddBase}><FontAwesomeIcon icon={faPlus} /></button>
                    </div>
                    <div className="bg-[#212143] w-[40px] rounded-e mr-2 mb-2 text-center flex items-center justify-center">
                        {/* <button className="text-xl text-white font-bold text-center"  onClick={handleBaseChange}><FontAwesomeIcon className="text-xl mx-2 text-white" icon={faTrashCan} /></button> */}
                        <button className="text-xl text-white font-bold text-center" onClick={handleDeleteSelectedLocations}>
                            <FontAwesomeIcon className="text-xl mx-2 text-white" icon={faTrashCan} />
                        </button>
                    </div>
                </div>
                </div>
                <div className="mt-8 flex justify-center">
                    <div className="flex items-center mr-4">
                        <label htmlFor="startDate" className="mr-2 font-bold">Ngày bắt đầu:</label>
                        <input type="date" id="startDate" onChange={handleStartDateChange} value={startDate ? startDate.toISOString().split('T')[0] : ''} />
                    </div>
                    <div className="flex items-center mx-44">
                        <label htmlFor="endDate" className="mr-2 font-bold">Ngày kết thúc:</label>
                        <input  type="date" id="endDate" onChange={handleEndDateChange} value={endDate ? endDate.toISOString().split('T')[0] : ''} />
                    </div>
                    <div className="text-center text-xl">
                        <p><FontAwesomeIcon  icon={faDatabase} /> : {selectedBases.length}</p>
                    </div>

                </div>


                {/* Chart */}
                <div className="w-[850px] mt-8">
                    <canvas id="myChart" width="800" height="400"></canvas>
                </div>
                {/* Add Base Modal */}
                {showAddBaseModal && (
                    <div className="fixed z-10 inset-0 overflow-y-auto flex justify-center items-center bg-gray-500 bg-opacity-50">
                        <div className="bg-white p-6 rounded-md">
                            <h2 className="text-xl font-bold mb-4">Thêm cơ sở mới</h2>
                            <input type="text" className="border border-gray-300 rounded px-4 py-2 mb-4 w-full" placeholder="Nhập tên cơ sở mới..." value={newBaseName} onChange={(e) => setNewBaseName(e.target.value)} />
                            <div className="flex justify-end">
                                <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 mr-2 rounded-md" onClick={handleCancelAddBase}>Hủy</button>
                                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md" onClick={handleAddNewBase}>Thêm</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatisticsPage;
