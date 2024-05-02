import React, { useState,useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Sidebar from "../../components/Siderbar/Siderbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faEdit } from "@fortawesome/free-solid-svg-icons"; // Import faEdit icon
import Pagination from "../../components/Pagination/Pagination";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from "react-router-dom";
import axios from "axios";

const initialData = [
    { id: uuidv4(), name: 'Cơ sở 1', describe: 'toa 5', account: '5', address: 'Địa chỉ 1', price: 1000 },
    { id: uuidv4(), name: 'Cơ sở 2', describe: 'toa 4', account: '5', address: 'Địa chỉ 2', price: 1500 },
    { id: uuidv4(), name: 'Cơ sở 3', describe: 'toa 3', account: '5', address: 'Địa chỉ 3', price: 2000 },
    { id: uuidv4(), name: 'Cơ sở 4', describe: 'toa 2', account: '5', address: 'Địa chỉ 4', price: 2500 },
    { id: uuidv4(), name: 'Cơ sở 5', describe: 'toa 1', account: '5', address: 'Địa chỉ 5', price: 3000 },
    { id: uuidv4(), name: 'Cơ sở 6', describe: 'toa 6', account: '5', address: 'Địa chỉ 6', price: 350 },


];
const PAGE_LENGTH = 7;

const LocationList = () => {

    const [bases, setLocations] = useState([]);
    const [newLocationName, setNewLocationName] = useState('');
    const [newLocationAddress, setNewLocationAddress] = useState('');
    const [newLocationDescribe, setNewLocationDescribe] = useState('');
    const [newLocationAccount, setNewLocationAccount] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editLocation, setEditLocation] = useState(null);
    const [isAddingLocation, setIsAddingLocation] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const startIndex = (currentPage - 1) * PAGE_LENGTH;
    const endIndex = currentPage * PAGE_LENGTH;
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('https://c2se-14-sts-api.onrender.com/api/locations');
                if (response.data.length <= PAGE_LENGTH) {
                    setLocations(response.data);
                } else {
                    // Nếu có nhiều hơn PAGE_LENGTH mục, chỉ lấy PAGE_LENGTH mục đầu tiên
                    setLocations(response.data.slice(0, PAGE_LENGTH));
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    const handleAddLocation = async () => {
        if (newLocationName.trim() !== '' && newLocationAddress.trim() !== '' && newLocationDescribe.trim() !== '' && newLocationAccount.trim() !== '') {
            try {
                const response = await axios.post('https://c2se-14-sts-api.onrender.com/api/locations', {
                    location_name: newLocationName.trim(), // Sử dụng location_name thay vì name
                    address: newLocationAddress.trim(),
                    describe: newLocationDescribe.trim(),
                    account: newLocationAccount.trim(),
                    cost: 0 // Đặt giá tiền mặc định, sử dụng cost thay vì price
                });
                console.log('New location added:', response.data);
                setLocations([...bases, response.data]);
                setNewLocationName('');
                setNewLocationAddress('');
                setNewLocationDescribe('');
                setNewLocationAccount('');
                setShowModal(false);
                setIsAddingLocation(true);
            } catch (error) {
                console.error('Error adding new location:', error);
            }
        }
    };

    const baseUrl = 'https://c2se-14-sts-api.onrender.com/api/locations'; // URL cơ sở của API

    const handleDeleteLocation = (id) => {
        // Gọi API để xóa cơ sở
        fetch(`${baseUrl}/${id}`, { // Sử dụng baseUrl và thêm locationId vào URL
            method: 'DELETE',
        })
            .then(response => {
                if (response.ok) {
                    setLocations(bases.filter(base => base.id !== id));
                    toast.success('Cơ sở đã được xóa thành công.', { autoClose: 3000 });
                } else {
                    toast.error('Đã xảy ra lỗi khi xóa cơ sở.', { autoClose: 3000 });
                }
            })
            .catch(error => console.error('Error deleting base:', error));
    };

    const handleSaveChanges = () => {
        // Thực hiện các thay đổi và lưu vào cơ sở dữ liệu
        // Không cần gọi API ở đây vì đã thực hiện gọi API khi thêm hoặc sửa cơ sở
        toast.success('Thay đổi đã được lưu thành công.', { autoClose: 3000 });
    };

    const displayedData = bases.slice(startIndex, endIndex);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className="bg-white w-full h-full px-8">
            <div className="grid grid-cols-12 gap-10">
                <div className="col-span-2">
                    <div className=" w-[300px] border border-white">
                        <Sidebar />
                    </div>
                </div>
                <div className="col-span-10 bg-[#F5F5F5] ml-10 p-5 flex flex-col justify-between">
                    <div className="items-start w-[1110px] bg-white mx-auto p-4">
                        <div className="flex items-center  mb-8">
                            <div className="button rounded-full text-center bg-[#F9FBFF] items-center justify-center w-[60px] h-[30px] p-1 mr-2">
                                <Link to='/admin/manager-account'>
                                    <FontAwesomeIcon icon={faArrowLeft} />
                                </Link>
                            </div>
                            <h1 className="text-2xl font-bold">Danh Sách Cơ Sở </h1>
                        </div>
                        <div className="mb-4 flex">
                            <button
                                className="px-4 w-[150px] py-2 bg-[#212143] text-white rounded ml-2 hover:bg-blue-600"
                                onClick={() => setShowModal(true)}
                            >
                                Thêm cơ sở
                            </button>
                        </div>
                        {showModal && (
                            <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center">
                                <div className="bg-white w-[500px] p-4 rounded">
                                    <h2 className="text-lg font-semibold mb-2">{isAddingLocation ? 'Thêm cơ sở mới' : 'Chỉnh sửa cơ sở'}</h2>
                                    <label className="block mb-2">
                                        Tên cơ sở:
                                        <input
                                            type="text"
                                            className="w-full p-2 border rounded"
                                            placeholder="Tên cơ sở..."
                                            value={newLocationName}
                                            onChange={(e) => setNewLocationName(e.target.value)}
                                        />
                                    </label>
                                    <label className="block mb-2">
                                        Địa chỉ:
                                        <input
                                            type="text"
                                            className="w-full p-2 border rounded"
                                            placeholder="Địa chỉ..."
                                            value={newLocationAddress}
                                            onChange={(e) => setNewLocationAddress(e.target.value)}
                                        />
                                    </label>
                                    <label className="block mb-2">
                                        Mô tả:
                                        <input
                                            type="text"
                                            className="w-full p-2 border rounded"
                                            placeholder="Mô tả..."
                                            value={newLocationDescribe}
                                            onChange={(e) => setNewLocationDescribe(e.target.value)}
                                        />
                                    </label>
                                    <label className="block mb-2">
                                        Email:
                                        <input
                                            type="text"
                                            className="w-full p-2 border rounded"
                                            placeholder="Email..."
                                            value={newLocationAccount}
                                            onChange={(e) => setNewLocationAccount(e.target.value)}
                                        />
                                    </label>
                                    {!isAddingLocation && ( // Render price input only when editing
                                        <label className="block mb-2">
                                            Giá tiền:
                                            <input
                                                type="number"
                                                className="w-full p-2 border rounded"
                                                placeholder="Giá tiền..."
                                                value={editLocation ? editLocation.price : ''}
                                                onChange={(e) => setEditLocation({...editLocation, price: e.target.value})}
                                            />
                                        </label>
                                    )}
                                    <div className="flex justify-end">
                                        <button
                                            className="px-4 py-2 bg-green-500 text-white rounded mr-2 hover:bg-blue-600"
                                            onClick={handleAddLocation}
                                        >
                                            {isAddingLocation ? 'Thêm' : 'Lưu'}
                                        </button>
                                        <button
                                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                            onClick={() => setShowModal(false)}
                                        >
                                            Đóng
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        <table className="w-full text-left border-collapse border">
                            <thead>
                            <tr className="bg-gray-200">
                                <th className="p-2 border">STT</th>
                                <th className="p-2 border">Tên cơ sở</th>
                                <th className="p-2 border">Địa chỉ</th>
                                <th className="p-2 border">Mô tả</th>
                                <th className="p-2 border">Email</th>
                                <th className="p-2 border">Giá tiền</th>
                                <th className="p-2 border">Hành động</th>
                            </tr>
                            </thead>
                            <tbody className="text-left">
                            {bases.map((base, index) => (
                                <tr key={base.id}>
                                    <td className="p-2 border">{index + 1}</td>
                                    <td className="p-2 border">{base.location_name}</td>
                                    <td className="p-2 border">{base.user_id}</td>
                                    <td className="p-2 border">{base.status_text}</td>
                                    <td className="p-2 border text-blue-700">{base.email}</td>
                                    <td className="p-2 border">
                                        <input
                                            type="number"
                                            className="w-24 p-1 border rounded"
                                            value={base.cost}
                                            onChange={(e) => setEditLocation({...base, cost: e.target.value})}
                                        />
                                    </td>
                                    <td className="p-2 border">
                                        <button
                                            className="px-4 py-2 bg-red-600 text-white rounded mr-2 hover:bg-red-400"
                                            onClick={() => handleDeleteLocation(base.id)}
                                        >
                                            Xóa
                                        </button>
                                        <button
                                            className="px-4 py-2 bg-[#212143] text-white rounded mr-2 hover:bg-blue-600"
                                            onClick={() => handleEditLocation(base)}
                                        >
                                            <FontAwesomeIcon icon={faEdit} /> Sửa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>

                        </table>
                        <div className="border items-end border-white ">
                            <Pagination currentPage={currentPage} onPageChange={handlePageChange} />
                        </div>
                        <div className="mx-4 items-end">
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

export default LocationList;
