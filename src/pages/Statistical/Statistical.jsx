import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import 'tailwindcss/tailwind.css';
import Sidebar from "../../components/Siderbar/Siderbar";
import { registerLocale } from 'react-datepicker';
import vn from 'date-fns/locale/vi';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faDownload, faFileExport} from "@fortawesome/free-solid-svg-icons";
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
    const [startDate, setStartDate] = useState(subDays(new Date(), 8)); // Set default start date to 5 days ago
    const [endDate, setEndDate] = useState(new Date()); // Set default end date to today
    const [numberOfDays, setNumberOfDays] = useState(5); // Set default number of days to 5
    const [locations, setLocations] = useState([]);
    const workbook = XLSX.utils.book_new();

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

        // Tạo sheet tổng hợp tổng quan trước
        const overviewData = [];
        const overviewHeaders = ["Cơ sở", "Số lần vào", "Số lần ra"];
        overviewData.push(overviewHeaders);

        for (const base of selectedBases) {
            // Khởi tạo dữ liệu cho cơ sở
            const baseData = [base, 0, 0];

            try {
                // Gọi API để lấy dữ liệu cho cơ sở và khoảng thời gian đã chọn
                const response = await axios.get('https://c2se-14-sts-api.onrender.com/api/checkincheckout', {
                    params: {
                        location_name: base,
                        startDate: startDate,
                        endDate: endDate,
                    }
                });

                if (response.data) {
                    const filteredData = response.data.filter(item => item.location_name === base);

                    if (filteredData.length > 0) {
                        // Tính tổng số lần vào và ra cho cơ sở
                        const totalCheckIns = filteredData.filter(item => item.checkin_time).length;
                        const totalCheckOuts = filteredData.filter(item => item.checkout_time).length;

                        baseData[1] = totalCheckIns;
                        baseData[2] = totalCheckOuts;
                    }
                }
            } catch (error) {
                console.error('Lỗi khi tải dữ liệu cho cơ sở', base, ':', error);
                toast.error('Đã xảy ra lỗi khi tải dữ liệu.');
            }

            overviewData.push(baseData); // Thêm dòng dữ liệu tổng hợp cho tổng quan
        }

        // Tạo một sheet tổng hợp tổng quan
        const overviewWorksheet = XLSX.utils.aoa_to_sheet(overviewData);

        // Thiết lập kiểu dáng cho hàng tiêu đề
        const headerCellStyle = { font: { bold: true }, fill: { fgColor: { rgb: 'FFFF00FF' } } };

        if (overviewWorksheet[0]) {
            // Lấy ra các ô trong hàng tiêu đề
            const headerRow = overviewWorksheet[0];

            // Thiết lập kiểu dáng cho từng ô trong hàng tiêu đề
            headerRow.forEach((cell, index) => {
                cell.s = headerCellStyle;
            });
        }

        // Thiết lập chiều rộng cho các cột
        overviewWorksheet['!cols'] = [{ width: 20 }, { width: 20 }, { width: 20 }];

        // Thêm sheet tổng hợp vào workbook
        XLSX.utils.book_append_sheet(workbook, overviewWorksheet, 'Tổng hợp');

        // Tạo sheet cho từng cơ sở
        for (const base of selectedBases) {
            try {
                const response = await axios.get('https://c2se-14-sts-api.onrender.com/api/checkincheckout', {
                    params: {
                        location_name: base,
                        startDate: startDate,
                        endDate: endDate,
                    }
                });

                const worksheetData = [];
                const headers = ["STT", "Ngày", "Họ tên", "Biển số", "Thời gian vào", "Thời gian ra"];
                worksheetData.push(headers);

                if (response.data) {
                    const filteredData = response.data.filter(item => item.location_name === base);

                    if (filteredData.length === 0) {
                        const rowData = ['', formatDate(startDate), '', '', '', ''];
                        worksheetData.push(rowData);
                    } else {
                        const sortedData = filteredData.sort((a, b) => new Date(a.checkout_time) - new Date(b.checkout_time));

                        sortedData.forEach((item, index) => {
                            const rowData = [];
                            const formattedDate = formatDate(item.checkout_time);

                            rowData.push(index + 1);
                            rowData.push(formattedDate);
                            rowData.push(item.full_name);
                            rowData.push(item.license_plate);
                            rowData.push(formatTime(item.checkin_time));
                            rowData.push(formatTime(item.checkout_time));
                            worksheetData.push(rowData);
                        });
                    }
                }

                const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
                worksheet['!cols'] = [{ width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }];
                XLSX.utils.book_append_sheet(workbook, worksheet, base);
            } catch (error) {
                console.error('Lỗi khi tải dữ liệu cho cơ sở', base, ':', error);
                toast.error('Đã xảy ra lỗi khi tải dữ liệu.');
            }
        }

        // Ghi workbook ra file Excel
        XLSX.writeFile(workbook, 'statistics.xlsx');
    };






    const formatTime = (isoTime) => {
        return isoTime.split('T')[1].substring(0, 8); // Lấy phần sau chữ 'T' và giới hạn đến 8 ký tự (bao gồm giờ, phút và giây)
    };

    return (
        <div className="grid grid-cols-12 gap-6 p-4">
            <div className="col-span-2 w-[290px] h-full">
                <div className="border border-white">
                    <Sidebar />
                </div>
            </div>
            <div className="ml-16  w-[1120px] h-full col-span-10 shadow-md">
                <div className="mb-6 mx-4 mt-4 flex  items-center justify-between bg-[#F5F5F5] p-4 rounded-lg">
                    <div className="flex flex-wrap items-center space-x-4">
                        {locations.map((location) => (
                            <div key={location.location_id} className="flex items-center mb-2">
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
                <div className="mb-6 mx-4 flex justify-between">
                    <div className="flex items-center space-x-8">
                        <div className="flex items-center">
                            <label htmlFor="startDate" className="mr-2 font-bold">Ngày bắt đầu:</label>
                            <input
                                type="date"
                                id="startDate"
                                onChange={handleStartDateChange}
                                value={startDate ? startDate.toISOString().split('T')[0] : ''}
                                max={endDate ? endDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                                className="p-2 border rounded"
                            />
                        </div>
                        <div className="flex items-center">
                            <label htmlFor="endDate" className="mr-2 font-bold">Ngày kết thúc:</label>
                            <input
                                type="date"
                                id="endDate"
                                onChange={handleEndDateChange}
                                value={endDate ? endDate.toISOString().split('T')[0] : ''}
                                max={new Date().toISOString().split('T')[0]}
                                className="p-2 border rounded"
                            />
                        </div>
                    </div>
                    <div>
                        <button
                            onClick={handleExport}
                            className="flex items-center w-[150px] h-[50px] text-xl p-2 border rounded bg-[#212143] text-white hover:bg-blue-700"
                        >
                            <FontAwesomeIcon icon={faDownload} className="mr-2" />
                            Xuất File
                            <ToastContainer />
                        </button>
                    </div>
                </div>
                <div className=" mx-8 w-10/12">
                    <canvas id="myChart" width="800" height="400"></canvas>
                </div>
            </div>
        </div>
    );
};

export default StatisticsPage;
