import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import Sidebar from "../../components/Siderbar/Siderbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faArrowLeft, faDownload} from "@fortawesome/free-solid-svg-icons";
import * as XLSX from 'xlsx';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';
import {Link} from "react-router-dom";

const RevenueUpdate = () => {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [transactions, setTransactions] = useState([]);
    const [branches, setBranches] = useState([]);
    const [selectedBranches, setSelectedBranches] = useState([]);
    const [revenueData, setRevenueData] = useState({ labels: [], datasets: [] });
    const [showChart, setShowChart] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('https://c2se-14-sts-api.onrender.com/api/transaction-summary', {
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
                const datasets = selectedBranches.map(branch => ({
                    label: branch,
                    data: filteredData.filter(transaction => transaction.location_name === branch).map(transaction => transaction.amount),
                    backgroundColor: '#' + Math.floor(Math.random()*16777215).toString(16), // Random color
                    borderColor: '#' + Math.floor(Math.random()*16777215).toString(16), // Random color
                    borderWidth: 1,
                }));
                setRevenueData({ labels: generateLabels(startDate, endDate), datasets });
                setShowChart(true); // Show chart when data is available
            } catch (error) {
                console.error('Error fetching data:', error);
                setShowChart(false); // Hide chart if there's an error fetching data
            }
        };
        fetchData();
    }, [startDate, endDate, selectedBranches]);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await axios.get('https://c2se-14-sts-api.onrender.com/api/transaction-summary?startDate=2024-04-01&endDate=2024-04-20');
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
        }
    }, []);

    useEffect(() => {
        // Save selected branches to localStorage
        localStorage.setItem('selectedBranches', JSON.stringify(selectedBranches));
    }, [selectedBranches]);

    useEffect(() => {
        // Automatically select a branch when the component mounts
        if (branches.length > 0 && selectedBranches.length === 0) {
            setSelectedBranches([branches[0]]);
        }
    }, [branches]);

    // Generate labels for the selected date range
    const generateLabels = (start, end) => {
        const labels = [];
        const currentDate = new Date(start);
        while (currentDate <= end) {
            labels.push(`${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`);
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return labels;
    };

    // Handle branch selection
    const handleBranchChange = (e) => {
        const { value, checked } = e.target;
        setSelectedBranches(prevSelected =>
            checked ? [...prevSelected, value] : prevSelected.filter(branch => branch !== value)
        );
    };

    // Export data to Excel
    const exportToExcel = () => {
        const wb = XLSX.utils.book_new();
        revenueData.datasets.forEach((dataset) => {
            const { label, data } = dataset;
            const wsData = [revenueData.labels, data];
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            XLSX.utils.book_append_sheet(wb, ws, label);
        });
        XLSX.writeFile(wb, "revenue_data.xlsx");
    };

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
                <div className="flex items-center mb-4">
                    <div className="button rounded-full text-center bg-[#F9FBFF] items-center justify-center w-[60px] h-[30px] p-1 mr-2">
                        <Link to=''>
                            <FontAwesomeIcon icon={faArrowLeft} />
                        </Link>
                    </div>
                    <h1 className="text-2xl mt-2 font-bold mb-4"> Danh Thu</h1>
                </div>
                {/* Branch selection */}
                <div className="mt-4 flex items-center">
                    <label className="block text-lg font-bold text-gray-700">Chọn cơ sở:</label>
                    <div className="flex items-center mt-1 py-4 px-4 bg-[#F4F7FE] overflow-x-auto">
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
                    <div className="w-full md:w-3/4 h-[420px] bg-white p-6 mb-4 md:mb-0">
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
                        <div className="mt-4 ml-4">
                            <button onClick={exportToExcel} className="bg-blue-500 hover:bg-blue-700 text-white font-bold w-[210px] py-1 rounded">
                                <FontAwesomeIcon icon={faDownload} /> Xuất file
                            </button>
                        </div>
                    </div>
                </div>
                {/* Transaction table */}
                <div className="overflow-y-auto max-h-[400px] border border-gray-300 rounded-lg mt-8">
                    <table className="w-full">
                        <thead className="bg-gray-200">
                        <tr>
                            <th className="px-4 py-2 text-left w-[25%] border-r border-gray-400">Họ tên</th>
                            <th className="px-4 py-2 text-left w-[25%] border-r border-gray-400">Ngày</th>
                            <th className="px-4 py-2 text-left w-[25%] border-r border-gray-400">Cơ sở giao dịch</th>
                            <th className="px-4 py-2 text-left w-[25%]">Số tiền</th>
                        </tr>
                        </thead>
                        <tbody>
                        {transactions.map(transaction => (
                            <tr key={transaction.id}>
                                <td className="px-4 py-2 w-[25%] border-r border-gray-400">{transaction.full_name}</td>
                                <td className="px-4 py-2 w-[25%] border-r border-gray-400">{transaction.license_plate}</td>
                                <td className="px-4 py-2 w-[25%] border-r border-gray-400">{transaction.location_name}</td>
                                <td className="px-4 py-2 w-[25%] text-green-700">{transaction.amount}</td>
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
