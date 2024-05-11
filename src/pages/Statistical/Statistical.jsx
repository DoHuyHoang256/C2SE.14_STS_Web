import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import 'tailwindcss/tailwind.css';
import Sidebar from "../../components/Siderbar/Siderbar";
import { registerLocale } from 'react-datepicker';
import vn from 'date-fns/locale/vi';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExport } from "@fortawesome/free-solid-svg-icons";
import axios from 'axios';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { subDays } from 'date-fns';


registerLocale('vi', vn);

const StatisticsPage = () => {
    const [data, setData] = useState([]);
    const chartRef = useRef(null);
    const [selectedBases, setSelectedBases] = useState([]);
    const [startDate, setStartDate] = useState(subDays(new Date(), 5)); // Set default start date to 5 days ago
    const [endDate, setEndDate] = useState(new Date()); // Set default end date to today
    const [numberOfDays, setNumberOfDays] = useState(5); // Set default number of days to 5
    const [locations, setLocations] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get('https://c2se-14-sts-api.onrender.com/api/locations');
            setLocations(response.data);
            setSelectedBases(response.data.map(location => location.location_name)); // Tự động chọn tất cả các cơ sở khi trang được tải
        } catch (error) {
            console.error('Error fetching locations:', error);
        }
    };

    useEffect(() => {
        fetchDataFromApi();
    }, [startDate, endDate, selectedBases]);

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
        updateChart();
    }, [selectedBases, startDate, endDate]);

    const formatDate = (isoDate) => {
        const date = new Date(isoDate);
        return format(date, 'dd-MM-yyyy');
    };
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FFA500', '#00FF00', '#FF0000', '#00FFFF', '#800080'];
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
    };
    const handleEndDateChange = (event) => {
        const selectedEndDate = new Date(event.target.value);
        if (selectedEndDate < startDate) {
            console.error("Ngày kết thúc không thể nhỏ hơn ngày bắt đầu.");
            return;
        }
        setEndDate(selectedEndDate);
    };

    const handleExport = async () => {
        if (selectedBases.length === 0 || !startDate || !endDate) {
            // Hiển thị thông báo lỗi nếu thiếu dữ liệu cần thiết
            toast.error('Vui lòng chọn ít nhất một cơ sở và khoảng thời gian trước khi xuất file.');
            return;
        }

        const workbook = XLSX.utils.book_new();

        // Lặp qua mỗi cơ sở được chọn
        for (const base of selectedBases) {
            try {
                // Gọi API để lấy dữ liệu cho cơ sở và ngày đã chọn
                const response = await axios.get('https://c2se-14-sts-api.onrender.com/api/checkincheckout', {
                    params: {
                        location_name: base,
                        startDate: startDate,
                        endDate: endDate,
                    }
                });

                const worksheetData = [];

                const headers = ["Ngày", "Họ tên", "Biển số", "Thời gian vào", "Thời gian ra"];
                worksheetData.push(headers);

                // Kiểm tra xem response có dữ liệu không
                if (response.data.length === 0) {
                    // Nếu không có dữ liệu, chỉ ghi ngày vào file Excel
                    const rowData = [formatDate(startDate), '', '', '', ''];
                    worksheetData.push(rowData);
                } else {
                    // Nếu có dữ liệu, ghi dữ liệu chi tiết vào file Excel và sắp xếp lại ngày
                    const sortedData = response.data.sort((a, b) => new Date(a.checkout_time) - new Date(b.checkout_time));

                    sortedData.forEach(item => {
                        const rowData = [];
                        const formattedDate = formatDate(item.checkout_time); // Format ngày

                        rowData.push(formattedDate); // Thời gian vào
                        rowData.push(item.full_name); // Họ tên
                        rowData.push(item.license_plate); // Biển số
                        rowData.push(formatTime(item.checkin_time)); // Thời gian vào
                        rowData.push(formatTime(item.checkout_time)); // Thời gian ra
                        worksheetData.push(rowData);
                    });
                }

                // Tạo một sheet từ dữ liệu và thêm vào workbook
                const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

                // Căn chỉnh chiều rộng của các cột
                worksheet['!cols'] = [{ width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }];

                // Thêm sheet vào workbook với tên là tên của cơ sở
                XLSX.utils.book_append_sheet(workbook, worksheet, base);
            } catch (error) {
                console.error('Error fetching data for base', base, ':', error);
                toast.error('Đã xảy ra lỗi khi tải dữ liệu.');
            }
        }

        // Xuất workbook ra file Excel
        XLSX.writeFile(workbook, 'statistics.xlsx');
    };

    const formatTime = (isoTime) => {
        return isoTime.split('T')[1].substring(0, 8); // Lấy phần sau chữ 'T' và giới hạn đến 8 ký tự (bao gồm giờ, phút và giây)
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
                                    checked={selectedBases.includes(location.location_name)}
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
                            max={endDate ? endDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                        />
                    </div>
                    <div className="flex items-center mx-36">
                        <label htmlFor="endDate" className="mr-2 font-bold">Ngày kết thúc:</label>
                        {startDate && (
                            <input
                                type="date"
                                id="endDate"
                                onChange={handleEndDateChange}
                                value={endDate ? endDate.toISOString().split('T')[0] : ''}
                                max={new Date().toISOString().split('T')[0]}
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
                <div className="mx-8 w-[780px] mt-8">
                    <canvas id="myChart" width="800" height="400"></canvas>
                </div>
            </div>
        </div>
    );
};

export default StatisticsPage;
