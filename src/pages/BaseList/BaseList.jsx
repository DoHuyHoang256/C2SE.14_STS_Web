import React, { useState, useEffect } from 'react';
import Sidebar from "../../components/Siderbar/Siderbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Pagination from "../../components/Pagination/Pagination";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './BaseList.css';
import axios from 'axios';

const BaseList = () => {
    const [baseIndex, setBaseIndex] = useState(1);
    const [bases, setBases] = useState([]);
    const [newBaseName, setNewBaseName] = useState('');
    const [newBaseCost, setNewBaseCost] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [emails, setEmails] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newLocationInfo, setNewLocationInfo] = useState({
        name: '',
        account: '',
        cost: ''
    });
    const [isOverlayVisible, setIsOverlayVisible] = useState(false); // State để kiểm soát việc hiển thị overlay

    useEffect(() => {
        // Lấy danh sách cơ sở từ API khi component được render
        fetch('https://c2se-14-sts-api.onrender.com/api/locations')
            .then(response => response.json())
            .then(data => {
                const modifiedData = data.map(base => ({
                    id: base.location_id,
                    name: base.location_name,
                    account: base.user_id,
                    cost: base.cost,
                    status: base.status,
                    note: base.note
                }));
                setBases(modifiedData);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                toast.error('Error fetching data. Please try again later.', { autoClose: 3000 });
            });

        // Lấy danh sách email từ API
        fetch('https://c2se-14-sts-api.onrender.com/api/email')
            .then(response => response.json())
            .then(data => {
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

    const handleNoteChange = (id, note) => {
        setBases(
            bases.map(base =>
                base.id === id ? { ...base, note: note } : base
            )
        );
    };

    const openModal = () => {
        setShowModal(true);
        setIsOverlayVisible(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setIsOverlayVisible(false);
        setNewLocationInfo({
            name: '',
            account: '',
            cost: ''
        });
    };

    const handleNewLocationInfoChange = (event) => {
        const { name, value } = event.target;
        setNewLocationInfo(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSaveNewLocation = () => {
        if (!newLocationInfo.name || !newLocationInfo.account || !newLocationInfo.cost) {
            toast.error('Vui lòng nhập đủ thông tin *', { autoClose: 3000 });
            return;
        }

        const dataToSave = {
            ...newLocationInfo,
            note: newLocationInfo.note || null
        };

        axios.post('https://c2se-14-sts-api.onrender.com/api/locations', dataToSave)
            .then(response => {
                toast.success('Lưu thành công.', { autoClose: 3000 });
                closeModal();

                axios.get('https://c2se-14-sts-api.onrender.com/api/locations')
                    .then(response => {
                        const modifiedData = response.data.map(base => ({
                            id: base.location_id,
                            name: base.location_name,
                            account: base.user_id,
                            cost: base.cost,
                            status: base.status,
                            note: base.note
                        }));
                        setBases(modifiedData);
                    })
                    .catch(error => {
                        console.error('Error fetching data:', error);
                        toast.error('Error fetching data. Please try again later.', { autoClose: 3000 });
                    });
            })
            .catch(error => {
                toast.error('Lỗi khi lưu dữ liệu. Vui lòng thử lại sau.', { autoClose: 3000 });
                console.error('Lỗi khi lưu dữ liệu:', error);
            });
    };

    const handleSaveChanges = () => {
        const updatePromises = bases.map(base => {
            const { id, name, account, cost, status, note } = base;
            const dataToUpdate = {
                name: name,
                account: account,
                cost: cost,
                status: status,
                note : note
            };
            return axios.patch('https://c2se-14-sts-api.onrender.com/api/locations/' + id, dataToUpdate);
        });
        Promise.all(updatePromises)
            .then(responses => {
                toast.success('Lưu thay đổi thành công !.', { autoClose: 3000 });
            })
            .catch(error => {
                toast.error('Lưu thay đổi thất bại !', { autoClose: 3000 });
                console.error('Error saving changes:', error);
            });
    };

    return (
        <div className="bg-white w-full h-full px-8 relative">
            {isOverlayVisible && <div className="fixed inset-0 bg-black opacity-50 z-50"></div>}
            <div className="grid w-full grid-cols-12 gap-10">
                <div className="w-[290px] col-span-2">
                    <div className="border border-white">
                        <Sidebar />
                    </div>
                </div>
                <div className="col-span-10 ml-5 w-full bg-[#F5F5F5] p-5 flex flex-col justify-between relative">
                    <div className="items-start ml-2 bg-white w-full h-full p-4">
                        <div className="flex items-center mb-8">
                            <h1 className="text-2xl font-bold">Danh Sách Cơ Sở </h1>
                        </div>
                        <button
                            className="ml-auto text-lg bg-[#212143] hover:bg-blue-900 text-white font-bold mb-8 py-2 px-4 rounded"
                            onClick={openModal}
                        >
                            + Thêm cơ sở
                        </button>
                        <table className="text-left text-lg mb-4 ml-2 p-4 w-full border-collapse border">
                            <thead>
                            <tr className="bg-gray-200 ">
                                <th className="p-2 border">STT</th>
                                <th className="p-2 border">Cơ sở</th>
                                <th className="p-2 border">Ghi chú</th>
                                <th className="p-2 border">Tài khoản</th>
                                <th className="p-2 border">Chi phí</th>
                                <th className="p-2 border">
                                    <div className="flex items-center justify-center w-24"> {/* Đổi giá trị của w-24 thành kích thước mong muốn */}
                                        Trạng thái
                                    </div>
                                </th>
                            </tr>
                            </thead>
                            <tbody className="text-left">
                            {bases.map((base, index) => (
                                <tr key={base.id}>
                                    <td className="p-2 border">{baseIndex + index}</td>
                                    <td className="p-2 border">
                                        <input
                                            type="text"
                                            value={base.name}
                                            onChange={(e) => handleNameChange(base.id, e.target.value)}
                                            className="input w-full py-2 px-3"
                                        />
                                    </td>
                                    <td className="p-2 border">
                                        <input
                                            type="text"
                                            value={base.note}
                                            onChange={(e) => handleNoteChange(base.id, e.target.value)}
                                            className="input w-full py-2 px-3"
                                        />
                                    </td>
                                    <td className="p-2 border">
                                        <select
                                            value={base.account}
                                            onChange={(e) => handleAccountChange(base.id, e.target.value)}
                                            className="input w-full py-2 px-3"
                                        >
                                            {emails.map((email) => (
                                                <option className="text-blue-700" key={email.user_id} value={email.user_id}>
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
                                            className="input w-full py-2 px-3"
                                        />
                                    </td>
                                    <td className="p-2  text-center">
                                        <label className="switch">
                                            <input type="checkbox" checked={base.status} onChange={() => handleToggleStatus(base.id)} className="switch-input" />
                                            <span className="slider"></span>
                                        </label>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        <div className="border items-end border-white py-3">
                            <button className="bg-green-500 text-lg hover:bg-green-700 text-white font-bold py-2 px-4 rounded" onClick={handleSaveChanges}>
                                Lưu thay đổi
                            </button>
                        </div>
                    </div>
                    <div>
                        <ToastContainer />
                    </div>
                </div>
            </div>
            {showModal && (
                <div className="fixed z-50 inset-0 overflow-y-auto flex items-center justify-center">
                    <div className="bg-white w-[550px] p-8">
                        <h2 className="text-xl font-bold mb-4">Cơ sở mới</h2>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">*Tên Cơ Sở:</label>
                            <input
                                className="input"
                                type="text"
                                name="name"
                                value={newLocationInfo.name}
                                onChange={handleNewLocationInfoChange}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2 mt-4">Ghi Chú:</label>
                            <input
                                className="input"
                                type="text"
                                value={newLocationInfo.note}
                                name="note"
                                onChange={handleNewLocationInfoChange}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">*Tài Khoản:</label>
                            <select
                                className="input"
                                name="account"
                                value={newLocationInfo.account}
                                onChange={handleNewLocationInfoChange}
                            >
                                <option disabled selected value="">
                                    Chọn tài khoản email đăng nhập
                                </option>
                                {emails.map((email) => (
                                    <option key={email.user_id} value={email.user_id}>
                                        {email.email}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">*Chi Phí:</label>
                            <input
                                className="input"
                                type="number"
                                name="cost"
                                value={newLocationInfo.cost}
                                onChange={handleNewLocationInfoChange}
                            />
                        </div>
                        <div className="flex justify-end">
                            <button
                                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
                                onClick={handleSaveNewLocation}
                            >
                                Lưu
                            </button>
                            <button
                                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                                onClick={closeModal}
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BaseList;
