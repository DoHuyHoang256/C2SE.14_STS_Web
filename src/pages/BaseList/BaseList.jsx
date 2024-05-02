// BaseList.js

import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Sidebar from "../../components/Siderbar/Siderbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Pagination from "../../components/Pagination/Pagination";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './BaseList.css';
import axios from 'axios'; // Import thư viện Axios

const BaseList = () => {
    const [bases, setBases] = useState([]);
    const [newBaseName, setNewBaseName] = useState('');
    const [newBaseCost, setNewBaseCost] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [emails, setEmails] = useState([]); // State lưu danh sách email

    useEffect(() => {
        // Gọi API để lấy dữ liệu từ server khi component được render
        fetch('https://c2se-14-sts-api.onrender.com/api/locations')
            .then(response => response.json())
            .then(data => {
                // Xử lý dữ liệu trước khi đặt vào state
                const modifiedData = data.map(base => ({
                    id: base.location_id,
                    name: base.location_name,
                    account: base.user_id,
                    cost: base.cost,
                    status: base.status
                }));
                setBases(modifiedData);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                toast.error('Error fetching data. Please try again later.', { autoClose: 3000 });
            });

        // Gọi API để lấy danh sách email
        fetch('https://c2se-14-sts-api.onrender.com/api/email')
            .then(response => response.json())
            .then(data => {
                // Lưu danh sách email vào state
                setEmails(data);
            })
            .catch(error => {
                console.error('Error fetching email data:', error);
                toast.error('Error fetching email data. Please try again later.', { autoClose: 3000 });
            });
    }, []);

    const handleToggleStatus = (id) => {
        setBases(bases.map(base =>
            base.id === id ? { ...base, status: !base.status } : base
        ));
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const handlePageChange = (direction) => {
        if (direction === 'next') {
            setCurrentPage(prevPage => prevPage + 1);
        } else if (direction === 'prev' && currentPage > 1) {
            setCurrentPage(prevPage => prevPage - 1);
        }
    };

    const handleCostChange = (id, cost) => {
        setBases(
            bases.map(base =>
                base.id === id ? { ...base, cost: parseInt(cost) } : base
            )
        );
    };

    const handleNameChange = (id, name) => {
        setBases(
            bases.map(base =>
                base.id === id ? { ...base, name: name } : base
            )
        );
    };

    const handleAccountChange = (id, account) => {
        setBases(
            bases.map(base =>
                base.id === id ? { ...base, account: account } : base
            )
        );
    };

   

    const handleSaveChanges = () => {
        console.log('Changes saved successfully:', bases); // Hiển thị thông tin lưu ra console
    
        // Tạo một mảng promises chứa các promise cho mỗi yêu cầu cập nhật
        const updatePromises = bases.map(base => {
            // Truy cập các trường thông tin cần thay đổi từ base
            const { id, name, account, cost, status } = base;
    
            // Dữ liệu cần gửi đến API để cập nhật
            const dataToUpdate = {
                name: name, // hoặc chỉ cần viết name vì tên biến và tên trường giống nhau
                account: account,
                cost: cost,
                status: status
            };
    
            // Trả về promise của yêu cầu cập nhật
            return axios.patch('https://c2se-14-sts-api.onrender.com/api/locations/' + id, dataToUpdate);
        });
    
        // Sử dụng Promise.all để chờ cho tất cả các promise được giải quyết
        Promise.all(updatePromises)
            .then(responses => {
                // Nếu tất cả các promise đều được giải quyết thành công, hiển thị thông báo thành công
                toast.success('All changes saved successfully.', { autoClose: 3000 });
                console.log('All changes saved successfully:', responses.map(response => response.data));
            })
            .catch(error => {
                // Nếu có ít nhất một promise bị lỗi, hiển thị thông báo lỗi
                toast.error('Error saving changes.', { autoClose: 3000 });
                console.error('Error saving changes:', error);
            });
    };
    
    
    


    return (
        <div className="bg-white w-full h-full px-8">
            <div className="grid grid-cols-12 gap-10">
                <div className="col-span-3">
                    <div className="border border-white">
                        <Sidebar />
                    </div>
                </div>
                <div className="col-span-9 bg-[#F5F5F5] p-5 flex flex-col justify-between">
                    <div className=" items-start bg-white w-full h-full p-4">
                        <div className="flex items-center  mb-8">
                            <h1 className="text-2xl font-bold">Danh Sách Cơ Sở </h1>
                        </div>
                        <table className="w-full border-collapse border">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="p-2 border">Cơ sở</th>
                                    <th className="p-2 border">Tài khoản</th>
                                    <th className="p-2 border">Chi phí</th>
                                    <th className="p-2 border">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody className="text-center">
                                {bases.map((base) => (
                                    <tr key={base.id}>
                                        <td className="p-2 border">
                                            <input
                                                type="text"
                                                value={base.name}
                                                onChange={(e) => handleNameChange(base.id, e.target.value)}
                                            />
                                        </td>
                                        <td className="p-2 border">
                                        <select
                                            value={base.account}
                                            onChange={(e) => handleAccountChange(base.id, e.target.value)}
                                        >
                                            {emails.map((email) => (
                                                <option key={email.user_id} value={email.user_id}>
                                                    {email.email}
                                                </option>
                                            ))}
                                        </select>
                                        </td>
                                        <td className="p-2 border">
                                            <input
                                                type="number"
                                                value={base.cost}
                                                onChange={(e) => handleCostChange(base.id, e.target.value)}
                                            />
                                        </td>
                                        <td className="p-2 border">
                                            <label className="switch">
                                                <input type="checkbox" checked={base.status} onChange={() => handleToggleStatus(base.id)} />
                                                <span className="slider"></span>
                                            </label>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="border items-end border-white py-3">
                            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleSaveChanges}>
                                Save Changes
                            </button>
                            <Pagination currentPage={currentPage} onPageChange={handlePageChange} />
                        </div>
                    </div>
                    <div>
                        <ToastContainer />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BaseList;
