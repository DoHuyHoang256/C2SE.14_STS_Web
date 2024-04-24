import React from 'react';
import { Line } from 'react-chartjs-2';
import { useTable } from 'react-table';
import Sidebar from "../../components/Siderbar/Siderbar";

const RevenueUpdate = () => {
    // Dữ liệu doanh thu mẫu
    const [revenueData, setRevenueData] = React.useState({
        labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6'],
        datasets: [
            {
                label: 'Doanh thu',
                data: [10000, 15000, 12000, 18000, 20000, 25000],
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    });

    // Dữ liệu cho bảng thống kê
    const revenueStats = [
        { month: 'Tháng 1', revenue: 10000,bran:'Cơ sở 1' },
        { month: 'Tháng 2', revenue: 15000,bran:'Cơ sở 1' },
        { month: 'Tháng 3', revenue: 12000 ,bran:'Cơ sở 1'},
        { month: 'Tháng 4', revenue: 18000 ,bran:'Cơ sở 1'},
        { month: 'Tháng 5', revenue: 20000,bran:'Cơ sở 1' },
        { month: 'Tháng 6', revenue: 25000 ,bran:'Cơ sở 1'},
    ];

    // Cấu hình cho bảng thống kê
    const columns = React.useMemo(
        () => [
            {
                Header: 'Tháng',
                accessor: 'month',
            },
            {
                Header: 'Doanh thu',
                accessor: 'revenue',
            },{
                Header: 'Cơ Sở',
                accessor: 'bran',
            },
        ],
        []
    );

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({ columns, data: revenueStats });

    return (
        <div className="grid w-full grid-cols-12 gap-10">
            <div className="col-span-1"></div>
            <div className="col-span-3">
                <div className="border border-white h-screen flex flex-col justify-between">
                    <Sidebar />
                </div>
            </div>

            <div className="col-span-8 p-8 w-[700px] bg-white rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold mb-4">Cập nhật doanh thu</h1>

                <div className="mb-8">
                    <Line data={revenueData} />
                </div>
                <div className="rounded-lg w-[600px] h-[300px] text-center overflow-hidden border shadow-lg">
                    <table {...getTableProps()} className="w-full">
                        <thead className="bg-gray-200 text-gray-700">
                        {headerGroups.map((headerGroup) => (
                            <tr {...headerGroup.getHeaderGroupProps()}>
                                {headerGroup.headers.map((column) => (
                                    <th
                                        {...column.getHeaderProps()}
                                        className="p-4 border-b"
                                    >
                                        {column.render('Header')}
                                    </th>
                                ))}
                            </tr>
                        ))}
                        </thead>
                        <tbody {...getTableBodyProps()} className="bg-white">
                        {rows.map((row) => {
                            prepareRow(row);
                            return (
                                <tr {...row.getRowProps()} className="border-b">
                                    {row.cells.map((cell) => (
                                        <td
                                            {...cell.getCellProps()}
                                            className="p-4"
                                        >
                                            {cell.render('Cell')}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RevenueUpdate;
