import React from 'react';
import {Spinner} from "@material-tailwind/react";

const LoginSuccess = () => {
    return (
        <div className="flex justify-center items-center h-screen">
            <div className='flex items-center justify-center'>
                <Spinner className="h-16 w-16 mr-9" color="blue"/> <span className="text-4xl text-gray-700">Đang đăng nhập...</span>
            </div>
        </div>
    );
};

export default LoginSuccess;