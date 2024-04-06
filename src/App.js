import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Home from "./pages/Home";
import Login from "./pages/Login/Login";
import "./App.css";
import LoginSuccess from "./pages/LoginSuccess/LoginSuccess";
import Siderbar from "./components/Siderbar/Siderbar";
import Pagination from "./components/Pagination/Pagination";
import ForgotPassword from "./pages/ForgotPassWord/ForgotPassword ";
import DetailUserAccount from "./pages/Admin/DetailAccount";
import ManagerAccount from "./pages/ManagerAccout/ManagerAccout";
import HistoryTransaction from "./pages/HistoryTransaction/HistoryTransaction";
function App() {
	const [user, setUser] = useState(null);

	const getUser = async () => {
		try {
			const url = `${process.env.REACT_APP_API_URL}/auth/login/success`;
			const { data } = await axios.get(url, { withCredentials: true });
			setUser(data.user._json);
		} catch (err) {
			console.log(err);
		}
	};

	useEffect(() => {
		getUser();
	}, []);

	return (
		<div className="container">
			<Routes>
				<Route
					exact
					path="/"
					element={user ? <Home user={user} /> : <Navigate to="/login" />}
				/>
				<Route
					exact
					path="/login"
					element={user ? <Navigate to="/" /> : <Login />}
				/>
				<Route
					exact
					path="/login-success"
					element={user ? <Navigate to="/" /> : < LoginSuccess />}
				/>
				<Route
					exact
					path="/siderbar"
					element={user ? <Navigate to="/" /> : < Siderbar />}
				/>
				<Route
					exact
					path="/pagination"
					element={user ? <Navigate to="/" /> : < Pagination />}
				/>
				<Route
					exact
					path="/forgot-password"
					element={user ? <Navigate to="/" /> : < ForgotPassword />}
				/>

				<Route
					exact
					path="/admin/detail-account/:userId"
					element={user ? <Navigate to="/" /> : < DetailUserAccount />}
				/>	
				<Route
					exact
					path="/admin/manager-account"
					element={user ? <Navigate to="/" /> : < ManagerAccount />}
				/>
				<Route
					exact
					path="/transaction-history/:userId"
					element={user ? <Navigate to="/" /> : < HistoryTransaction />}
				/>
			</Routes>
		</div>
	);
}

export default App;
