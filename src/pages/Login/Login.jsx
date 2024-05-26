import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import banner from "../../assets/images/login-banner.png";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate(); // Sử dụng useNavigate để nhận hàm chuyển hướng
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const onSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse?.credential);
      const response = await axios.get(`https://c2se-14-sts-api.onrender.com/api/users/emailAdmin`);
      const userEmails = response.data;

      if (userEmails.includes(decoded.email)) {
        setSuccessMessage("Đăng nhập thành công!");
        navigate("/admin/manager-account"); // Chuyển hướng đến trang mong muốn sau khi đăng nhập thành công
      } else {
        window.alert('Tài khoản không có quyền truy cập!');
      }
    } catch (error) {
      window.alert('Đăng nhập thất bại!');
    }
  };

  const onError = () => {
    console.log('Google Login Failed');
  };

  return (
    <GoogleOAuthProvider clientId="1069924781685-hkivdnm3scflmikm1a48qd92hplljd5e.apps.googleusercontent.com">
      <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center bg-white">
        <Helmet>
          <title>Đăng nhập | Smart Tracking System </title>
        </Helmet>
        <div className="w-full max-w-[1200px] px-4 sm:w-[80%] lg:w-[75%] lg:grid lg:grid-cols-12 shadow-xl rounded-[20px]">
          <div className="bg-white text-center lg:col-span-7 lg:flex lg:flex-col justify-center">
            <motion.div whileHover={{ scale: 1.5 }} className="w-fit m-4">
              <Link to="/">
                <FontAwesomeIcon
                  className="w-6 h-6 text-primaryColor object-left"
                  icon={faHome}
                />
              </Link>
            </motion.div>
            <div className="w-[70%] m-auto">
              <h1 className="text-primaryColor text-4xl font-bold pt-2 pb-2">
                Đăng Nhập
              </h1>
              <h1 className=" text-2xl  mt-12 font-normal">
                Chào mừng đến với Smart Tracking System hệ thống quản lý bãi
                xe của trường đại học Duy Tân
              </h1>
              <div className="mt-9">
                <GoogleLogin
                  onSuccess={onSuccess}
                  onError={onError}
                  render={(renderProps) => (
                    <button className="w-full mb-3 px-4 py-3 flex justify-center gap-2 border-2 rounded-lg hover:border-blue-600 transition duration-150" onClick={renderProps.onClick}>
                      <img
                        className="w-6 h-6"
                        src="https://www.svgrepo.com/show/475656/google-color.svg"
                        loading="lazy"
                        alt="google logo"
                      />
                      <span>Đăng nhập với Google</span>
                    </button>
                  )}
                />
              </div>
            </div>
          </div>
          <div className="hidden lg:block h-auto col-span-5 ">
            <img
              className="object-cover object-center w-auto h-full lg:rounded-r-[20px]"
              src={banner}
              alt="img"
            />
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
