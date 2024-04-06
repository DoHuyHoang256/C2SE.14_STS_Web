import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiamondTurnRight } from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";
import { Spinner } from "@material-tailwind/react";
import banner from "../../assets/images/login-banner.png";
import { Helmet } from "react-helmet";

const ResetPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const email = localStorage.getItem("reset-password")

    const [password, setPassword] = useState("");
    const [cfPassword, setCfPassword] = useState("");
    const [hiddenPass, setHiddenPass] = useState(true);
    const [hiddenCfPass, setHiddenCfPass] = useState(true);
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(300);
    useEffect(() => {
        const timer = setInterval(() => {
            if (countdown > 0) {
                setCountdown(countdown - 1);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [countdown]);

    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    const handleOtpChange = (index, value) => {
        if (/^\d*$/.test(value) || value === "") {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);
        }
    };

    return (
        <div className="h-screen flex items-center bg-[#E6EBFB]">
            <Helmet><title>Đặt lại mật khẩu |  Smart Tracking System</title></Helmet>
            <div className="w-full bg-white sm:w-[80%] lg:w-[75%] lg:grid lg:grid-cols-12 shadow-xl m-auto my-auto rounded-[20px] pb-4 lg:pb-0 relative">
                {/* Div cho nội dung */}
                <div className="lg:col-span-6 relative z-10">
                    <div className="w-[70%] m-auto">
                        <h1 className="text-primaryColor text-5xl text-red-700 pt-10 pb-3 font-semibold">Đặt Lại Mật Khẩu</h1>
                        <form className="mt-8 space-y-6">
                            <div className="relative mb-6">
                                <input
                                    type="text"
                                    className="block w-full mb-6 px-4 py-3 border-2 rounded-lg text-gray-900 shadow-lg bg-gray-200 appearance-none focus:outline-none peer"
                                    placeholder=" "
                                    value={email}
                                />

                            </div>
                            <div className="grid grid-cols-6 gap-3 mb-6">
                                {otp.map((digit, index) => (
                                    <div key={index} className="relative">
                                        <input
                                            type="text"
                                            id={`otp${index + 1}`}
                                            className="text-center font-bold block w-full px-4 py-4 border-2 rounded-lg text-gray-900 shadow-lg bg-transparent appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                            placeholder="0"
                                            maxLength="1"
                                            value={digit}
                                            required
                                        />
                                        <label htmlFor={`otp${index + 1}`} className="sr-only">
                                            Nhập số thứ {index + 1} của mã OTP
                                        </label>
                                    </div>
                                ))}
                            </div>
                            <div className="relative mb-6">
                                <input
                                    type={hiddenPass ? "password" : "text"}
                                    id="floating_outlined_password"
                                    className="block w-full px-4 py-3 border-2 rounded-lg text-gray-900 shadow-lg bg-transparent appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                    placeholder=" "
                                    onChange={(e) => setPassword(e.target.value)}
                                    value={password}
                                />
                                <label
                                    htmlFor="floating_outlined_password"
                                    className="absolute text-base text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-3"
                                >
                                    Mật khẩu mới
                                </label>
                                {password !== "" && (
                                    <FontAwesomeIcon
                                        onClick={() => setHiddenPass(!hiddenPass)}
                                        className="absolute top-5 right-6"
                                        icon={hiddenPass}
                                    />
                                )}
                            </div>
                            <div className="relative mb-6 ">
                                <input
                                    type={hiddenCfPass ? "password" : "text"}
                                    id="floating_outlined_cfPassword"
                                    className="block w-full px-4 py-3 border-2 rounded-lg text-gray-900 shadow-lg bg-transparent appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                    placeholder=" "
                                    onChange={(e) => setCfPassword(e.target.value)}
                                    value={cfPassword}
                                />
                                <label
                                    htmlFor="floating_outlined_cfPassword"
                                    className="absolute text-base text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-3"
                                >
                                    Xác nhận mật khẩu
                                </label>
                                {cfPassword !== "" && (
                                    <FontAwesomeIcon
                                        onClick={() => setHiddenCfPass(!hiddenCfPass)}
                                        className="absolute top-5 right-6"
                                        icon={hiddenCfPass}
                                    />
                                )}
                            </div>
                            <div className=" text-center text-gray-600 rounded-lg my-4 ">
                                Mã
                                <i className="text-red-500 font-bold"> OTP </i>
                                thời gian hết hạn sau{" "}
                                <i className="text-red-600 font-bold">
                                    {minutes} : {seconds}
                                </i>
                                <i> giây</i>
                            </div>
                            <button
                                className="bg-red-700 text-white w-full py-3 mb-3 rounded-3xl hover:bg-red-700 active:opacity-80"

                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <Spinner className="h-6 w-6 mr-4" />
                                        <span>Đang tải....</span>
                                    </div>
                                ) : (
                                    <span>Xác nhận</span>
                                )}
                            </button>
                        </form>
                        <div className="mt-10 flex justify-center">
                            <p>
                                Quay lại trang <FontAwesomeIcon icon={faDiamondTurnRight} />
                                <Link to="/login" className="text-primaryColor text-red-500 font-bold">
                                    {" "}
                                    Đăng nhập
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
                {/* Div cho hình nền */}
                <div className="hidden lg:block h-full w-full col-span-6 absolute top-0 right-0 bottom-0">
                    <div className="absolute top-0 right-0 bottom-0 left-0 bg-[#E6EBFB] opacity-70"></div>
                    <img className="h-full w-full object-cover lg:rounded-r-[20px]" src={banner} alt="img" />
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
