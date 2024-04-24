import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faBuildingColumns, faCircleInfo, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import Sidebar from "../../components/Siderbar/Siderbar";
import Pagination from "../../components/Pagination/Pagination";
import { Link } from "react-router-dom";

const TranscationHistory = () => {

    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    // Hàm để format số tiền và số dư
    function formatCurrency(value) {
        // Chuyển đổi giá trị thành số và làm tròn đến hàng trăm gần nhất
        const roundedValue = Math.round(parseFloat(value) * 100) / 100;
        // Sử dụng hàm toLocaleString() để format theo ngôn ngữ địa phương và thêm dấu phẩy
        return roundedValue.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }

    // Sử dụng useParams để lấy userId từ URL
    const { userId } = useParams();

    // Tạo state để lưu trữ dữ liệu lịch sử giao dịch
    const [transactionHistory, setTransactionHistory] = useState([]);

    useEffect(() => {
        // Gọi API để lấy dữ liệu lịch sử giao dịch khi component được render
        fetch(`https://c2se-14-sts-api.onrender.com/api/transaction-history/${userId}`)
            .then(response => response.json())
            .then(data => {
                // Lưu trữ dữ liệu vào state
                setTransactionHistory(data);
            })
            .catch(error => console.error('Error fetching transaction history:', error));
    }, [userId]); // userId là phần của dependencies array

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
                        <div className="w-auto mx-4 h-full text-left bg-white rounded-lg shadow-lg py-14">
                            <table className="min-w-full border-collapse w-full">
                                <thead>
                                <tr className="text-gray-500">
                                    <th className="py-2 px-3 border-t text-black border-gray-300 bg-white">Họ và tên</th>
                                    <th className="py-2 px-3 border-t text-black border-gray-300 bg-white">Ngày giao dịch</th>
                                    <th className="py-2 px-3 border-t text-black border-gray-300 bg-white">Thời gian</th>
                                    <th className="py-2 px-3 border-t text-black border-gray-300 bg-white">Số tiền</th>
                                    <th className="py-2 px-3 border-t text-black border-gray-300 bg-white">Số dư</th>
                                    <th className="py-2 px-3 border-t text-black border-gray-300 bg-white">Cơ sở</th>
                                </tr>
                                </thead>
                                <tbody>
                                {transactionHistory.map((item, index) => (
                                    <tr key={index} className="text-gray-500">
                                        <td className="py-2 px-4 border-t border-gray-300 bg-white">{item.full_name}</td>
                                        <td className="py-2 px-4 border-t border-gray-300 bg-white">{formatDate(item.tran_time)}</td>
                                        <td className="py-2 px-4 border-t border-gray-300 bg-white">{new Date(item.tran_time).toLocaleTimeString()}</td>
                                        <td className="py-2 px-4 border-t border-gray-300 bg-white">{formatCurrency(item.amount)}</td>
                                        <td className="py-2 px-4 border-t border-gray-300 bg-white">{formatCurrency(item.wallet)}</td>
                                        <td className="py-2 px-4 border-t border-gray-300 bg-white">{item.branch}</td>
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
