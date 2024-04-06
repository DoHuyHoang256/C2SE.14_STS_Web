import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useParams } from 'react-router-dom';
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { Spinner } from "@material-tailwind/react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';



function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

const DetailUserAccount = () => {
    const [detailUser, setDetailUser] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [roles, setRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState('');
    const [editedEmail, setEditedEmail] = useState('');
    const [editedFullName, setEditedFullName] = useState('');
    const [editedPhoneNumber, setEditedPhoneNumber] = useState('');
    const [editedCode, setEditedCode] = useState('');
    const [editedAddress, setEditedAddress] = useState('' );
    const [genders, setGenders] = useState([]);
    const [selectedGender, setSelectedGender] = useState('');
    const [editedDateOfBirth, setEditedDateOfBirth] = useState('');
    const [selectedGenderId, setSelectedGenderId] = useState('');
    const [selectedRoleId, setSelectedRoleId] = useState('');


    const { userId } = useParams();

    useEffect(() => {
        const fetchUserDetail = async () => {
            try {
                const response = await axios.get(`https://c2se-14-sts-api.onrender.com/api/users/${userId}`);
                setDetailUser(response.data);
                setEditedEmail(response.data.email);
                setEditedFullName(response.data.full_name);
                setEditedDateOfBirth(response.data.date_of_birth);
                setEditedPhoneNumber(response.data.phone_number);
                setEditedCode(response.data.user_code);
                setEditedAddress(response.data.address);
                setSelectedGenderId(response.data.gender);
                setSelectedRoleId(response.data.role);
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
    
                // Tìm vai trò tương ứng với role_id của người dùng và gán cho selectedRole
                const userRole = roles.find(role => role.role_id === detailUser.role);
                if (userRole) {
                    setSelectedRole(userRole.role_name);
                }
            } catch (error) {
                console.error('Error fetching roles:', error);
            }
        };
    
        fetchRoles();
    }, [detailUser.role, roles]);

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
    }, []); // Sử dụng mảng rỗng để chỉ gọi API một lần khi component được mount
    
    useEffect(() => {
        // Tìm giới tính tương ứng với gender_id của người dùng và gán cho selectedGender
        const userGender = genders.find(gender => gender.gender_id === detailUser.gender);
        if (userGender) {
            setSelectedGender(userGender.gender_name);
        }
    }, [detailUser.gender, genders]); 
    

    const handleRoleChange = (e) => {
        setSelectedRole(e.target.value);
        const selectedRoleObject = roles.find(role => role.role_name === e.target.value);
        setSelectedRoleId(selectedRoleObject ? selectedRoleObject.role_id : '');
    };

    const handleGenderChange = (e) => {
        setSelectedGender(e.target.value);
        const selectedGenderObject = genders.find(gender => gender.gender_name === e.target.value);
        setSelectedGenderId(selectedGenderObject ? selectedGenderObject.gender_id : '');
    };

    const handleEmailChange = (e) => {
        setEditedEmail(e.target.value);
    };

    const handleFullNameChange = (e) => {
        setEditedFullName(e.target.value);
    };

    const handlePhoneNumberChange = (e) => {
        setEditedPhoneNumber(e.target.value);
    };

    const handleCodeChange = (e) => {
        setEditedCode(e.target.value);
    };

    const handleAddressChange = (e) => {
        setEditedAddress(e.target.value);
    };

    const handleDateOfBirthChange = (date) => {
        setEditedDateOfBirth(date);
    };
    
   

    const handleSaveChanges = async () => {
        try {

            const formattedDate = format(new Date(editedDateOfBirth), 'yyyy-MM-dd\'T\'HH:mm:ss.SSSxxx');
            const response = await axios.put(`https://c2se-14-sts-api.onrender.com/users/${userId}`, {
                email: editedEmail,
                full_name: editedFullName,
                phone_number: editedPhoneNumber,
                user_code: editedCode,
                address: editedAddress,
                gender: selectedGenderId,
                role: selectedRoleId,
                date_of_birth: formattedDate,
            });
    
            console.log("Save changes success:", response.data);
        } catch (error) {
            console.error("Error saving changes:", error);
        }
    };

    if (loading) {
        return <Spinner color="blue" />;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="bg-[#F3F7FA] w-full h-full p-2">
            <div className="bg-[#ffffff] w-full h-full p-1">
                <div className="button rounded-full text-center bg-[#F9FBFF] items-center justify-center w-[60px] h-[30px] p-1">
                    <Link to='/admin/manager-account'>
                        <FontAwesomeIcon icon={faArrowLeft}/>
                    </Link>
                </div>
                <div className="bg-[#ffffff] w-full">
                    <div className="max-w-screen-xl container mx-16 " style={{ borderRadius: "20px" }}>
                    <div className="grid grid-cols-10 lg:grid-cols-2 gap-10 bg-white p-8 w-full" style={{ borderRadius: "30px" }}>
                            <div>
                                <h1 className="text-2xl font-medium text-black text-start ">
                                    Thông tin chi tiết
                                </h1>
                            </div>
                            <div></div>
                            <div className="grid-cols-12 w-full">
                                <div className="col-span-10" key={detailUser.id}>
                                <div className="grid grid-cols-11 bg-white-200 p-1 mx-8">
                                    <label className="text-gray-700 text-sm font-bold text-left col-span-3">
                                        Email:
                                    </label>
                                    <input
                                       type="text"
                                       className="text-gray-700 text-sm font-bold col-span-8"
                                       style={{ width: "100%" }}
                                       value={editedEmail || detailUser.email}
                                       onChange={handleEmailChange}
                                    />
                                </div>
                                <div className="grid grid-cols-11 border-t border-gray-600 bg-white-200 p-3 mx-6">
                                    <label className="text-gray-700 text-sm font-bold text-left col-span-3">
                                        Họ và tên:
                                    </label>
                                    <input
                                        type="text"
                                        className="text-gray-700 text-sm font-bold text-left col-span-8"
                                        style={{ width: "100%" }}
                                        value={editedFullName || detailUser.full_name}
                                        onChange={handleFullNameChange}
                                    />
                                </div>
                                    <div className="grid grid-cols-11 border-t border-gray-600 bg-white-200 p-3 mx-6">
                                        <label className="text-gray-700 text-sm font-bold text-left col-span-3">
                                            Ngày sinh:
                                        </label>
                                        <DatePicker
                                            selected={editedDateOfBirth ? new Date(editedDateOfBirth) : null}
                                            onChange={date => setEditedDateOfBirth(date)}
                                            dateFormat="dd/MM/yyyy"
                                            className="text-gray-700 text-sm font-bold text-left col-span-8"
                                            style={{ width: "100%" }}
                                        />
                                    </div>
                                    <div className="grid grid-cols-11 border-t border-gray-600 bg-white-200 p-3 mx-6">
                                        <label className="text-gray-700 text-sm font-bold text-left col-span-3">
                                            Giới tính:
                                        </label>
                                        <select
                                            className="text-gray-700 text-sm font-bold text-left col-span-8"
                                            value={selectedGender}
                                            onChange={handleGenderChange}
                                        >
                                            {genders.map(gender => (
                                                <option key={gender.gender_id} value={gender.gender_name}>
                                                    {gender.gender_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-11 border-t border-gray-600 bg-white-200 p-3 mx-6">
                                        <label className="text-gray-700 text-sm font-bold text-left col-span-3">
                                            Số điện thoại:
                                        </label>
                                        <input
                                            type="text"
                                            className="text-gray-700 text-sm font-bold text-left col-span-8"
                                            style={{ width: "100%" }}
                                            value={editedPhoneNumber || detailUser.phone_number}
                                            onChange={handlePhoneNumberChange}
                                        />
                                    </div>
                                    <div className="grid grid-cols-11 border-t border-gray-600 bg-white-200 p-3 mx-6">
                                        <label className="text-gray-700 text-sm font-bold text-left col-span-3">
                                            Code:
                                        </label>
                                        <input
                                            type="text"
                                            className="text-gray-700 text-sm font-bold text-left col-span-8"
                                            style={{ width: "100%" }}
                                            value={editedCode || detailUser.user_code}
                                            onChange={handleCodeChange}
                                        />
                                    </div>
                                   <div className="grid grid-cols-11 border-t border-gray-600 bg-white-200 p-3 mx-6">
                                        <label className="text-gray-700 text-sm font-bold text-left col-span-3">
                                            Địa chỉ:
                                        </label>
                                        <input
                                            type="text"
                                            className="text-gray-700 text-sm font-bold col-span-8 text-left"
                                            style={{ width: "100%" }}
                                            value={editedAddress || `${detailUser.address || ''} ${detailUser.ward || ''} ${detailUser.district || ''} ${detailUser.city || ''}`}
                                            onChange={handleAddressChange}
                                        />
                                    </div>
                                    <div className="grid grid-cols-11 border-t border-gray-600 bg-white-200 p-3 mx-6">
                                        <label className="text-gray-700 text-sm font-bold text-left col-span-3">
                                            Vai trò:
                                        </label>
                                        <select
                                            className="text-gray-700 text-sm font-bold text-left col-span-8"
                                            value={selectedRole}
                                            onChange={handleRoleChange}
                                        >
                                            {roles.map(role => (
                                                <option key={role.role_id} value={role.role_name}>
                                                    {role.role_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="col-span-2">
                                    <div className="flex flex-col items-center">
                                        <h1 className="text-3xl font-medium text-gray-800 p-2 mb-6">
                                            Ảnh đại điện
                                        </h1>
                                        <img
                                            src={detailUser.avatar || "https://vnn-imgs-a1.vgcloud.vn/image1.ictnews.vn/_Files/2020/03/17/trend-avatar-1.jpg"}
                                            alt="avatar"
                                            className="w-60 h-60 object-cover border-2 rounded-full"
                                        />
                                        <input type="file" hidden/>
                                    </div>
                                    <div className="flex items-end mt-8 justify-end p-10">
                                        <button className="py-2 px-5 bg-red-500 hover:bg-red-700 text-white rounded-sm">
                                            Khóa tài khoản
                                        </button>
                                        <button
                                        className="py-2 px-5 bg-green-500 hover:bg-green-700 text-white rounded-sm"
                                        onClick={handleSaveChanges}
                                    >
                                        Lưu thay đổi
                                    </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailUserAccount;
