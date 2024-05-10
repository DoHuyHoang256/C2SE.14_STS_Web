import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import 'tailwindcss/tailwind.css';
import Sidebar from "../../components/Siderbar/Siderbar";
import { registerLocale } from 'react-datepicker';
import vn from 'date-fns/locale/vi';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDatabase,faTrashCan,faPlus,faFileExport} from "@fortawesome/free-solid-svg-icons";
import axios from 'axios';
import { format, addDays, subDays } from 'date-fns'; // Thêm addDays từ date-fns
import * as XLSX from 'xlsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


registerLocale('vi', vn);

const StatisticsPage = () => {
    const [data, setData] = useState([]);
    const chartRef = useRef(null);
    const [selectedBases, setSelectedBases] = useState([]);
    const [startDate, setStartDate] = useState(subDays(new Date(), 5)); // Set default start date to 5 days ago
    const [endDate, setEndDate] = useState(new Date()); // Set default end date to today
    const [numberOfDays, setNumberOfDays] = useState(5); // Set default number of days to 5
    const [locations, setLocations] = useState([]);


    const formatDate = (isoDate) => {
        const date = new Date(isoDate);
        return format(date, 'dd-MM-yyyy');
    };

    useEffect(() => {
        fetchDataFromApi();
        fetchData();
    }, [startDate, endDate, selectedBases]);

    useEffect(() => {
        updateChart();
    }, [selectedBases, startDate, endDate]);

    const fetchDataFromApi = async () => {
        try {
            const response = await axios.get('https://c2se-14-sts-api.onrender.com/api/transactions/count', {
                params: {
                    startDate: startDate,
                    endDate: endDate,
                }
            });
            const formattedData = {};
            response.data.forEach(item => {
                const date = formatDate(item.transaction_date);
                if (!formattedData[date]) {
                    formattedData[date] = {};
                }
                formattedData[date][item.location_name] = parseInt(item.total_transactions);
                
            });
            setData(formattedData);

            console.log('Data from API:', formattedData);
            // In dữ liệu nhận được từ API lên console
           
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Đã xảy ra lỗi khi tải dữ liệu.');
        }
    };
    
    


    useEffect(() => {
        fetchDataFromApi()
        fetchData();
    }, [startDate, endDate, selectedBases]);

    useEffect(() => {
        updateChart();
    }, [selectedBases, startDate, endDate]);

    const fetchData = async () => {
        try {
            const response = await axios.get('https://c2se-14-sts-api.onrender.com/api/locations');
            setLocations(response.data);
            // console.log('Locations:', response.data);
        } catch (error) {
            console.error('Error fetching locations:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        // console.log('Locations:', locations);
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
        console.log('Updating chart...');
        const ctx = document.getElementById('myChart');
    
        if (!startDate || !endDate) {
            console.error("Ngày bắt đầu hoặc ngày kết thúc không được để trống.");
            return;
        }
    
        if (chartRef.current) {
            chartRef.current.destroy();
        }
    
        const allDates = [];
        const datasets = [];
    
        // Tạo mảng tất cả các ngày từ startDate đến endDate
        let currentDate = new Date(startDate);
        const endDateObj = new Date(endDate);
        while (currentDate <= endDateObj) {
            const dateString = formatDate(currentDate);
            allDates.push(dateString);
            currentDate.setDate(currentDate.getDate() + 1);
        }
    
        // Tạo dataset cho từng địa điểm được chọn
        selectedBases.forEach((base, index) => {
            const dataForBase = allDates.map(date => data[date]?.[base] || 0);
            console.log(`Data for ${base}:`, dataForBase);
            const dataset = {
                label: base,
                data: dataForBase,
                backgroundColor: colors[index % colors.length],
                borderColor: colors[index % colors.length].replace('0.2', '2'),
                borderWidth: 1,
            };
            datasets.push(dataset);
        });
    
        console.log('Datasets:', datasets);
    
        chartRef.current = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: allDates, // Trục x là danh sách tất cả các ngày
                datasets: datasets, // Mỗi dataset tương ứng với một địa điểm được chọn
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
    
        const diffInTime = endDateObj.getTime() - startDate.getTime();
        const diffInDays = diffInTime / (1000 * 3600 * 24);
        setNumberOfDays(diffInDays);
    };
    

    


    const handleBaseChange = (event, baseId) => {
        console.log('Handling base change...');
        const selectedBase = locations.find(location => location.location_id === baseId);
        if (!selectedBase) {
            console.error('Không tìm thấy địa điểm với ID đã chọn.');
            return;
        }
        
        const isChecked = event.target.checked;
        if (isChecked) {
            setSelectedBases(prevSelectedBases => [...prevSelectedBases, selectedBase.location_name]);
        } else {
            setSelectedBases(prevSelectedBases => prevSelectedBases.filter(base => base !== selectedBase.location_name));
        }
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
    

    const handleExport = () => {
     if (selectedBases.length === 0 || !startDate || !endDate) {
        // Hiển thị thông báo lỗi và yêu cầu chọn dữ liệu trước
        toast.error('Vui lòng chọn ít nhất một cơ sở và khoảng thời gian trước khi xuất file.');
        return;
    }

    const allDates = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        const dateString = currentDate.toISOString().slice(0, 10); // Lấy ngày dưới dạng YYYY-MM-DD
        allDates.push(dateString);
        currentDate.setDate(currentDate.getDate() + 1);
    }

    const workbook = XLSX.utils.book_new();

    selectedBases.forEach(base => {
        const worksheetData = [];

        const headers = ['Ngày', base];
        worksheetData.push(headers);
        allDates.forEach(date => {
            const rowData = [];
            rowData.push(date); // Ngày
            const dataIndex = data[date] || {};
            rowData.push(dataIndex[base] || 0); // Sử dụng dữ liệu từ biểu đồ
            worksheetData.push(rowData);
        });
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        XLSX.utils.book_append_sheet(workbook, worksheet, base);
    });

    // Hiển thị dữ liệu nhận được lên console
    const workbookData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 });
    console.log('Data received in the workbook:', workbookData);

    XLSX.writeFile(workbook, 'statistics.xlsx');
};


    return (
        <div className="grid grid-cols-12 gap-10">
            {/* Sidebar */}
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
                <div className="flex items-start">
                    <label htmlFor="startDate" className="mr-2 font-bold">Ngày bắt đầu:</label>
                    <input
                        type="date"
                        id="startDate"
                        onChange={handleStartDateChange}
                        value={startDate ? startDate.toISOString().split('T')[0] : ''}
                        max={endDate ? endDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} // Giới hạn ngày bắt đầu là ngày kết thúc hoặc ngày hiện tại nếu chưa chọn ngày kết thúc
                    />
                </div>
                    <div className="flex items-center mx-36">
                        <label htmlFor="endDate" className="mr-2 font-bold">Ngày kết thúc:</label>
                        {/* Hiển thị input ngày kết thúc chỉ khi ngày bắt đầu đã được chọn */}
                        {startDate && (
                            <input
                                type="date"
                                id="endDate"
                                onChange={handleEndDateChange}
                                value={endDate ? endDate.toISOString().split('T')[0] : ''}
                                max={new Date().toISOString().split('T')[0]} // Giới hạn ngày kết thúc là ngày hiện tại
                            />
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
            </div>
        </div>
    );
};

export default StatisticsPage;
