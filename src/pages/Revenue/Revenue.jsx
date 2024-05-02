import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import Sidebar from "../../components/Siderbar/Siderbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faDownload, faSearch} from "@fortawesome/free-solid-svg-icons";
import * as XLSX from 'xlsx';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const RevenueUpdate = () => {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());

    // Dữ liệu doanh thu mẫu cho 3 cơ sở
    const [revenueData, setRevenueData] = useState({
        labels: ['01/01/2024', '02/01/2024', '03/01/2024', '04/01/2024', '05/01/2024', '06/01/2024','0/01/2024'], // Thêm ngày vào nhãn của biểu đồ
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

    const [selectedBranches, setSelectedBranches] = useState(['Cơ sở A']);
    const handleBranchChange = (e) => {
        const { value, checked } = e.target;
        if (checked) {
            setSelectedBranches(prevSelected => [...prevSelected, value]);
        } else {
            setSelectedBranches(prevSelected => prevSelected.filter(branch => branch !== value));
        }
    };

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

    const filteredData = revenueData.datasets.map(dataset => {
        return {
            ...dataset,
            data: dataset.data.slice(startDate.getDate() - 1, endDate.getDate()) // Sử dụng getDate() thay vì getMonth()
        };
    });


    // Options for displaying selected dates on the chart
    const options = {
        scales: {
            x: {
                ticks: {
                    callback: function(value, index, values) {
                        return startDate.getDate() + index + '/' + (startDate.getMonth() + 1);
                    }
                }
            }
        }
    };

    return (
        <div className="grid w-full grid-cols-12 mt-8 gap-10">
            <div className=" w-[300px] mx-10 col-span-3">
                <div className="border border-white h-screen flex flex-col justify-between">
                    <Sidebar />
                </div>
            </div>

            <div className="col-span-8   w-[1100px] p-8 bg-white rounded-lg shadow-lg flex flex-col">
                <h1 className="text-2xl font-bold mb-4">Cập nhật doanh thu</h1>
                <div className=" mt-4">
                    <label className="block text-lg font-medium text-gray-700">Chọn cơ sở:</label>
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
                        <div className=" mx-36">
                            <div>
                                <p>Tổng doanh thu: {selectedBranches.length > 0 ? totalData.reduce((a, b) => a + b, 0) : 0}</p>
                            </div>
                        </div>
                        <button onClick={exportToExcel} className="bg-white mx-16 hover:bg-blue-400 text-right text-black font-bold py-2 px-4 rounded">
                            <FontAwesomeIcon icon={faDownload} /> Xuất file
                        </button>

                    </div>

                </div>
                <div className="flex p-6 h-[400px] flex-wrap  mt-4 items-start justify-between mb-8">
                    <div className="w-[500px] h-[320px] p-6 bg-[#F9FBFF] md:w-[55%] mb-4 md:mb-0">
                        <div className="w-[500px] h-[320px] ">
                            <Line data={{ labels: revenueData.labels, datasets: filteredData }} options={options} />
                        </div>
                    </div>
                    <div className="w-full md:w-[40%] overflow-x-auto">
                        {/*<p> Ngày bắt đầu</p>*/}
                        <DatePicker  selected={startDate} onChange={date => setStartDate(date)} />
                        <DatePicker selected={endDate} onChange={date => setEndDate(date)} />

                        <div className="flex items-center mt-4 mb-4">
                            <h3 className="text-lg  font-semibold mr-1">Lịch sử giao dịch</h3>
                            <div className="flex-grow "></div> {/* Để căn lề phải cho thanh tìm kiếm và nút */}
                            <input  type="text" placeholder="Tìm kiếm..." className="border border-gray-300 px-2 py-1 rounded-md mr-2" />
                            <button className="bg-blue-500 w-[50px] text-white px-2 py-1 rounded-md"> <FontAwesomeIcon icon={faSearch} /></button>
                        </div>

                        <div className="overflow-y-auto max-h-[200px]">
                            <table className="divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ tên</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số tiền</th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Phi Hien</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">01/04/2024</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$50.00</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Huy Hoangg</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">02/04/2024</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$100.00</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Phi Hien</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">01/04/2024</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$50.00</td>
                                </tr>    <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Phi Hien</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">01/04/2024</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$50.00</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RevenueUpdate;
