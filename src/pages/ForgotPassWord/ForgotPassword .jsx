import React from "react";
import { Link } from "react-router-dom";
import banner from "../../assets/images/login-banner.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiamondTurnRight } from "@fortawesome/free-solid-svg-icons";
import {Helmet} from "react-helmet";

const ForgotPassword = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#E6EBFB]">
            <div className="w-full max-w-[1200px] bg-white sm:w-[80%] lg:w-[75%] lg:grid lg:grid-cols-12 shadow-xl m-auto my-auto rounded-[20px] pb-4 lg:pb-0">
                <div className="text-center lg:col-span-6 flex flex-col justify-center">
                    <Helmet><title>Quên mật khẩu | Smart Tracking System </title></Helmet>
                    <div className="w-[70%] m-auto mt-28">
                        <h1 className="text-primaryColor text-3xl mt-10 font-bold pt-5 pb-3">
                            Quên Mật khẩu
                        </h1>
                        <h1 className="text-base font-normal">
                            Vui lòng điền email hoặc số điện thoại của bạn để có thể nhận được mã OTP để thay đổi mật khẩu mới theo email hoặc số điện thoại
                        </h1>
                        <form className="mt-9">
                            <div className="relative mb-10">
                                <input
                                    type="text"
                                    id="floating_outlined_email"
                                    className="block w-full mb-6 px-4 py-3 border-2 rounded-lg text-gray-900 shadow-lg bg-transparent appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                    placeholder=" "
                                />
                                <label
                                    htmlFor="floating_outlined_email"
                                    className="absolute text-base text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-3"
                                >
                                    Địa chỉ Email
                                </label>
                            </div>
                            <button
                                type="submit"
                                className="bg-red-700 text-white w-full py-3 mb-6 rounded-3xl hover:bg-red-700 active:opacity-80"
                            >
                                <span>Gửi</span>
                            </button>
                        </form>
                        <div className="mb-20">
                            <p>
                                Quay lại trang{" "}
                                <FontAwesomeIcon icon={faDiamondTurnRight} />
                                <Link to="/login" className="text-primaryColor text-red-600 font-bold">
                                    {" "}
                                    Đăng nhập
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
                <div className="hidden lg:block h-full col-span-6 flex justify-center items-center">
                    <img
                        className="object-cover lg:rounded-r-[20px]"
                        src={banner}
                        alt="img"
                    />
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
