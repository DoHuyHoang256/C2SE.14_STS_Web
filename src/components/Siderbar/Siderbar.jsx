import React, { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCalendarAlt,
    faChevronDown,
    faAddressBook,
    faRightFromBracket,
    faUser,
    faBarcode,
    faPeopleRoof,
} from "@fortawesome/free-solid-svg-icons";

const Sidebar = () => {
    const isPetOwner = true;
    const [dropdownStates, setDropdownStates] = useState({
        userDropdown: false,
        petDropdown: false,
        contactDropdown: false, StatisticsDropdown: false,
        dateDropdown: false,
        accoutDropdown: false,
    });

    const toggleDropdown = (dropdownName) => {
        const updatedDropdownStates = { ...dropdownStates };
        Object.keys(updatedDropdownStates).forEach((key) => {
            updatedDropdownStates[key] = key === dropdownName ? !updatedDropdownStates[key] : false;
        });
        setDropdownStates(updatedDropdownStates);
    };

    const router = useLocation();

    return (
        <aside
            id="sidebar-multi-level-sidebar"
            className="top-0 left-0 z-40 w-74 h-screen transition-transform -translate-x-full drop-shadow-lg sm:translate-x-0"
            aria-label="Sidebar"
        >
            <div className="h-full px-4 py-4 overflow-y-auto bg-white border-r-2 border-r-gray-200 rounded-2xl">
                <div className="flex items-center space-x-2 mb-4">
                    <div className="bg-gray-200 w-20 h-20 rounded-full overflow-hidden flex items-center justify-center">
                        <img
                            src="https://vnn-imgs-a1.vgcloud.vn/image1.ictnews.vn/_Files/2020/03/17/trend-avatar-1.jpg"
                            alt="Avatar"
                            className="rounded-full object-cover"
                            style={{ width: "100%", height: "100%" }}
                        />
                    </div>
                    <div>
                        <p className="font-medium p-3">Nguyen Phi Hien</p>
                        <p className="text-sm text-gray-500 p-2">Admin</p>
                    </div>
                </div>
                <ul className="space-y-4 font-medium p-4">
                    <li>
                        <button
                            className="flex items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100"
                            onClick={() => toggleDropdown("userDropdown")}
                        >
                            <FontAwesomeIcon icon={faUser} className="text-primaryColor" />
                            <span className="flex-1 ml-3 text-left whitespace-nowrap">Tài khoản của tôi</span>
                            <FontAwesomeIcon icon={faChevronDown} />
                        </button>
                        <ul className={`${dropdownStates.userDropdown || router.pathname.includes("/profile") ? "block" : "hidden"}`}>
                            <li>
                                <Link to="/profile" className={`${router.pathname === "/profile" ? "text-primaryColor" : "text-gray-500"} flex items-center w-full p-2 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100`}>
                                    Hồ sơ
                                </Link>
                            </li>
                            <li>
                                <Link to="/profile/change-password" className={`${router.pathname === "/profile/change-password" ? "text-primaryColor" : "text-gray-500"} flex items-center w-full p-2 text-gray-500 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100`}>
                                    Đổi mật khẩu
                                </Link>
                            </li>
                        </ul>
                    </li>

                    <li>
                        <button
                            className="flex items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100"
                            onClick={() => toggleDropdown("StatisticsDropdown")}
                        >
                            <FontAwesomeIcon icon={faBarcode} />
                            <span className="flex-1 ml-3 text-left whitespace-nowrap">Thống kê</span>
                            <FontAwesomeIcon icon={faChevronDown} />
                        </button>
                        <ul className={`${dropdownStates.StatisticsDropdown || router.pathname.includes("/pet") ? "block" : "hidden"}`}>
                            <li>
                                <Link to="/pet-owner/pets" className={`${router.pathname.includes("/pet-owner/pets") ? "text-primaryColor" : "text-gray-500"} flex items-center w-full p-2 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100`}>
                                    Thống kê
                                </Link>
                            </li>
                            <li>
                                <Link to="/pet-owner/pets" className={`${router.pathname.includes("/pet-owner/pet-condition") ? "text-primaryColor" : "text-gray-500"} flex items-center w-full p-2 text-gray-500 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100`}>
                                    Tinh Doanh thu
                                </Link>
                            </li>
                        </ul>
                    </li>

                    <li>
                        <button
                            className="flex items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100"
                            onClick={() => toggleDropdown("dateDropdown")}
                        >
                            <FontAwesomeIcon icon={faCalendarAlt} className="text-primaryColor" />
                            <span className="flex-1 ml-3 text-left whitespace-nowrap">Ngày</span>
                            <FontAwesomeIcon icon={faChevronDown} />
                        </button>
                        <ul className={`${dropdownStates.dateDropdown || router.pathname.includes("/appointment") ? "block" : "hidden"}`}>
                            <li>
                                <Link to="/pet-owner/appointments" className={`${router.pathname.includes("/pet-owner/appointment") ? "text-primaryColor" : "text-gray-500"} flex items-center w-full p-2 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100`}>
                                    Danh sách theo ngày
                                </Link>
                            </li>
                        </ul>
                    </li>

                    <li>
                        <button
                            className="flex items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100"
                            onClick={() => toggleDropdown("accoutDropdown")}
                        >
                            <FontAwesomeIcon icon={faPeopleRoof} className="text-primaryColor" />
                            <span className="flex-1 ml-3 text-left whitespace-nowrap">Quản lý tài khoản</span>
                            <FontAwesomeIcon icon={faChevronDown} />
                        </button>
                        <ul className={`${dropdownStates.accoutDropdown || router.pathname.includes("/manager-account") ? "block" : "hidden"}`}>
                            <li>
                                <Link to="/admin/manager-account" className={`${router.pathname.includes("/admin/manager-account") ? "text-primaryColor" : "text-gray-500"} flex items-center w-full p-2 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100`}>
                                    Danh sách tài khoản
                                </Link>
                            </li>
                        </ul>
                    </li>

                    <li>
                        <button
                            className="flex items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100"
                            onClick={() => toggleDropdown("contactDropdown")}
                        >
                            <FontAwesomeIcon icon={faAddressBook} className="text-primaryColor" />
                            <span className="flex-1 ml-3 text-left whitespace-nowrap">Contact</span>
                            <FontAwesomeIcon icon={faChevronDown} />
                        </button>
                        <ul className={`${dropdownStates.contactDropdown || router.pathname.includes("vet/pet") ? "block" : "hidden"}`}>
                            <li>
                                <Link to="/vet/pets" className={`${router.pathname.includes("/vet/pets") ? "text-primaryColor" : "text-gray-500"} flex items-center w-full p-2 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100`}>
                                    Email
                                </Link>
                            </li>
                            <li>
                                <Link to="/vet/pets" className={`${router.pathname.includes("/vet/pet-advice") ? "text-primaryColor" : "text-gray-500"} flex items-center w-full p-2 text-gray-500 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100`}>
                                    Phone
                                </Link>
                            </li>
                            <li>
                                <Link to="/vet/pets" className={`${router.pathname.includes("/vet/pet-advice") ? "text-primaryColor" : "text-gray-500"} flex items-center w-full p-2 text-gray-500 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100`}>
                                    Website
                                </Link>
                            </li>
                        </ul>
                    </li>

                    <li>
                        <button className="flex items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100">
                            <Link to="/login" >
                                <FontAwesomeIcon icon={faRightFromBracket} />
                                <span className="flex-1 ml-3 text-left whitespace-nowrap">Đăng xuất</span>
                            </Link>

                        </button>
                    </li>
                </ul>
            </div>
        </aside>
    );
};

export default Sidebar;
