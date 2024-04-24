import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import Sidebar from "../../components/Siderbar/Siderbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import * as XLSX from 'xlsx';


const RevenueUpdate = () => {
    // Dữ liệu doanh thu mẫu cho 3 cơ sở
    const [revenueData, setRevenueData] = useState({
        labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6'],
        datasets: [
            {
                label: 'Cơ sở A',
                data: [8000, 12000, 10000, 14000, 15000, 18000],
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
            {
                label: 'Cơ sở B',
                data: [10000, 15000, 12000, 18000, 20000, 25000],
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
            },
            {
                label: 'Cơ sở C',
                data: [12000, 14000, 11000, 16000, 17000, 20000],
                backgroundColor: 'rgba(255, 205, 86, 0.2)',
                borderColor: 'rgba(255, 205, 86, 1)',
                borderWidth: 1,
            },
        ],
    });

    // State để lưu trữ danh sách cơ sở được chọn
    const [selectedBranches, setSelectedBranches] = useState(['Cơ sở A']);

    // Hàm xử lý sự kiện khi chọn cơ sở từ checkbox
    const handleBranchChange = (e) => {
        const { value, checked } = e.target;
        if (checked) {
            setSelectedBranches(prevSelected => [...prevSelected, value]);
        } else {
            setSelectedBranches(prevSelected => prevSelected.filter(branch => branch !== value));
        }
    };

    // Tính tổng dữ liệu của các cơ sở được chọn
    // Tính tổng dữ liệu của các cơ sở được chọn và tổng của tất cả các tháng
    const calculateTotalData = () => {
        let totalData = new Array(revenueData.labels.length).fill(0);
        selectedBranches.forEach(branch => {
            const branchData = revenueData.datasets.find(dataset => dataset.label === branch).data;
            branchData.forEach((value, index) => {
                totalData[index] += value;
            });
        });

        // Tính tổng của tất cả các tháng
        let overallTotal = new Array(revenueData.labels.length).fill(0);
        revenueData.datasets.forEach(dataset => {
            dataset.data.forEach((value, index) => {
                overallTotal[index] += value;
            });
        });

        // Cộng tổng của các cơ sở được chọn với tổng của tất cả các tháng
        totalData.forEach((value, index) => {
            totalData[index] += overallTotal[index];
        });

        return totalData;
    };

    // Lọc dữ liệu cho biểu đồ dựa trên các cơ sở được chọn
    const filteredData = revenueData.datasets.filter(dataset => selectedBranches.includes(dataset.label));

    // Tính toán dữ liệu tổng của các cơ sở được chọn
    const totalData = calculateTotalData();

    // Hàm xuất file Excel
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
        <div className="grid w-full grid-cols-12 gap-10">
            <div className="mx-10 col-span-3">
                <div className="border border-white h-screen flex flex-col justify-between">
                    <Sidebar />
                </div>
            </div>

            <div className="col-span-9 p-8 bg-white rounded-lg shadow-lg flex flex-col">
                <h1 className="text-2xl font-bold mb-4">Cập nhật doanh thu</h1>
                <div className=" mt-4">
                    <label className="block text-sm font-medium text-gray-700">Chọn cơ sở:</label>
                    <div className="flex items-center mt-1">
                        <label className="flex items-center mr-4">
                            <input type="checkbox" className="form-checkbox" value="Cơ sở A" checked={selectedBranches.includes('Cơ sở A')} onChange={handleBranchChange} />
                            <span className="ml-2">Cơ sở A</span>
                        </label>
                        <label className="flex items-center mr-4">
                            <input type="checkbox" className="form-checkbox" value="Cơ sở B" checked={selectedBranches.includes('Cơ sở B')} onChange={handleBranchChange} />
                            <span className="ml-2">Cơ sở B</span>
                        </label>
                        <label className="flex items-center">
                            <input type="checkbox" className="form-checkbox" value="Cơ sở C" checked={selectedBranches.includes('Cơ sở C')} onChange={handleBranchChange} />
                            <span className="ml-2">Cơ sở C</span>
                        </label>
                    </div>
                    <div className="mt-4">
                        <h2 className="text-lg font-semibold mb-2">Tổng doanh thu của các cơ sở được chọn:</h2>
                        <div>
                            <p>Tổng doanh thu: {selectedBranches.length > 0 ? totalData.reduce((a, b) => a + b, 0) : 0}</p>
                        </div>
                    </div>

                </div>
                <div className="flex p-6 h-[300px] flex-wrap  mt-4 items-start justify-between mb-8">
                    <div className="w-full h-[300px] p-6 bg-[#F9FBFF] md:w-[50%] mb-4 md:mb-0">
                        <div className="w-full">
                            <Line data={{ labels: revenueData.labels, datasets: filteredData }} />
                        </div>
                    </div>

                    <div className="w-full md:w-[40%] overflow-x-auto">
                        <button onClick={exportToExcel} className="bg-white hover:bg-blue-400 text-right text-black font-bold py-2 px-4 rounded">
                            <FontAwesomeIcon icon={faDownload} /> Xuất file Excel
                        </button>
                        <h2 className="text-lg font-semibold mt-6 mb-2">Lịch sử giao dịch</h2>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mô tả</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số tiền</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">01/04/2024</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Mua hàng</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$50.00</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">02/04/2024</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Bán hàng</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$100.00</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RevenueUpdate;
