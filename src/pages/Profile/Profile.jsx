import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Sidebar from '../../components/Siderbar/Siderbar';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faAddressCard ,} from "@fortawesome/free-solid-svg-icons";

const UserProfile = () => {
    const [userData, setUserData] = useState({
        profilePicture: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        bio: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData((prevUserData) => ({
            ...prevUserData,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Submitted user data:', userData);
    };

    return (
        <div className="flex w-full">
            <Helmet>
                <title>  Hồ sơ | SYS</title>
            </Helmet>

            <div className="flex w-full">
                <div className=" mx-16 w-[280px] flex-none">
                    <Sidebar />
                </div>

                <div className="flex-1 bg-[#F3F7FA] p-8 ml-4 rounded-xl shadow-lg">
                    <h1 className="text-3xl  font-bold mb-4 text-gray-800"> Hồ Sơ Của Bạn </h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex items-center space-x-4">
                            <img
                                src={userData.profilePicture || "https://vnn-imgs-a1.vgcloud.vn/image1.ictnews.vn/_Files/2020/03/17/trend-avatar-1.jpg"}
                                alt="Profile"
                                className="w-32 h-32 rounded-full object-cover shadow-lg"
                            />
                            <div>
                                <label htmlFor="profilePicture" className="mx-10 bg-emerald-700 text-white font-bold rounded-md p-2 w-[100px] h-[40px] hover:bg-emerald-600
                                       cursor-pointer">
                                    Chọn ảnh
                                </label>
                                <input
                                    id="profilePicture"
                                    type="file"
                                    name="profilePicture"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            setUserData((prevUserData) => ({
                                                ...prevUserData,
                                                profilePicture: URL.createObjectURL(file),
                                            }));
                                        }
                                    }}
                                    className="file-input"
                                    style={{ display: 'none' }}
                                />
                            </div>

                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={userData.firstName}
                                    onChange={handleChange}
                                    placeholder="Tên"
                                    className="input w-4/5 p-3 mb-4 rounded-md shadow-md border border-gray-300"
                                />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={userData.phone}
                                    onChange={handleChange}
                                    placeholder="Số điện thoại"
                                    className="input w-4/5 p-3 mb-4 rounded-md shadow-md border border-gray-300"
                                />
                                <input
                                    type="text"
                                    name="address"
                                    value={userData.address}
                                    onChange={handleChange}
                                    placeholder="Địa chỉ"
                                    className="input w-4/5 p-3 mb-4 rounded-md shadow-md border border-gray-300"
                                />
                                <input
                                    type="text"
                                    name="state"
                                    value={userData.state}
                                    onChange={handleChange}
                                    placeholder="Quận/Huyện "
                                    className="input w-4/5 p-3 mb-4 rounded-md shadow-md border border-gray-300"
                                />
                                <textarea
                                    name="bio"
                                    value={userData.bio}
                                    onChange={handleChange}
                                    placeholder="Ghi chú"
                                    className="input w-4/5 p-3 mb-4 rounded-md shadow-md border border-gray-300"
                                    rows={4}
                                />
                            </div>
                            {/* Cột bên phải */}
                            <div>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={userData.lastName}
                                    onChange={handleChange}
                                    placeholder="Họ"
                                    className="input w-4/5 p-3 mb-4 rounded-md shadow-md border border-gray-300"
                                />
                                <input
                                    type="email"
                                    name="email"
                                    value={userData.email}
                                    onChange={handleChange}
                                    placeholder="Email"
                                    className="input w-4/5 p-3 mb-4 rounded-md shadow-md border border-gray-300"
                                />
                                <input
                                    type="text"
                                    name="city"
                                    value={userData.city}
                                    onChange={handleChange}
                                    placeholder="Thành phố"
                                    className="input w-4/5 p-3 mb-4 rounded-md shadow-md border border-gray-300"
                                />
                                <input
                                    type="text"
                                    name="postalCode"
                                    value={userData.postalCode}
                                    onChange={handleChange}
                                    placeholder="Biển số"
                                    className="input w-4/5 p-3 mb-4 rounded-md shadow-md border border-gray-300"
                                />
                                {/*<input*/}
                                {/*    type="text"*/}
                                {/*    name="country"*/}
                                {/*    value={userData.country}*/}
                                {/*    onChange={handleChange}*/}
                                {/*    placeholder="Cơ sở"*/}
                                {/*    className="input w-4/5 p-3 mb-4 rounded-md shadow-md border border-gray-300"*/}
                                {/*/>*/}
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="mx-4 bg-emerald-700 text-white font-bold rounded-md p-2 w-[100px] h-[40px] hover:bg-emerald-600"
                        >
                            Lưu
                        </button>
                        <button
                            type="submit"
                            className=" mx-16 bg-red-600 text-white font-bold rounded-md p-2 w-[100px] h-[40px] hover:bg-red-400"
                        >
                            Hủy
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
