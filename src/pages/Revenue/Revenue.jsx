import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import Sidebar from "../../components/Siderbar/Siderbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faDownload } from "@fortawesome/free-solid-svg-icons";
import * as XLSX from 'xlsx';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';
import { Link } from "react-router-dom";
import {format} from "date-fns";

const RevenueUpdate = () => {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [transactions, setTransactions] = useState([]);
    const [branches, setBranches] = useState([]);
    const [selectedBranches, setSelectedBranches] = useState([]);
    const [revenueData, setRevenueData] = useState({ labels: [], datasets: [] });
    const [showChart, setShowChart] = useState(false);
    const [firstLoad, setFirstLoad] = useState(true);
    const [selectAll, setSelectAll] = useState(false); // Define selectAll state
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
            // Extract branch names from transactions
            const uniqueBranches = Array.from(new Set(data.map(transaction => transaction.location_name)));
            setBranches(uniqueBranches);

            // Filter out selected branches
            const filteredData = data.filter(transaction => selectedBranches.includes(transaction.location_name));

            // Create revenueData object
            const datasets = selectedBranches.map((branch, index) => ({
                label: branch,
                data: filteredData.filter(transaction => transaction.location_name === branch).map(transaction => transaction.total),
                backgroundColor: colors[index % colors.length], // Use predefined colors array
                borderColor: colors[index % colors.length], // Use predefined colors array
                borderWidth: 1,
            }));
            setRevenueData({ labels: generateLabels(startDate, endDate), datasets });
            setShowChart(true); // Show chart when data is available
        } catch (error) {
            console.error('Error fetching data:', error);
            setShowChart(false); // Hide chart if there's an error fetching data
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
        // If branches is not empty and it's the first load, automatically select all branches
        if (branches.length > 0 && firstLoad) {
            setSelectedBranches(branches);
            setFirstLoad(false); // Set first load to false to prevent auto-selection on subsequent renders
        }
    }, [branches, firstLoad]);

    useEffect(() => {
        // Fetch data when component mounts or selected branches change
        fetchData();
    }, [startDate, endDate, selectedBranches]);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await axios.get('https://c2se-14-sts-api.onrender.com/api/transaction-summary?startDate=2024-04-01&endDate=2024-05-09');
                setTransactions(response.data);
            } catch (error) {
                console.error('Error fetching transactions:', error);
            }
        };
        fetchTransactions();

        // Load selected branches from localStorage
        const storedSelectedBranches = localStorage.getItem('selectedBranches');
        if (storedSelectedBranches) {
            setSelectedBranches(JSON.parse(storedSelectedBranches));
        } else {
            // Automatically select all branches if none selected
            setSelectedBranches(branches);
        }
    }, [branches]);

    useEffect(() => {
        // Save selected branches to localStorage
        localStorage.setItem('selectedBranches', JSON.stringify(selectedBranches));
    }, [selectedBranches]);

    useEffect(() => {
        // Automatically set start date 10 days after today
        const newStartDate = new Date();
        newStartDate.setDate(newStartDate.getDate() - 8);
        setStartDate(newStartDate);

        // Automatically select all branches when component mounts for the first time
        setSelectedBranches(branches);
    }, []);


    // Generate labels for the selected date range
    const generateLabels = (start, end) => {
        const labels = [];
        const currentDate = new Date(start);
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' }; // Define date format options
        while (currentDate <= end) {
            labels.push(currentDate.toLocaleDateString('vi-VN', options)); // Format date according to Vietnamese locale
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return labels;
    };

    // Hàm xử lý khi thay đổi trạng thái của một mục

// Sử dụng useEffect để tự động chọn tất cả các cơ sở khi component được tải lần đầu tiên
    useEffect(() => {
        // Nếu branches không rỗng và là lần tải đầu tiên, tự động chọn tất cả các cơ sở
        if (branches.length > 0 && firstLoad) {
            setSelectedBranches(branches);
            setFirstLoad(false); // Đặt firstLoad thành false để ngăn tự động chọn ở các lần render sau
        }
    }, [branches, firstLoad]);

// Hàm xử lý khi thay đổi trạng thái của một mục
    const handleBranchChange = (e) => {
        const { value, checked } = e.target;
        if (value === "selectAll") {
            // Nếu mục được chọn là "Chọn tất cả", đánh dấu hoặc bỏ đánh dấu tất cả các mục
            if (checked) {
                setSelectedBranches(branches); // Đánh dấu tất cả các mục
            } else {
                setSelectedBranches([]); // Bỏ đánh dấu tất cả các mục
            }
        } else {
            // Nếu mục không phải là "Chọn tất cả", thực hiện thêm hoặc loại bỏ mục đã chọn
            setSelectedBranches(prevSelected =>
                checked ? [...prevSelected, value] : prevSelected.filter(branch => branch !== value)
            );
        }
    };



    // Export data to Excel
    const exportToExcel = async () => {
        const wb = XLSX.utils.book_new();

        // Lặp qua từng dataset trong revenueData.datasets
        for (const dataset of revenueData.datasets) {
            const { label } = dataset;
            let wsData = [["Ngày", "Họ tên", "Thời gian giao dịch", "Biển số", "Số tiền"]];

            try {
                // Gọi API để lấy thông tin chi tiết các giao dịch của từng cơ sở
                const response = await axios.get('https://c2se-14-sts-api.onrender.com/api/transaction-summary', {
                    params: {
                        startDate: startDate.toISOString().split('T')[0],
                        endDate: endDate.toISOString().split('T')[0],
                        branch: label // Truyền tên cơ sở cho API
                    }
                });
                const transactions = response.data;

                // Xử lý dữ liệu và thêm vào wsData
                transactions.forEach(transaction => {
                    wsData.push([

                    formatDate( transaction.tran_time),
                        transaction.full_name,
                        formatTime(transaction.tran_time),
                        transaction.license_plate,
                        transaction.amount
                    ]);
                });

                // Tạo sheet từ dữ liệu wsData
                const ws = XLSX.utils.aoa_to_sheet(wsData);

                // Căn chỉnh chiều rộng của các cột
                ws['!cols'] = [{ width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }];

                // Thêm sheet vào workbook với tên là label (tên cơ sở)
                XLSX.utils.book_append_sheet(wb, ws, label);
            } catch (error) {
                console.error('Error fetching transaction details for', label, ':', error);
                // Nếu có lỗi, bỏ qua và tiếp tục với cơ sở tiếp theo
                continue;
            }
        }

        // Xuất file Excel
        XLSX.writeFile(wb, "revenue_data.xlsx");
    };

    const formatDate = (isoDate) => {
        const date = new Date(isoDate);
        return format(date, 'dd-MM-yyyy');
    };
    const formatTime = (isoTime) => {
        return isoTime.split('T')[1].substring(0, 8); // Lấy phần sau chữ 'T' và giới hạn đến 8 ký tự (bao gồm giờ, phút và giây)
    };

    useEffect(() => {
        // Nếu branches không rỗng và là lần tải đầu tiên, tự động chọn tất cả các chi nhánh
        if (branches.length > 0 && firstLoad) {
            setSelectedBranches(branches);
            setSelectAll(true); // Tự động đặt trạng thái chọn tất cả
            setFirstLoad(false); // Đặt firstLoad thành false để ngăn tự động chọn ở các lần render sau
        }
    }, [branches, firstLoad]);

    return (
        <div className="grid grid-cols-12 gap-10 mt-8">
            {/* Sidebar */}
            <div className="col-span-2 w-[290px] h-full mx-10">
                <div className="border border-white h-screen flex flex-col justify-between">
                    <Sidebar />
                </div>
            </div>
            {/* Main content */}
            <div className="col-span-10 ml-28 p-8 bg-white rounded-lg shadow-lg flex flex-col">
                <div className="flex items-center mb-2">
                    <div className="button rounded-full text-center bg-[#F9FBFF] items-center justify-center w-[60px] h-[30px] p-1 mr-2">
                        <Link to=''>
                            <FontAwesomeIcon icon={faArrowLeft} />
                        </Link>
                    </div>
                    <h1 className="text-2xl mt-2 font-bold mb-3"> Doanh Thu</h1>
                </div>
                {/* Branch selection */}
                <div className="mt-4 flex items-center">
                    <label className="block text-lg font-bold text-gray-700">Chọn cơ sở:</label>
                    <div className="flex items-center mt-1 py-4 px-4 bg-[#F4F7FE] overflow-x-auto">
                        {/*<button onClick={handleSelectAll} className="mr-4">*/}
                        {/*    {selectAll ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}*/}
                        {/*</button>*/}
                        {branches.map(branch => (
                            <label key={branch} className="flex items-center mr-4">
                                <input
                                    type="checkbox"
                                    className="form-checkbox"
                                    value={branch}
                                    checked={selectedBranches.includes(branch)}
                                    onChange={handleBranchChange}
                                />
                                <span className="ml-2">{branch}</span>
                            </label>
                        ))}
                    </div>
                </div>
                {/* Export button */}

                {/* Chart and date picker */}
                <div className="flex flex-wrap items-start justify-between mt-8">
                    <div className="w-full md:w-3/4 h-[420px] bg-white   md:mb-0">
                        <div className="flex">
                            <div className="w-full">
                                {showChart ? <Line data={revenueData} /> : <p>No data available</p>}
                            </div>
                        </div>
                    </div>
                    <div className="w-full md:w-1/4 mb-4 md:mb-0 bg-[#F4F7FE] p-6 rounded-lg">
                        <div className="p-4 font-bold">
                            <p className="mb-2">Ngày bắt đầu</p>
                            <DatePicker selected={startDate} onChange={date => setStartDate(date)} />
                        </div>
                        <div className="mt-2 p-4 font-bold">
                            <p className="mb-2">Ngày kết thúc</p>
                            <DatePicker selected={endDate} onChange={date => setEndDate(date)} minDate={startDate} />
                        </div>
                        <div className="flex  justify-end mt-4">
                            <button onClick={exportToExcel} className="bg-blue-500 hover:bg-blue-700 text-white font-bold w-[210px] py-1 rounded">
                                <FontAwesomeIcon icon={faDownload} /> Xuất file
                            </button>
                        </div>
                    </div>

                </div>
                {/* Transaction table */}
                <div className="overflow-y-auto max-h-[400px] border border-gray-300 rounded-lg ">
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
                        {transactions.map((transaction, index) => (
                            <tr key={transaction.id}>
                                <td className="px-4 py-2 border-r border-gray-400">{index + 1}</td>
                                <td className="px-4 py-2 border-r border-gray-400">{transaction.full_name}</td>
                                <td className="px-4 py-2 border-r border-gray-400">{formatDate(transaction.tran_time)}</td>
                                <td className="px-4 py-2 border-r border-gray-400">{transaction.license_plate}</td>
                                <td className="px-4 py-2 border-r border-gray-400">{transaction.location_name}</td>
                                <td className="px-4 py-2 text-green-700">{transaction.amount} VND</td>
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
