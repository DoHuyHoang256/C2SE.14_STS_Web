import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import 'tailwindcss/tailwind.css';
import Sidebar from "../../components/Siderbar/Siderbar";
import { registerLocale } from 'react-datepicker';
import vn from 'date-fns/locale/vi';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDatabase,faTrashCan,faPlus,faFileExport } from "@fortawesome/free-solid-svg-icons";
import * as XLSX from 'xlsx';

registerLocale('vi', vn);

const StatisticsPage = () => {
    const [data, setData] = useState([
        { name: 'Cơ sở 1', label: '04-01-2024', value: { 'Cơ sở 1': 35, } },
        {  label: '04-02-2024', value: { 'Cơ sở 1': 45,  'Nguyễn Văn Linh': 85,} },
    ]);
    const chartRef = useRef(null);
    const [selectedBases, setSelectedBases] = useState(['Cơ sở 1',]);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [numberOfDays, setNumberOfDays] = useState(0);
    const [showAddBaseModal, setShowAddBaseModal] = useState(false);
    const [newBaseName, setNewBaseName] = useState('');

    useEffect(() => {
        updateChart();
    }, [selectedBases, startDate, endDate]);

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

    const handleBaseChange = (event, base) => {
        if (event.target.checked) {
            setSelectedBases([...selectedBases, base]);
        } else {
            setSelectedBases(selectedBases.filter(selectedBase => selectedBase !== base));
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

    const handleRemoveBase = () => {
        setData(prevData => {
            if (prevData.length > 1) {
                const removedBase = prevData[prevData.length - 1].label;
                const newData = prevData.slice(0, -1);
                setSelectedBases(selectedBases.filter(base => base !== removedBase));
                return newData;
            } else {
                return prevData;
            }
        });
    };

    const handleAddNewBase = () => {
        if (newBaseName.trim() !== '') {
            setData(prevData => {
                const newBase = newBaseName.trim();
                const newData = [
                    ...prevData,
                    { name: newBase, label: 'New Base', value: {} } // Thêm cơ sở mới với nhãn 'New Base'
                ];
                setSelectedBases([...selectedBases, newBase]);
                return newData;
            });
            setShowAddBaseModal(false);
        }
    };


    const handleCancelAddBase = () => {
        setShowAddBaseModal(false);
        setNewBaseName('');
    };
    const handleExport = () => {
        // Tạo workbook mới
        const workbook = XLSX.utils.book_new();

        // Tạo mảng tất cả các ngày trong khoảng thời gian đã chọn
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
            {/* Sidebar */}
            <div className="col-span-3">
                <div className="border border-white h-screen flex flex-col justify-between">
                    <Sidebar />
                </div>
            </div>
            <div className="text-center bg-white w-[1000px] col-span-9 px-4">
                <h3 className="py-2 mb-8 w-full text-center bg-[#F3F7FA]">Rất vui được gặp bạn, Hien 👋</h3>
                <div className="mt-2 flex font-bold bg-[#F5F5F5] p-3 rounded-xl justify-between">
                    <div className="flex h-[90px] text-3xl px-2 items-center justify-center">
                        {data.map((item, index) => (
                            index === 1 ? null : (
                                <div key={item.name} className="mr-3 bg-[#FFFFF]] rounded-md mx-2 mb-6">
                                    <input className="h-5 w-5 mx-3" type="checkbox" id={`base-${index}`} value={index} onChange={(event) => handleBaseChange(event, item.name)} checked={selectedBases.includes(item.name)} />
                                    <label htmlFor={`base-${index}`} className="ml-1 ">{item.name}</label>
                                </div>
                            )
                        ))}
                    </div>

                    <div className="flex">
                        <div className="mr-2 bg-[#212143] w-[40px] rounded-e mb-2 text-center flex items-center justify-center">
                            <button className="text-xl font-bold text-white" onClick={handleAddBase}><FontAwesomeIcon icon={faPlus} /></button>
                        </div>
                        <div className="bg-[#212143] w-[40px] rounded-e mr-2 mb-2 text-center flex items-center justify-center">
                            <button className="text-xl text-white font-bold text-center" onClick={handleRemoveBase}><FontAwesomeIcon className="text-xl mx-2 text-white" icon={faTrashCan} /></button>
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
                    <div className="flex items-center ml-4">
                        <button
                        onClick={handleExport}
                            className="flex items-center w-[90px] h-[50px] text-xl p-2 border rounded   hover:bg-blue-300"
                        >
                            <FontAwesomeIcon icon={faFileExport} className="mr-2" />
                            Xuất File
                        </button>
                    </div>
                </div>
                {/* Chart */}
                <div className="w-[850px] mt-8">
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
