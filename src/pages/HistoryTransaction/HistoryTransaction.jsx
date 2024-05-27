import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../../components/Siderbar/Siderbar";
import Pagination from "../../components/Pagination/Pagination";

const TranscationHistory = () => {
    // Function to parse the date string in dd/MM/yyyy HH:mm:ss format
    function parseDate(dateString) {
        const [datePart, timePart] = dateString.split(' ');
        const [day, month, year] = datePart.split('/').map(Number);
        const [hours, minutes, seconds] = timePart.split(':').map(Number);
        return new Date(year, month - 1, day, hours, minutes, seconds);
    }

    function formatDate(dateString) {
        const date = parseDate(dateString);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    function formatTime(dateString) {
        const date = parseDate(dateString);
        return date.toLocaleTimeString();
    }

    // Function to format currency
    function formatCurrency(value) {
        const roundedValue = Math.round(parseFloat(value) * 100) / 100;
        return roundedValue.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }

    // Use useParams to get userId from URL
    const { userId } = useParams();

    // State to store transaction history data
    const [transactionHistory, setTransactionHistory] = useState([]);

    // State for start date and end date
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Filter data based on start date and end date
    const filteredTransactionHistory = transactionHistory.filter((item) => {
        const tranDate = parseDate(item.tran_time);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        if (start && tranDate < start) {
            return false;
        }
        if (end && tranDate > end) {
            return false;
        }
        return true;
    });

    useEffect(() => {
        // Fetch transaction history data when component is rendered
        fetch(`https://c2se-14-sts-api.onrender.com/api/transaction-history/${userId}`)
            .then(response => response.json())
            .then(data => {
                setTransactionHistory(data);
            })
            .catch(error => console.error('Error fetching transaction history:', error));
    }, [userId]);

    return (
        <div className="bg-[#F3F7FA] w-full h-full p-8">
            <div className="grid grid-cols-12 gap-10">
                <div className="col-span-3">
                    <div className="border border-white">
                        <Sidebar />
                    </div>
                </div>
                <div className="col-span-9">
                    <div className="bg-[#ffff] border border-white p-2 rounded-lg">
                        <div className="mx-auto border border-white p-2">
                            <div className="App p-2 flex items-center justify-between">
                                <div style={{ textAlign: "left" }}>
                                    <h1 className="text-3xl font-bold">Lịch sử giao dịch</h1>
                                </div>
                            </div>
                        </div>

                        {/* Filter based on start date and end date */}
                        <div className="w-auto mx-4 h-full text-left bg-white rounded-lg shadow-lg py-14">
                            <div className="flex mb-4">
                                <div className="mr-4">
                                    <label className="block font-bold mb-2">Từ ngày:</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="border border-gray-300 rounded p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold mb-2">Đến ngày:</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="border border-gray-300 rounded p-2"
                                    />
                                </div>
                            </div>

                            <table className="min-w-full border-collapse w-full">
                                <thead>
                                <tr className="text-gray-500">
                                    <th className="py-2 px-3 border-t text-black border-gray-300 bg-white">STT</th>
                                    <th className="py-2 px-3 border-t text-black border-gray-300 bg-white">Họ và tên</th>
                                    <th className="py-2 px-3 border-t text-black border-gray-300 bg-white">Ngày giao dịch</th>
                                    <th className="py-2 px-3 border-t text-black border-gray-300 bg-white">Thời gian</th>
                                    <th className="py-2 px-3 border-t text-black border-gray-300 bg-white">Số tiền</th>
                                    {/*<th className="py-2 px-3 border-t text-black border-gray-300 bg-white">Số dư</th>*/}
                                </tr>
                                </thead>
                                <tbody>
                                {/* Display filtered data */}
                                {filteredTransactionHistory.map((item, index) => (
                                    <tr key={index} className="text-gray-500">
                                        <td className="py-2 px-4 border-t border-gray-300 bg-white">{index + 1}</td>
                                        <td className="py-2 px-4 border-t border-gray-300 bg-white">{item.full_name}</td>
                                        <td className="py-2 px-4 border-t border-gray-300 bg-white">{formatDate(item.tran_time)}</td>
                                        <td className="py-2 px-4 border-t border-gray-300 bg-white">{formatTime(item.tran_time)}</td>
                                        <td className={`py-2 px-4 border-t border-gray-300 bg-white ${parseFloat(item.amount) >= 10000 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(item.amount)}</td>
                                        {/*<td className="py-2 px-4 border-t border-gray-300 bg-white">{formatCurrency(item.wallet)}</td>*/}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="border border-white py-8">
                            <Pagination />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TranscationHistory;
