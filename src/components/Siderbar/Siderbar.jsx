import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUser,
    faBarcode,
    faPeopleRoof,
    faAddressCard,
    faChevronDown,
    faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
const Sidebar = () => {
    const [dropdownStates, setDropdownStates] = useState({
        userDropdown: false,
        statisticDropdown: false,
        accountDropdown: false,
    });

    const toggleDropdown = (dropdownName) => {
        setDropdownStates(prevState => ({
            ...prevState,
            [dropdownName]: !prevState[dropdownName]
        }));
    };

    const router = useLocation();
    // const handleLogout = () => {
    //     // Đặt logic đăng xuất ở đây, ví dụ:
    //     // Xóa token, xóa thông tin người dùng đăng nhập, vv.
    //
    //     // Hiển thị thông báo toast
    //     toast.success("Tài khoản của bạn đã được đăng xuất thành công!");
    //
    //     // Load lại trang
    //     window.location.reload();
    // };
    return (
        <aside
            id="sidebar-multi-level-sidebar"
            className="top-0 left-0 z-40 w-74 h-screen transition-transform -translate-x-full drop-shadow-lg sm:translate-x-0"
            aria-label="Sidebar"
            onClick={(event) => event.stopPropagation()}
        >
            <div className="h-full px-4 w-[#290px] py-4 overflow-y-auto bg-white border-r-2 border-r-gray-200 rounded-2xl">
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
                        <p className="font-medium  text-2xl p-3">Admin</p>
                        {/*<p className="text-sm text-gray-500 p-2">Admin</p>*/}
                    </div>
                </div>
                <ul className="space-y-4 font-medium p-4">
                    {/*<li>*/}
                    {/*    <button*/}
                    {/*        className="flex items-center justify-start w-full p-2 text-base text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100"*/}
                    {/*        onClick={() => toggleDropdown("userDropdown")}*/}
                    {/*    >*/}
                    {/*        <Link to="/profile">*/}
                    {/*            <FontAwesomeIcon icon={faUser} className="text-xl " /> <span className="ml-3 mb-2 text-left whitespace-nowrap">Tài khoản của tôi</span>*/}

                    {/*        </Link>*/}
                    {/*    </button>*/}
                    {/*</li>*/}




                    <li>
                        <button
                            className="flex items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100"
                            onClick={() => toggleDropdown("statisticDropdown")}
                        >
                            <FontAwesomeIcon icon={faBarcode} />
                            <span className="flex-1 ml-4 text-left whitespace-nowrap">Thống kê</span>
                            <FontAwesomeIcon icon={faChevronDown} />
                        </button>
                        <ul className={`${dropdownStates.statisticDropdown || router.pathname.includes("/statistical") ? "block" : "hidden"}`}>
                            <li>
                                <Link to="/statistical" className={`${router.pathname.includes("/statistical") ? "text-primaryColor" : "text-gray-500"} flex items-center w-full p-2 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100`}>
                                    Số Xe
                                </Link>
                            </li>
                            <li>
                                <Link to="/revenue" className={`${router.pathname.includes("/admin/admin-revenue") ? "text-primaryColor" : "text-gray-500"} flex items-center w-full p-2 text-gray-500 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100`}>
                                    Doanh Thu
                                </Link>
                            </li>
                        </ul>
                    </li>

                    <li>
                        <button
                            className="flex items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100"
                            onClick={() => toggleDropdown("accountDropdown")}
                        >
                            <FontAwesomeIcon icon={faPeopleRoof} className="text-primaryColor" />
                            <span className="flex-1 mx-4 text-left whitespace-nowrap">Quản Lý</span>
                            <FontAwesomeIcon icon={faChevronDown} />
                        </button>
                        <ul className={`${dropdownStates.accountDropdown || router.pathname.includes("/account") ? "block" : "hidden"}`}>

                            <li>
                                <Link to="/admin/manager-account" className={`${router.pathname.includes("/admin/manager-account") ? "text-primaryColor" : "text-gray-500"} text-gray-500 flex items-center w-full p-2 transition duration-75 rounded-lg pl-11 group hover
                                bg-gray-100`}>
                                    Danh Sách Tài Khoản
                                </Link>
                            </li>
                            <li>
                                <Link to="/admin/list-of-location" className={`${router.pathname.includes("/admin/manager-account") ? "text-primaryColor" : "text-gray-500"} text-gray-500 flex items-center w-full p-2 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100`}>
                                    Danh Sách Cơ Sở
                                </Link>
                            </li>
                        </ul>
                    </li>

                    <li>

                        <button className="flex items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100"
                                // onClick={handleLogout}  // Call handleLogout function on click
                        >
                            <Link to="/login">
                            <FontAwesomeIcon icon={faRightFromBracket} />
                            <span className="flex-1 ml-3 text-left whitespace-nowrap">Đăng xuất</span>
                        </Link>

                        </button>
                    </li>
                </ul>
            </div>
            {/*<ToastContainer />*/}
        </aside>
    );
};

export default Sidebar;
