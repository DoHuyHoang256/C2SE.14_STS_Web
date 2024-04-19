import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";

const PaginationAdmin = ({ currentPage, onPageChange }) => {
    return (
        <div className="flex justify-end mt-4">
           
            {/* Nút trang trước */}
            <button
                onClick={() => onPageChange('prev')}
                className="px-3 py-1 mr-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100"
            >
                <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
            </button>
             {/* Hiển thị số trang hiện tại */}
             <span className="px-3 py-1 mr-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100">
               {currentPage}
            </span>
            {/* Nút trang tiếp theo */}
            <button
                onClick={() => onPageChange('next')}
                className="px-3 py-1 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100"
            >
                <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
            </button>
        </div>
    );
};

export default PaginationAdmin;
