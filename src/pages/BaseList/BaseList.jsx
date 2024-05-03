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
    const [baseIndex, setBaseIndex] = useState(1);
    const [bases, setBases] = useState([]);
    const [newBaseName, setNewBaseName] = useState('');
    const [newBaseCost, setNewBaseCost] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [emails, setEmails] = useState([]); // State lưu danh sách email
    const [showModal, setShowModal] = useState(false); // State để hiển thị modal
    const [newLocationInfo, setNewLocationInfo] = useState({
        name: '',
        account: '',
        cost: ''
    });

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
                    status: base.status,
                    note: base.note
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

    const handleNoteChange = (id, note) => {
        setBases(
            bases.map(base =>
                base.id === id ? { ...base, note: note } : base
            )
        );
    };
   
    // Hàm để mở modal
    const openModal = () => {
        setShowModal(true);
    };

    // Hàm để đóng modal và xóa thông tin cơ sở mới
    const closeModal = () => {
        setShowModal(false);
        setNewLocationInfo({
            name: '',
            account: '',
            cost: ''
        });
    };

    // Hàm để cập nhật thông tin của cơ sở mới
    const handleNewLocationInfoChange = (event) => {
        const { name, value } = event.target;
        setNewLocationInfo(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    // Hàm để lưu thông tin của cơ sở mới
   // Hàm để lưu thông tin của cơ sở mới
const handleSaveNewLocation = () => {
    // Kiểm tra xem tên cơ sở và tài khoản có được cung cấp không
    if (!newLocationInfo.name || !newLocationInfo.account || !newLocationInfo.cost) {
        // Hiển thị thông báo lỗi nếu tên cơ sở hoặc tài khoản không được cung cấp
        toast.error('Vui lòng nhập đủ thông tin *', { autoClose: 3000 });
        return;
    }

    // Thực hiện lưu dữ liệu nếu tất cả thông tin được cung cấp
    // Nếu trường note không có giá trị, đặt giá trị là null
    const dataToSave = {
        ...newLocationInfo,
        note: newLocationInfo.note || null
    };

    axios.post('https://c2se-14-sts-api.onrender.com/api/locations', dataToSave)
        .then(response => {
            // Hiển thị thông báo thành công khi lưu dữ liệu thành công
            toast.success('Lưu thành công.', { autoClose: 3000 });
            // Đóng modal sau khi lưu thành công
            closeModal();

            // Sau khi thêm mới thành công, gọi lại API để lấy danh sách cơ sở cập nhật
            axios.get('https://c2se-14-sts-api.onrender.com/api/locations')
                .then(response => {
                    // Xử lý dữ liệu trước khi đặt vào state
                    const modifiedData = response.data.map(base => ({
                        id: base.location_id,
                        name: base.location_name,
                        account: base.user_id,
                        cost: base.cost,
                        status: base.status,
                        note: base.note
                    }));
                    // Cập nhật state bases với danh sách cơ sở mới
                    setBases(modifiedData);
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                    toast.error('Error fetching data. Please try again later.', { autoClose: 3000 });
                });
        })
        .catch(error => {
            // Hiển thị thông báo lỗi nếu có lỗi khi lưu dữ liệu
            toast.error('Lỗi khi lưu dữ liệu. Vui lòng thử lại sau.', { autoClose: 3000 });
            console.error('Lỗi khi lưu dữ liệu:', error);
        });
};

    

    const handleSaveChanges = () => {
        console.log('Changes saved successfully:', bases); // Hiển thị thông tin lưu ra console
    
        // Tạo một mảng promises chứa các promise cho mỗi yêu cầu cập nhật
        const updatePromises = bases.map(base => {
            // Truy cập các trường thông tin cần thay đổi từ base
            const { id, name, account, cost, status, note } = base;
    
            // Dữ liệu cần gửi đến API để cập nhật
            const dataToUpdate = {
                name: name, // hoặc chỉ cần viết name vì tên biến và tên trường giống nhau
                account: account,
                cost: cost,
                status: status,
                note : note
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

    const openNoteModal = (id) => {
        // Tìm cơ sở có id tương ứng
        const baseToUpdate = bases.find(base => base.id === id);
        if (baseToUpdate) {
            // Cập nhật thông tin cơ sở cần nhập ghi chú
            setNewLocationInfo({
                id: baseToUpdate.id,
                name: baseToUpdate.name,
                note: baseToUpdate.note // Đặt giá trị ban đầu cho ghi chú từ cơ sở hiện có
            });
            // Mở modal
            setShowModal(true);
        }
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
                        <button 
                                className="ml-auto bg-green-500 hover:bg-green-700 text-white font-bold mb-8  py-2 px-4 rounded"
                                onClick={openModal} // Khi nhấn vào nút "+ New Location" mở modal
                            >
                                + Cơ sở mới
                        </button>
                        <table className=" mb-4 p-4 w-full border-collapse border">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="p-2 border w-1/6">STT</th>
                                    <th className="p-2 border w-1/6">Cơ sở</th>
                                    <th className="p-2 border w-1/6">Ghi chú</th>
                                    <th className="p-2 border w-1/6">Tài khoản</th>
                                    <th className="p-2 border w-1/6">Chi phí</th>
                                    <th className="p-2 border w-1/6">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody className="text-center">
                                {bases.map((base, index) => (
                                    <tr key={base.id}>
                                        <td className="p-2 border">{baseIndex + index}</td>
                                        <td className="p-2 border">
                                            <input
                                                type="text"
                                                value={base.name}
                                                onChange={(e) => handleNameChange(base.id, e.target.value)}
                                            />
                                        </td>
                                        <td className="p-2 border">
                                            {/* Thay đổi kích thước cột và cho phép xuống dòng */}
                                            <input
                                                type="text"
                                                value={base.note}
                                                onChange={(e) => handleNoteChange(base.id, e.target.value)}
                                                
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
                                                style={{ width: 60, wordWrap: "break-word" }}
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
                                Lưu thay đổi
                            </button>
                        </div>
                    </div>
                    <div>
                        <ToastContainer />
                    </div>
                </div>
            </div>
         {/* Modal */}
         {showModal && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="bg-white w-1/3 p-8">
                            <h2 className="text-xl font-bold mb-4">Cơ sở mới</h2>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">*Tên Cơ Sở:</label>
                                <input 
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                                    type="text"
                                    name="name"
                                    value={newLocationInfo.name}
                                    onChange={handleNewLocationInfoChange}
                                />
                            </div>
                            <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2 mt-4">Ghi Chú:</label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                type="text"
                                value={newLocationInfo.note}
                                name="note"
                                onChange={handleNewLocationInfoChange}
                            />
                            </div>
                            <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">*Tài Khoản:</label>
                            <select
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                                    type="number"
                                    name="cost"
                                    value={newLocationInfo.cost}
                                    onChange={handleNewLocationInfoChange}
                                />
                            </div>
                            <div className="flex justify-end">
                                <button 
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
                                    onClick={handleSaveNewLocation} // Khi nhấn vào nút lưu, lưu thông tin và đóng modal
                                >
                                    Lưu
                                </button>
                                <button 
                                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                                    onClick={closeModal} // Khi nhấn vào nút hủy, đóng modal
                                >
                                    Hủy
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BaseList;
