import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Sidebar from "../../components/Siderbar/Siderbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faArrowLeft, faSearch} from "@fortawesome/free-solid-svg-icons";
import {Link} from "react-router-dom";
import Pagination from "../../components/Pagination/Pagination";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const initialData = [
    { id: uuidv4(), name: 'Cơ sở 1', describe: 'toa 5', account: '5', address: 'Địa chỉ 1', price: 1000 },
    { id: uuidv4(), name: 'Cơ sở 2', describe: 'toa 4', account: '5', address: 'Địa chỉ 2', price: 1500},
    { id: uuidv4(), name: 'Cơ sở 3', describe: 'toa 3', account: '5', address: 'Địa chỉ 3', price: 2000 },
    { id: uuidv4(), name: 'Cơ sở 4', describe: 'toa 2', account: '5', address: 'Địa chỉ 4', price: 2500 },
    { id: uuidv4(), name: 'Cơ sở 5', describe: 'toa 1', account: '5', address: 'Địa chỉ 5', price: 3000 },
    { id: uuidv4(), name: 'Cơ sở 6', describe: 'toa 6', account: '5', address: 'Địa chỉ 6', price: 350 },
    // { id: uuidv4(), name: 'Cơ sở 7', describe: 'toa 7', account: '5', address: 'Địa chỉ 7', price: 400 },
    // { id: uuidv4(), name: 'Cơ sở 8', describe: 'toa 8', account: '5', address: 'Địa chỉ 8', price: 450 },
    // { id: uuidv4(), name: 'Cơ sở 9', describe: 'toa 9', account: '5', address: 'Địa chỉ 9', price: 500 },
    // { id: uuidv4(), name: 'Cơ sở 10', describe: 'toa 10', account: '5', address: 'Địa chỉ 10', price: 550 },
];

const BaseList = () => {
    const [bases, setBases] = useState(initialData);
    const [newBaseName, setNewBaseName] = useState('');
    const [newBaseAddress, setNewBaseAddress] = useState('');
    const [newBaseDescribe, setNewBaseDescribe] = useState('');
    const [newBaseAccount, setNewBaseAccount] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const handleAddBase = () => {
        if (newBaseName.trim() !== '') {
            const newBase = {
                id: uuidv4(),
                name: newBaseName.trim(),
                address: newBaseAddress.trim(),
                describe: newBaseDescribe.trim(),
                account: newBaseAccount.trim(),
                price: 0,
            };
            setBases([...bases, newBase]);
            setNewBaseName('');
            setNewBaseAddress('');
            setNewBaseDescribe('');
            setNewBaseAccount('');
            toast.success('Cơ sở đã được thêm thành công.', { autoClose: 3000 });
        } else {
            toast.error('Vui lòng nhập tên cơ sở.', { autoClose: 3000 });
        }
    };

    const handleDeleteBase = (id) => {
        setBases(bases.filter((base) => base.id !== id));
        toast.success('Cơ sở đã được xóa thành công.', { autoClose: 3000 });
    };

    const handleSaveChanges = () => {
        toast.success('Thay đổi đã được lưu thành công.', { autoClose: 3000 });
    };


    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };
    const handlePageChange = (direction) => {
        if (direction === 'next') {
            setCurrentPage(prevPage => prevPage + 1); // Tăng trang hiện tại lên 1 khi chuyển qua trang tiếp theo
        } else if (direction === 'prev' && currentPage > 1) {
            setCurrentPage(prevPage => prevPage - 1); // Giảm trang hiện tại đi 1 khi chuyển về trang trước đó (phải đảm bảo currentPage > 1)
        }
    };

    const handlePriceChange = (id, price) => {
        setBases(
            bases.map((base) =>
                base.id === id ? { ...base, price: parseInt(price) } : base
            )
        );
    };



    const filteredBases = bases.filter((base) =>
        base.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white w-full h-full px-8">
            <div className="grid grid-cols-12 gap-10">
                <div className="col-span-3">
                    <div className="border border-white">
                        <Sidebar /> {/* Sidebar component */}
                    </div>
                </div>
                <div className="col-span-9 bg-[#F5F5F5] p-5 flex flex-col justify-between">
                    <div className=" items-start bg-white mx-auto p-4">
                        <div className="flex items-center  mb-8">
                            <div className="button rounded-full text-center bg-[#F9FBFF] items-center justify-center w-[60px] h-[30px] p-1 mr-2">
                                <Link to='/admin/manager-account'>
                                    <FontAwesomeIcon icon={faArrowLeft} />
                                </Link>
                            </div>
                            <h1 className="text-2xl font-bold">Danh Sách Cơ Sở </h1>
                        </div>
                        <div className="mb-4 flex">
                            <input
                                type="text"
                                className="w-1/4 p-2 border rounded mr-2"
                                placeholder="Tên cơ sở mới..."
                                value={newBaseName}
                                onChange={(e) => setNewBaseName(e.target.value)}
                            />
                            <input
                                type="text"
                                className="w-1/4 p-2 border rounded mr-2"
                                placeholder="Địa chỉ cơ sở mới..."
                                value={newBaseAddress}
                                onChange={(e) => setNewBaseAddress(e.target.value)}
                            />
                            <input
                                type="text"
                                className="w-1/4 p-2 border rounded mr-2"
                                placeholder="Mô tả cơ sở mới..."
                                value={newBaseDescribe}
                                onChange={(e) => setNewBaseDescribe(e.target.value)}
                            />
                            <input
                                type="text"
                                className="w-1/4 p-2 border rounded"
                                placeholder="Giá tiền"
                                value={newBaseAccount}
                                onChange={(e) => setNewBaseAccount(e.target.value)}
                            />
                            <button
                                className="px-4 w-[150px] py-2 bg-blue-500 text-white rounded ml-2 hover:bg-blue-600"
                                onClick={handleAddBase}
                            >
                                Thêm cơ sở
                            </button>
                        </div>
                        <table className="w-full border-collapse border">
                            <thead>
                            <tr className="bg-gray-200">
                                <th className="p-2 border">Tên cơ sở</th>
                                <th className="p-2 border">Địa chỉ</th>
                                <th className="p-2 border">Mô tả</th>
                                <th className="p-2 border">Số TKBV</th>
                                <th className="p-2 border">Giá tiền</th>
                                <th className="p-2 border">Hành động</th>
                            </tr>
                            </thead>
                            <tbody className="text-center">
                            {filteredBases.map((base) => (
                                <tr key={base.id}>
                                    <td className="p-2 border">{base.name}</td>
                                    <td className="p-2 border">{base.address}</td>
                                    <td className="p-2 border">{base.describe}</td>
                                    <td className="p-2 border">{base.account}</td>
                                    <td className="p-2  border">
                                        <input
                                            type="number"
                                            className="w-24 p-1  border rounded"
                                            value={base.price}
                                            onChange={(e) => handlePriceChange(base.id, e.target.value)}
                                        />
                                    </td>
                                    <td className="p-2 border">
                                        <button
                                            className="px-4 py-2 bg-red-600 text-white rounded mr-2 hover:bg-red-400"
                                            onClick={() => handleDeleteBase(base.id)}
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        <div className="border items-end border-white py-3">
                            {/* Truyền onPageChange vào PaginationAdmin */}
                            <Pagination currentPage={currentPage} onPageChange={handlePageChange} />
                        </div>
                        <div className="  mx-4 items-end">
                            <button
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-400"
                                onClick={handleSaveChanges}
                            >
                                Lưu thay đổi
                            </button>
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
