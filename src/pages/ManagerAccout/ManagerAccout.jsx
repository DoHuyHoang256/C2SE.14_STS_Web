import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faBuildingColumns, faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import Sidebar from "../../components/Siderbar/Siderbar";
import Pagination from "../../components/Pagination/Pagination";
import { Link } from "react-router-dom";

const ManageUserAccount = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        axios.get("https://c2se-14-sts-api.onrender.com/api/allInfo")
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
    }, []); 

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    }

    // Hàm để loại bỏ dấu từ chuỗi
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
                                    <h1>Danh sách người dùng</h1>
                                    <i className="text-green-700 py-4" style={{ width: "20%" }}>Active Members</i>
                                </div>
                                <div className="search-box flex bg-[#F9FAFB] w-[700px] h-[45px] border border-black rounded-s-2xl px-4">
                                    <input
                                        className="search-input w-9/12 font-bold outline-none bg-transparent pl-2"
                                        type="text"
                                        placeholder="Tìm kiếm theo họ và tên hoặc tên người dùng..."
                                        value={searchTerm}
                                        onChange={handleSearch}
                                    />
                                </div>
                                <div className="bg-[#212143] border border-black rounded-e-2xl">
                                    <button className="search-button p-1 w-[105px] h-[45px] text-white">
                                        <FontAwesomeIcon icon={faSearch} /> Tìm kiếm
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="w-auto mx-4 h-full text-left bg-white rounded-lg shadow-lg py-10">
                            <table className="min-w-full border-collapse w-full">
                                <thead>
                                    <tr className="text-gray-500">
                                        <th className="py-2 px-3 border-t text-black border-gray-300 bg-white">Họ và tên</th>
                                        <th className="py-2 px-3 border-t text-black border-gray-300 bg-white">Email</th>
                                        <th className="py-2 px-3 border-t text-black border-gray-300 bg-white">Vai trò</th>
                                        <th className="py-2 px-3 border-t text-black border-gray-300 bg-white">Tổng số dư</th>
                                        <th className="py-2 px-3 border-t text-black border-gray-300 bg-white">Lịch sử giao dịch</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user, index) => (
                                        <tr key={index} className="text-gray-500">

                                            <td className="py-2 px-3 border-t text-gray-700 border-gray-300 bg-white">
                                                <Link to={`/admin/detail-account/${user.user_id}`}>{user.full_name}</Link></td>
                                            <td className="py-2 px-3 border-t border-gray-300 bg-white">{user.email}</td>
                                            <td className="py-2 px-3 border-t border-gray-300 bg-white">{user.role_name} </td>
                                            <td className="py-2 px-3 border-t border-gray-300 bg-white">{user.user_code} VND</td>
                                            <td className="py-2 px-14 text-red-500 text-2xl border-t border-gray-300 bg-white">
                                                <Link to={`/transaction-history/${user.user_id}`}>
                                                    <FontAwesomeIcon icon={faBuildingColumns} />
                                                </Link>
                                            </td>
                                            {/*<td className="py-2 px-8 text-xl border-t border-gray-300 bg-white">*/}
                                            {/*<Link to={`/admin/detail-account/${user.user_id}`}>*/}
                                            {/*    <FontAwesomeIcon icon={faCircleInfo} />*/}
                                            {/*</Link>*/}
                                            {/*</td>*/}
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

export default ManageUserAccount;
