import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faBuildingColumns, faAddressBook,faTimes } from "@fortawesome/free-solid-svg-icons";
import Sidebar from "../../components/Siderbar/Siderbar";
import Pagination from "../../components/Pagination/Pagination";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const ManageUserAccount = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [showAddAccountPage, setShowAddAccountPage] = useState(false);
    const [newAccountData, setNewAccountData] = useState({
        email: "",
        full_name: "",
        gender: "",
        phone_number: "",
        address: "",
        role: "",
    });
    const [roles, setRoles] = useState([]);
    const [selectedRoleId, setSelectedRoleId] = useState('');
    const [selectedGenderId, setSelectedGenderId] = useState('');
    const [genders, setGenders] = useState([]);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await axios.get('https://c2se-14-sts-api.onrender.com/api/roles');
                setRoles(response.data);
            } catch (error) {
                console.error('Error fetching roles:', error);
            }
        };

        fetchRoles();
    }, []);

    useEffect(() => {
        const fetchGenders = async () => {
            try {
                const response = await axios.get('https://c2se-14-sts-api.onrender.com/api/gender');
                setGenders(response.data);
            } catch (error) {
                console.error('Error fetching genders:', error);
            }
        };

        fetchGenders();
    }, []);

    useEffect(() => {
        axios.get(`https://c2se-14-sts-api.onrender.com/api/search?searchTerm=${searchTerm}&page=${currentPage}`)
            .then(response => {
                const userData = response.data.map(user => {
                    if (user.role) {
                        return axios.get(`https://c2se-14-sts-api.onrender.com/api/roleName/${user.role}`)
                            .then(roleResponse => {
                                return {
                                    ...user,
                                    role_name: roleResponse.data.role_name
                                };
                            })
                            .catch(error => {
                                console.error('Error fetching role name:', error);
                                return user;
                            });
                    } else {
                        return user;
                    }
                });
                Promise.all(userData).then(updatedUsers => {
                    setUsers(updatedUsers);
                });
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }, [searchTerm, currentPage]);

    function formatCurrency(value) {
        const roundedValue = Math.round(parseFloat(value) * 100) / 100;
        return roundedValue.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1);
    }

    const handlePageChange = (direction) => {
        if (direction === 'next') {
            setCurrentPage(prevPage => prevPage + 1);
        } else if (direction === 'prev' && currentPage > 1) {
            setCurrentPage(prevPage => prevPage - 1);
        }
    };

    const removeAccents = (str) => {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };

    const filteredUsers = users.filter(user =>
        removeAccents(user.full_name.toLowerCase()).includes(removeAccents(searchTerm.toLowerCase())) ||
        user.user_code.toLowerCase().includes(removeAccents(searchTerm.toLowerCase()))
    );

    const handleDetailClick = (userId) => {
        console.log(userId);
    };

    const handleAddAccountClick = () => {
        setShowAddAccountPage(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewAccountData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };



    const handleSaveNewAccount = async () => {
        try {
            // Xử lý logic thêm tài khoản
            const response = await axios.post("https://c2se-14-sts-api.onrender.com/api/usersAdmin", newAccountData);
            console.log("Tài khoản mới đã được tạo thành công:", response.data);
            setShowAddAccountPage(false);
            setNewAccountData({
                email: "",
                full_name: "",
                gender: "",
                phone_number: "",
                address: "",
                role: "",
            });
            // Refresh user list
            setCurrentPage(1);
            // Hiển thị thông báo thành công
            toast.success('Tài khoản mới đã được tạo thành công');
        } catch (error) {
            console.error("Lỗi khi tạo tài khoản mới:", error);
            // Hiển thị thông báo lỗi
            toast.error('Vui lòng nhập đủ thông tin');
        }
    };


    const handleRoleChange = (e) => {
        const selectedRoleId = e.target.value;
        setSelectedRoleId(selectedRoleId);
    };

    const handleGenderChange = (e) => {
        const selectedGenderId = e.target.value;
        setSelectedGenderId(selectedGenderId);
    };


    return (
        <div className="bg-[#F3F7FA] w-full h-full p-3">
            <ToastContainer />
        <div className="bg-[#F3F7FA] w-full h-full ">
            <div className="grid grid-cols-12 gap-10">
                <div className="ml-6 col-span-2 w-[290px] h-full mt-4">
                    <div className="border border-white">
                        <Sidebar />
                    </div>
                </div>
                <div className="col-span-10 ml-8 w-full p-4  bg-[#F3F7FA] mb-2 flex flex-col justify-between relative">
                    <div className="items-start bg-white w-full h-full p-2">
                    {showAddAccountPage ? (
                        <div className="bg-white p-8 rounded-lg w-[700px] shadow-lg relative">
                            <h2 className="text-lg font-semibold mb-4">Thêm tài khoản mới</h2>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Email:</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={newAccountData.email}
                                    onChange={handleInputChange}
                                    className="mt-1 p-2 border rounded w-full"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={newAccountData.full_name}
                                    onChange={handleInputChange}
                                    className="mt-1 p-2 border rounded w-full"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Giới tính:</label>
                                <select
                                    className="w-full p-2 border rounded mb-2"
                                    value={newAccountData.gender}
                                    onChange={handleInputChange}
                                    name="gender"
                                >
                                    <option value="">Chọn giới tính</option>
                                    {genders.map((gender) => (
                                        <option key={gender.gender_id} value={gender.gender_id}>
                                            {gender.gender_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Số điện thoại:</label>
                                <input
                                    type="text"
                                    name="phone_number"
                                    value={newAccountData.phone_number}
                                    onChange={handleInputChange}
                                    className="mt-1 p-2 border rounded w-full"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Địa chỉ:</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={newAccountData.address}
                                    onChange={handleInputChange}
                                    className="mt-1 p-2 border rounded w-full"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Vai trò:</label>
                                <select
                                    className="w-full p-2 border rounded mb-2"
                                    value={newAccountData.role}
                                    onChange={handleInputChange}
                                    name="role"
                                >
                                    <option value="">Chọn vai trò</option>
                                    {roles.map((role) => (
                                        <option key={role.role_id} value={role.role_id}>
                                            {role.role_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button
                                onClick={handleSaveNewAccount}
                                className="py-2 px-4 bg-green-500 hover:bg-green-700 text-white rounded mr-2"
                            >
                                Thêm tài khoản
                            </button>
                            <button
                                onClick={() => setShowAddAccountPage(false)}
                                className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 flex items-center"
                            >
                                <FontAwesomeIcon icon={faTimes} className="mr-2" />
                                Hủy
                            </button>
                        </div>
                    ) :(

                        <div className="mx-auto p-1">
                            <div className="bg-white p-4 rounded-lg shadow-lg">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="text-left">
                                        <h1 className="text-xl font-semibold">Danh sách người dùng</h1>
                                        <span className="text-green-700">Active Members</span>
                                    </div>
                                    <div className="flex items-center w-full max-w-3xl">
                                        <div className="flex bg-[#F9FAFB] border border-gray-300 rounded-l-lg flex-grow">
                                            <input
                                                className="w-full px-4 py-2 font-bold outline-none bg-transparent"
                                                type="text"
                                                placeholder="Tìm kiếm theo họ và tên hoặc tên người dùng..."
                                                value={searchTerm}
                                                onChange={handleSearch}
                                            />
                                        </div>
                                        <button className="px-4 py-2 bg-[#212143] text-white rounded-r-lg border border-gray-300 flex items-center">
                                            <FontAwesomeIcon icon={faSearch} className="mr-2" /> Tìm kiếm
                                        </button>
                                        <button
                                            className="ml-4 px-4 py-2 bg-[#212143] text-white rounded-lg border border-gray-300 flex items-center"
                                            onClick={handleAddAccountClick}
                                        >
                                            <FontAwesomeIcon icon={faAddressBook} className="mr-2" /> Thêm tài khoản
                                        </button>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full border-collapse">
                                        <thead>
                                        <tr className="bg-gray-200 text-gray-700">
                                            <th className="py-2 px-4 border text-left">STT</th>
                                            <th className="py-2 px-4 border text-left">Họ và tên</th>
                                            <th className="py-2 px-4 border text-left">Email</th>
                                            <th className="py-2 px-4 border text-left">Vai trò</th>
                                            <th className="py-2 px-4 border text-left">Số dư</th>
                                            <th className="py-2 px-4 border text-left">Lịch sử giao dịch</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {filteredUsers.map((user, index) => (
                                            <tr key={index} className="hover:bg-gray-100">
                                                <td className="py-2 px-4 border text-left">{index + 1}</td>
                                                <td className="py-2 px-4 border text-left text-blue-600">
                                                    <Link to={`/admin/detail-account/${user.user_id}`}>
                                                        {user.full_name}
                                                    </Link>
                                                </td>
                                                <td className="py-2 px-4 border text-left">{user.email}</td>
                                                <td className="py-2 px-4 border text-left">{user.role_name}</td>
                                                <td className="py-2 px-4 border text-left">{formatCurrency(user.wallet)}</td>
                                                <td className="py-2 px-4 border text-left text-center">
                                                    <Link to={`/transaction-history/${user.user_id}`} className="text-red-500 text-xl">
                                                        <FontAwesomeIcon icon={faBuildingColumns} />
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mt-4">
                                    <Pagination currentPage={currentPage} onPageChange={handlePageChange} />
                                </div>
                            </div>
                        </div>

                    )}
                </div>
            </div>

            </div>
        </div>
        </div>
    );
};

export default ManageUserAccount;
