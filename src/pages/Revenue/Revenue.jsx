import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faDownload, faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import * as XLSX from 'xlsx';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';
import { Link } from "react-router-dom";
import { format, parseISO, addHours } from "date-fns";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from "../../components/Siderbar/Siderbar";

const RevenueUpdate = () => {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [transactions, setTransactions] = useState([]);
    const [branches, setBranches] = useState([]);
    const [selectedBranches, setSelectedBranches] = useState([]);
    const [revenueData, setRevenueData] = useState({ labels: [], datasets: [] });
    const [showChart, setShowChart] = useState(false);
    const [firstLoad, setFirstLoad] = useState(true);
    const [selectAll, setSelectAll] = useState(false);
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FFA500', '#00FF00', '#FF0000', '#00FFFF', '#800080'];

    const fetchData = async () => {
        try {
            const response = await axios.get('https://c2se-14-sts-api.onrender.com/api/total-amount-by-location', {
                params: {
                    startDate: startDate.toISOString().split('T')[0],
                    endDate: endDate.toISOString().split('T')[0]
                }
            });
            const data = response.data;
            const uniqueBranches = Array.from(new Set(data.map(transaction => transaction.location_name)));
            setBranches(uniqueBranches);

            const filteredData = data.filter(transaction => selectedBranches.includes(transaction.location_name));

            const datasets = selectedBranches.map((branch, index) => ({
                label: branch,
                data: filteredData.filter(transaction => transaction.location_name === branch).map(transaction => transaction.total),
                backgroundColor: colors[index % colors.length],
                borderColor: colors[index % colors.length],
                borderWidth: 1,
            }));
            setRevenueData({ labels: generateLabels(startDate, endDate), datasets });
            setShowChart(true);
        } catch (error) {
            console.error('Error fetching data:', error);
            setShowChart(false);
        }
    };

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const response = await axios.get('https://c2se-14-sts-api.onrender.com/api/total-amount-by-location');
                const data = response.data;
                const uniqueBranches = Array.from(new Set(data.map(transaction => transaction.location_name)));
                setBranches(uniqueBranches);
            } catch (error) {
                console.error('Error fetching branches:', error);
            }
        };
        fetchBranches();
    }, []);

    useEffect(() => {
        if (branches.length > 0 && firstLoad) {
            setSelectedBranches(branches);
            setFirstLoad(false);
        }
    }, [branches, firstLoad]);

    useEffect(() => {
        fetchData();
    }, [startDate, endDate, selectedBranches]);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await axios.get('https://c2se-14-sts-api.onrender.com/api/transaction-summary');
                setTransactions(response.data);
            } catch (error) {
                console.error('Error fetching transactions:', error);
            }
        };
        fetchTransactions();

        const storedSelectedBranches = localStorage.getItem('selectedBranches');
        if (storedSelectedBranches) {
            setSelectedBranches(JSON.parse(storedSelectedBranches));
        } else {
            setSelectedBranches(branches);
        }
    }, [branches]);

    useEffect(() => {
        localStorage.setItem('selectedBranches', JSON.stringify(selectedBranches));
    }, [selectedBranches]);

    useEffect(() => {
        const newStartDate = new Date();
        newStartDate.setDate(newStartDate.getDate() - 8);
        setStartDate(newStartDate);
        setSelectedBranches(branches);
    }, []);

    const generateLabels = (start, end) => {
        const labels = [];
        const currentDate = new Date(start);
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        while (currentDate <= end) {
            labels.push(currentDate.toLocaleDateString('vi-VN', options));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return labels;
    };

    const handleBranchChange = (e) => {
        const { value, checked } = e.target;
        if (value === "selectAll") {
            if (checked) {
                setSelectedBranches(branches);
            } else {
                setSelectedBranches([]);
            }
        } else {
            setSelectedBranches(prevSelected =>
                checked ? [...prevSelected, value] : prevSelected.filter(branch => branch !== value)
            );
        }
    };

    const exportToExcel = async () => {
        if (revenueData.datasets.length === 0) {
            toast.error('Không có dữ liệu để xuất. Vui lòng chọn ít nhất một cơ sở.', {
                position: 'top-right'
            });
            return;
        }

        const wb = XLSX.utils.book_new();
        const overviewData = [['Cơ sở', 'Số giao dịch', 'Tổng doanh thu']];

        const cellColor = { fgColor: { rgb: 'FFFF00FF' } }; // Màu sắc của ô

        const headerRow = ["Ngày", "Họ tên", "Biển số", "Cơ sở", "Thời gian giao dịch", "Số tiền"];
        const headerCellStyle = { font: { bold: true }, fill: { fgColor: { rgb: 'FFFF00FF' } } };
        const wsData = [headerRow.map((val) => ({ v: val, s: headerCellStyle }))];

        for (const dataset of revenueData.datasets) {
            const { label } = dataset;
            let totalTransactions = 0;
            let totalRevenue = 0;

            try {
                const response = await axios.get('https://c2se-14-sts-api.onrender.com/api/transaction-summary', {
                    params: {
                        startDate: startDate.toISOString().split('T')[0],
                        endDate: endDate.toISOString().split('T')[0],
                        branch: label
                    }
                });
                const transactions = response.data;

                if (transactions.length === 0) {
                    wsData.push([{ v: 'Không có dữ liệu', s: cellColor }]);
                    overviewData.push([label, 0, 0]);
                } else {
                    transactions.forEach(transaction => {
                        if (transaction.location_name === label) {
                            const rowData = [
                                { v: formatDate(transaction.tran_time), s: cellColor },
                                { v: transaction.full_name, s: cellColor },
                                { v: transaction.license_plate, s: cellColor },
                                { v: transaction.location_name, s: cellColor },
                                { v: formatTime(transaction.tran_time), s: cellColor },
                                { v: transaction.amount, s: cellColor }
                            ];
                            wsData.push(rowData);
                            totalTransactions++;
                            totalRevenue += parseFloat(transaction.amount);
                        }
                    });
                    overviewData.push([label, totalTransactions, totalRevenue]);
                }

                const ws = XLSX.utils.aoa_to_sheet(wsData);
                ws['!cols'] = [{ width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }];
                XLSX.utils.book_append_sheet(wb, ws, label);
            } catch (error) {
                console.error('Lỗi khi tải chi tiết giao dịch cho', label, ':', error);
            }
        }

        const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);
        XLSX.utils.book_append_sheet(wb, overviewSheet, 'Tổng quan');

        XLSX.writeFile(wb, "revenue_data.xlsx");
    };

    const formatDate = (isoDate) => {
        const date = parseISO(isoDate); // Parse the ISO date
        const localDate = addHours(date, date.getTimezoneOffset() / 60); // Adjust to local timezone
        return format(localDate, 'dd-MM-yyyy');
    };

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('vi-VN').format(amount);
    };

    const formatTime = (isoTime) => {
        const date = parseISO(isoTime); // Parse the ISO time
        const localTime = addHours(date, date.getTimezoneOffset() / 60); // Adjust to local timezone
        return format(localTime, 'HH:mm:ss');
    };

    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.tran_time) - new Date(a.tran_time));

    useEffect(() => {
        if (branches.length > 0 && firstLoad) {
            setSelectedBranches(branches);
            setSelectAll(true);
            setFirstLoad(false);
        }
    }, [branches, firstLoad]);

    return (
        <div className="grid grid-cols-12 gap-10 p-4 ">
            <div className="ml-4 col-span-2 w-[290px] h-full">
                <div className="border border-white">
                    <Sidebar />
                </div>
            </div>
            <div className="col-span-10 ml-20 p-8 bg-white rounded-lg shadow-lg flex flex-col">
                <div className="flex items-center mb-2">
                    <ToastContainer position="top-right" />
                    <div className="button rounded-full text-center bg-[#F9FBFF] items-center justify-center w-[60px] h-[30px] p-1 mr-2">
                        <Link to="/admin/revenue">
                            <FontAwesomeIcon icon={faArrowLeft} />
                        </Link>
                    </div>
                    <h1 className="text-2xl font-bold">DOANH THU</h1>
                </div>
                <div className="flex mb-2 justify-between">
                    <div className="flex space-x-4">
                        <div className="flex items-center">
                            <label htmlFor="startDate" className="mr-2 font-bold">Ngày bắt đầu:</label>
                            <div className="relative">
                                <DatePicker
                                    id="startDate"
                                    selected={startDate}
                                    onChange={(date) => {
                                        if (date <= endDate) {
                                            setStartDate(date);
                                        } else {
                                            toast.error('Ngày bắt đầu không được vượt quá ngày kết thúc.');
                                        }
                                    }}
                                    dateFormat="dd/MM/yyyy"
                                    className="p-2 border rounded pl-10"
                                    maxDate={new Date()}
                                />
                                <FontAwesomeIcon icon={faCalendarAlt} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-800" />
                            </div>
                        </div>
                        <div className="flex items-center">
                            <label htmlFor="endDate" className="mr-2 font-bold">Ngày kết thúc:</label>
                            <div className="relative">
                                <DatePicker
                                    id="endDate"
                                    selected={endDate}
                                    onChange={(date) => {
                                        if (date >= startDate) {
                                            setEndDate(date);
                                        } else {
                                            toast.error('Ngày kết thúc không được trước ngày bắt đầu.');
                                        }
                                    }}
                                    dateFormat="dd/MM/yyyy"
                                    className="p-2 border rounded pl-10"
                                    maxDate={new Date()}
                                />
                                <FontAwesomeIcon icon={faCalendarAlt} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-800" />
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={exportToExcel}
                        className="flex items-center w-[150px] h-[50px] text-xl p-2 border rounded bg-[#212143] text-white hover:bg-blue-700"
                    >
                        <FontAwesomeIcon icon={faDownload} className="mr-2" />
                        Xuất Excel
                    </button>
                </div>
                <div className="my-4">
                    <h2 className="text-xl font-semibold mb-2">Chọn Cơ Sở:</h2>
                    <div className="flex flex-wrap">
                        <div key="selectAll" className="mr-4 mb-2">
                            <input
                                type="checkbox"
                                id="selectAll"
                                value="selectAll"
                                checked={selectAll}
                                onChange={(e) => {
                                    setSelectAll(e.target.checked);
                                    handleBranchChange(e);
                                }}
                                className="mr-2"
                            />
                            <label htmlFor="selectAll">Chọn tất cả</label>
                        </div>
                        {branches.map((branch) =>
                            (
                                <div key={branch} className="mr-4 mb-2">
                                    <input
                                        type="checkbox"
                                        id={branch}
                                        value={branch}
                                        checked={selectedBranches.includes(branch)}
                                        onChange={handleBranchChange}
                                        className="mr-2"
                                    />
                                    <label htmlFor={branch}>{branch}</label>
                                </div>
                            ))}
                    </div>
                </div>
                {showChart ? (
                    <div className="mt-4">
                        <Line
                            data={revenueData}
                            options={{
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                    },
                                },
                            }}
                        />
                    </div>
                ) : (
                    <div className="text-center mt-4">
                        <p>Không có dữ liệu để hiển thị</p>
                    </div>
                )}

                <div className="overflow-y-auto max-h-[400px] border border-gray-300 rounded-lg mt-4">
                    <table className="w-full">
                        <thead className="bg-gray-200">
                        <tr>
                            <th className="px-4 py-2 text-left border-r border-gray-400">STT</th>
                            <th className="px-4 py-2 text-left border-r border-gray-400">Họ tên</th>
                            <th className="px-4 py-2 text-left border-r border-gray-400">Ngày</th>
                            <th className="px-4 py-2 text-left border-r border-gray-400">Biển Số</th>
                            <th className="px-4 py-2 text-left border-r border-gray-400">Cơ sở giao dịch</th>
                            <th className="px-4 py-2 text-left">Số tiền</th>
                        </tr>
                        </thead>
                        <tbody>
                        {sortedTransactions.map((transaction, index) => (
                            <tr key={transaction.id}>
                                <td className="px-4 py-2 border-r border-gray-400">{index + 1}</td>
                                <td className="px-4 py-2 border-r border-gray-400">{transaction.full_name}</td>
                                <td className="px-4 py-2 border-r border-gray-400">{formatDate(transaction.tran_time)}</td>
                                <td className="px-4 py-2 border-r border-gray-400">{transaction.license_plate}</td>
                                <td className="px-4 py-2 border-r border-gray-400">{transaction.location_name}</td>
                                <td className="px-4 py-2 text-green-700">{formatAmount(transaction.amount)} VND</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RevenueUpdate;
