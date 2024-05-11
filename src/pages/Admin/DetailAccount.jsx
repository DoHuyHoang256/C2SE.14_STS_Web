import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useParams } from 'react-router-dom';
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { Spinner } from "@material-tailwind/react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Sidebar from "../../components/Siderbar/Siderbar";
import { format } from 'date-fns';

const DetailUserAccount = () => {
    const [detailUser, setDetailUser] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [roles, setRoles] = useState([]);
    const [genders, setGenders] = useState([]);
    const [editedDateOfBirth, setEditedDateOfBirth] = useState(null);
    const [selectedRoleId, setSelectedRoleId] = useState('');
    const [selectedGenderId, setSelectedGenderId] = useState('');
    const [editedUser, setEditedUser] = useState({
        email: '',
        fullName: '',
        phoneNumber: '',
        userCode: '',
        address: '',
    });

    const { userId } = useParams();

    useEffect(() => {
        const fetchUserDetail = async () => {
            try {
                const response = await axios.get(`https://c2se-14-sts-api.onrender.com/api/users/${userId}`);
                const data = response.data;
                setDetailUser(data);
                setEditedUser({
                    email: data.email,
                    fullName: data.full_name,
                    phoneNumber: data.phone_number,
                    userCode: data.user_code,
                    address: data.address,
                });
                setSelectedGenderId(data.gender);
                setSelectedRoleId(data.role);
                setEditedDateOfBirth(new Date(data.date_of_birth));
                setLoading(false);
            } catch (error) {
                setError(error.message);
                setLoading(false);
            }
        };

        fetchUserDetail();
    }, [userId]);

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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedUser((prevUser) => ({
            ...prevUser,
            [name]: value,
        }));
    };

    const deleteUserAccount = async () => {
        try {
            const response = await axios.delete(`https://c2se-14-sts-api.onrender.com/api/users/${userId}`);

            if (response.status === 200) {
                console.log("Tài khoản đã được xóa thành công!");
            } else {
                console.error("Xóa tài khoản không thành công. Mã lỗi:", response.status);
            }
        } catch (error) {
            console.error("Lỗi khi xóa tài khoản:", error);
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
    

    const handleDateOfBirthChange = (date) => {
        setEditedDateOfBirth(date);
    };

    const handleSaveChanges = async () => {
        try {
            const formattedDate = format(editedDateOfBirth, 'yyyy-MM-dd\'T\'HH:mm:ss.SSSxxx');
            const response = await axios.put(`https://c2se-14-sts-api.onrender.com/users/${userId}`, {
                email: editedUser.email,
                full_name: editedUser.fullName,
                phone_number: editedUser.phoneNumber,
                user_code: editedUser.userCode,
                address: editedUser.address,
                gender: selectedGenderId,
                role: selectedRoleId,
                date_of_birth: formattedDate,
            });

            console.log("Save changes success:", response.data);
        } catch (error) {
            console.error("Error saving changes:", error);
        }
    };

    const handleAddressChange = (e) => {
        const addressInput = e.target.value;
        const addressParts = addressInput.split(" ");
        const rearrangedAddressParts = [
            addressParts[0] || '',
            addressParts[1] || '',
            addressParts[2] || '',
            addressParts[3] || '',
            addressParts[4] || '',
        ];

        const rearrangedAddress = rearrangedAddressParts.join(" ").trim();
        setEditedUser((prevUser) => ({
            ...prevUser,
            address: rearrangedAddress,
        }));
    };

    if (loading) {
        return <Spinner color="blue" />;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="grid mx-16 bg-white grid-cols-12 gap-4">
            <div className=" w-[300px] col-span-12 lg:col-span-3 mx-4">
                <Sidebar />
            </div>

            <div className="col-span-12 lg:col-span-9 w-[1000px] p-6 bg-white rounded-lg shadow-lg">
                <div className="flex items-center mb-4">
                    <div className="button rounded-full text-center bg-[#F9FBFF] items-center justify-center w-[60px] h-[30px] p-1 mr-2">
                        <Link to='/admin/manager-account'>
                            <FontAwesomeIcon icon={faArrowLeft} />
                        </Link>
                    </div>
                    <h1 className="text-2xl font-bold">Thông tin chi tiết</h1>
                </div>
                <div className="mb-4 flex flex-col items-center">
                    <img
                        src={detailUser.avatar || "https://vnn-imgs-a1.vgcloud.vn/image1.ictnews.vn/_Files/2020/03/17/trend-avatar-1.jpg"}
                        alt="avatar"
                        className="w-24 h-24 object-cover border-2 rounded-full"
                    />
                    <input type="file" hidden />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                    <div className="col-span-1 w-[300px]">
                        <div className="mb-4">
                            <label className="block  font-bold text-gray-700 mb-2">Họ và tên:</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded mb-2"
                                value={editedUser.fullName}
                                onChange={handleInputChange}
                                name="fullName"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block  font-bold text-gray-700 mb-2">Email:</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded mb-2"
                                value={editedUser.email}
                                onChange={handleInputChange}
                                name="email"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block  font-bold text-gray-700 mb-2">Ngày sinh:</label>
                            <DatePicker
                                selected={editedDateOfBirth}
                                onChange={handleDateOfBirthChange}
                                dateFormat="dd/MM/yyyy"
                                className="w-[300px] p-2 border rounded mb-2"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block  font-bold text-gray-700 mb-2">Biển số:</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded mb-2"
                                value={editedUser.userCode}
                                onChange={handleInputChange}
                                name="userCode"
                            />
                        </div>

                    </div>

                    <div className="col-span-1 w-[400px]">
                        <div className="mb-4">
                            <label className="block  font-bold text-gray-700 mb-2">Số điện thoại:</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded mb-2"
                                value={editedUser.phoneNumber}
                                onChange={handleInputChange}
                                name="phoneNumber"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block  font-bold text-gray-700 mb-2">Giới tính:</label>
                            <select
                                className="w-full p-2 border rounded mb-2"
                                value={selectedGenderId}
                                onChange={handleGenderChange}
                            >
                                {genders.map((gender) => (
                                    <option key={gender.gender_id} value={gender.gender_id}>
                                        {gender.gender_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block  font-bold text-gray-700 mb-2">Địa chỉ:</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded mb-2"
                                value={editedUser.address}
                                onChange={handleAddressChange}
                                name="address"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block  font-bold text-gray-700 mb-2">Vai trò:</label>
                            <select
                                className="w-full p-2 border rounded mb-2"
                                value={selectedRoleId}
                                onChange={handleRoleChange}
                            >
                                {roles.map((role) => (
                                    <option key={role.role_id} value={role.role_id}>
                                        {role.role_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex justify-end space-x-2">
                    <button className="py-2 px-4 bg-red-500 hover:bg-red-700 text-white rounded" onClick={() => console.log('Khóa tài khoản')}>
                        Khóa tài khoản
                    </button>
                    <button
                        className="py-2 px-4 bg-green-500 hover:bg-green-700 text-white rounded"
                        onClick={handleSaveChanges}
                    >
                        Lưu thay đổi
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DetailUserAccount;
