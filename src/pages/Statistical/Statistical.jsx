import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import 'tailwindcss/tailwind.css';
import Sidebar from "../../components/Siderbar/Siderbar";
import { registerLocale } from 'react-datepicker';
import vn from 'date-fns/locale/vi';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDatabase,faTrashCan,faPlus,faFileExport} from "@fortawesome/free-solid-svg-icons";
import axios from 'axios';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

registerLocale('vi', vn);

const StatisticsPage = () => {
    const [data, setData] = useState([]);
    const chartRef = useRef(null);
    const [selectedBases, setSelectedBases] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [numberOfDays, setNumberOfDays] = useState(0);
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
                    startDate: startDate ? formatDate(startDate) : null, // Chuyển ngày thành định dạng phù hợp
                    endDate: endDate ? formatDate(endDate) : null, // Chuyển ngày thành định dạng phù hợp
                    location: selectedLocations.join(',')
                }
            });
            const formattedData = response.data.map(item => ({
                name: item.location_name,
                label: formatDate(item.transaction_date),
                value: parseInt(item.total_transactions),
            }));
            setData(formattedData);
            console.log(formattedData); // Kiểm tra dữ liệu nhận được từ API
        } catch (error) {
            console.error('Error fetching data:', error);
            // Hiển thị thông báo toast khi có lỗi xảy ra
            toast.error('Đã xảy ra lỗi khi tải dữ liệu.');
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
        updateChart();
    }, [data])
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
                        console.log("data" +  foundData);
                        return foundData ? parseInt(foundData.value) || 0 : 0;
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
                return prevSelectedBases.includes(selectedBaseName)
                    ? prevSelectedBases
                    : [...prevSelectedBases, selectedBaseName];
            } else {
                return prevSelectedBases.filter(base => base !== selectedBaseName);
            }
        });

    };


    const handleStartDateChange = (event) => {
        const date = new Date(event.target.value);
        setStartDate(date);

        updateChart();
    };
    const handleEndDateChange = (event) => {
        const selectedEndDate = new Date(event.target.value);
        if (selectedEndDate < startDate) {
            console.error("Ngày kết thúc không thể nhỏ hơn ngày bắt đầu.");
            return;
        }
        setEndDate(selectedEndDate);
        updateChart();
    };


    const handleAddBase = () => {
        setShowAddBaseModal(true);
    };


    const handleCancelAddBase = () => {
        setShowAddBaseModal(false);
        setNewBaseName('');
    };
    const handleExport = () => {
        if (selectedBases.length === 0 || !startDate || !endDate) {
            toast.error('Vui lòng chọn ít nhất một cơ sở và khoảng thời gian trước khi xuất file.');
            return;
        }
        const workbook = XLSX.utils.book_new();
        const allDates = [];
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const dateString = currentDate.toISOString().slice(5, 7) + '-' + currentDate.toISOString().slice(8, 10) + '-' + currentDate.getFullYear();
            allDates.push(dateString);
            currentDate.setDate(currentDate.getDate() + 1);
        }

        selectedBases.forEach(base => {
            const worksheetData = [];

            const headers = ['Ngày', base];
            worksheetData.push(headers);
            allDates.forEach(date => {
                const rowData = [];
                rowData.push(date); // Ngày
                const foundData = data.find(item => item.label === date);
                rowData.push(foundData ? foundData.value[base] || 0 : 0);
                worksheetData.push(rowData);
            });
            const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
            XLSX.utils.book_append_sheet(workbook, worksheet, base);
        });

        XLSX.writeFile(workbook, 'statistics.xlsx');
    };

    return (
        <div className="grid grid-cols-12 gap-10">
            <div className="col-span-3">
                <div className="border border-white h-screen flex flex-col justify-between">
                    <Sidebar />
                </div>
            </div>
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

                </div>
                <div className="mt-8 flex ">
                    <div className="flex mt-4 items-start ">
                        <label htmlFor="startDate" className="mr-2 font-bold">Ngày bắt đầu:</label>
                        <input type="date" id="startDate" onChange={handleStartDateChange} value={startDate ? startDate.toISOString().split('T')[0] : ''} />
                    </div>
                    <div className="flex  items-center mx-36">
                        <label htmlFor="endDate" className="mr-2 font-bold">Ngày kết thúc:</label>
                        {startDate && (
                            <input  type="date" id="endDate" onChange={handleEndDateChange} value={endDate ? endDate.toISOString().split('T')[0] : ''} />
                        )}
                    </div>


                    <div className="flex items-end ml-4">
                        <button
                        onClick={handleExport}
                            className="flex items-center w-[150px] h-[50px] text-xl p-2 border rounded   hover:bg-blue-300"
                        >
                            <FontAwesomeIcon icon={faFileExport} className="mr-2" />
                            Xuất File
                            <ToastContainer />
                        </button>
                    </div>
                </div>
                {/* Chart */}
                <div className="mx-8 w-[780px] mt-8">
                    <canvas id="myChart" width="800" height="400"></canvas>
                </div>
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
