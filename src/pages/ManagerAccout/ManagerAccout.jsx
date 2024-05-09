import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faBuildingColumns, faAddressBook,faTimes } from "@fortawesome/free-solid-svg-icons";
import Sidebar from "../../components/Siderbar/Siderbar";
import Pagination from "../../components/Pagination/Pagination";
import { Link } from "react-router-dom";

const ManageUserAccount = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [showAddAccountPage, setShowAddAccountPage] = useState(false);
    const [newAccountData, setNewAccountData] = useState({
        email: "",
        password: "",
        role: "",
    });
    const [roles, setRoles] = useState([]);
    useEffect(() => {
        axios.get("https://c2se-14-sts-api.onrender.com/api/roleName")
            .then(response => {
                setRoles(response.data);
            })
            .catch(error => {
                console.error('Error fetching roles:', error);
            });
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
            const response = await axios.post("https://c2se-14-sts-api.onrender.com/api/users", newAccountData);
            console.log("Tài khoản đã được tạo thành công:", response.data);
            setShowAddAccountPage(false);
            setNewAccountData({
                email: "",
                password: "",
                role: "",
            });
        } catch (error) {
            console.error("Lỗi khi tạo tài khoản mới:", error);
        }
    };

    return (
        <div className="bg-[#F3F7FA] w-full h-full p-8">
            <div className="grid grid-cols-12 gap-10">
                <div className="col-span-2 w-[290px] h-max">
                    <div className="border border-white">
                        <Sidebar />
                    </div>
                </div>
                <div className=" ml-24 col-span-10">
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
                                <label className="block text-sm font-medium text-gray-700">Mật khẩu:</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={newAccountData.password}
                                    onChange={handleInputChange}
                                    className="mt-1 p-2 border rounded w-full"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Vai trò:</label>
                                <select
                                    name="role"
                                    value={newAccountData.role}
                                    onChange={handleInputChange}
                                    className="mt-1 p-2 border rounded w-full"
                                >
                                    <option value="">Chọn vai trò</option>
                                    {roles.map(role => (
                                        <option key={role.id} value={role.id}>{role.name}</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                onClick={handleSaveNewAccount}
                                className="py-2 px-4 bg-green-500 hover:bg-green-700 text-white rounded mr-2"
                            >
                                Lưu
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

                    <div className="bg-[#ffff] border border-white p-2 rounded-lg">
                            <div className="mx-auto border border-white p-2">
                                <div className="App p-2 flex items-center justify-between">
                                    <div style={{ textAlign: "left" }}>
                                        <h1>Danh sách người dùng</h1>
                                        <i className="text-green-700 py-4" style={{ width: "20%" }}>Active Members</i>
                                    </div>
                                    <div className="search-box flex bg-[#F9FAFB] w-[500px] h-[45px] border border-black rounded-s-2xl px-4">
                                        <input
                                            className="search-input w-9/12 font-bold outline-none bg-transparent pl-2"
                                            type="text"
                                            placeholder="Tìm kiếm theo họ và tên hoặc tên người dùng..."
                                            value={searchTerm}
                                            onChange={handleSearch}
                                        />
                                    </div>
                                    <div className="bg-[#212143] border border-black rounded-e-2xl">
                                        <button className="search-button text-lg p-1 w-[120px] h-[45px] text-white ml-2 ">
                                            <FontAwesomeIcon icon={faSearch} /> Tìm kiếm
                                        </button>
                                    </div>
                                    <div className="bg-[#212143] border mx-2 border-black rounded ">
                                        <button className="search-button p-1 text-lg w-[180px] h-[45px] text-white"
                                                onClick={handleAddAccountClick}>
                                            <FontAwesomeIcon icon={faAddressBook} className="mx-1" /> Thêm tài khoản
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="w-auto mx-4 h-full text-left bg-white rounded-lg shadow-lg py-10">
                                <table className="min-w-full border-collapse w-full">
                                    <thead>
                                    <tr className="text-gray-500">
                                        <th className="py-2 px-3 border-t text-black border-gray-300 bg-white">STT</th>
                                        <th className="py-2 px-3 border-t text-black border-gray-300 bg-white">Họ và tên</th>
                                        <th className="py-2 px-3 border-t text-black border-gray-300 bg-white">Email</th>
                                        <th className="py-2 px-3 border-t text-black border-gray-300 bg-white">Vai trò</th>
                                        <th className="py-2 px-3 border-t text-black border-gray-300 bg-white">Số dư</th>
                                        <th className="py-2 px-3 border-t text-black border-gray-300 bg-white">Tổng giao dịch</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {filteredUsers.map((user, index) => (
                                        <tr key={index} className="text-gray-500">
                                            <td className="py-2 px-3 border-t text-black border-gray-300 bg-white">{index + 1}</td>
                                            <td className="py-2 px-3 text-blue-600  bg-white border-b border-gray-300">
                                                <Link className="" to={`/admin/detail-account/${user.user_id}`}>
                                                    {user.full_name}
                                                </Link>
                                            </td>

                                            <td className="py-2 px-3 border-t text-gray-900 border-gray-300 bg-white">{user.email}</td>
                                            <td className="py-2 px-3 border-t text-gray-900 border-gray-300 bg-white">{user.role_name}</td>
                                            <td className="py-2 px-3 border-t text-gray-900 border-gray-300 bg-white">
                                                {formatCurrency(user.wallet.toLocaleString('vi-VN'))}
                                            </td>
                                            <td className="py-2 px-14 text-red-500 text-2xl border-t border-gray-300 bg-white">
                                                <Link to={`/transaction-history/${user.user_id}`}>
                                                    <FontAwesomeIcon icon={faBuildingColumns} />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="border border-white py-8">
                                <Pagination currentPage={currentPage} onPageChange={handlePageChange} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageUserAccount;
