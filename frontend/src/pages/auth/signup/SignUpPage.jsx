import { Link } from "react-router-dom";
import { useState } from "react";
import XSvg from "../../../components/svgs/Logo";
import { MdOutlineMail } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { MdPassword } from "react-icons/md";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axios from "axios";

const SignUpPage = () => {
	const [formData, setFormData] = useState({
		email: "",
		username: "",
		password: "",
	});
	const[isAuthenticated,setIsAuthenticated] = useState(false);

	const { mutate, isError, isPending, error } = useMutation({
		mutationFn: async ({ email, username, password }) => {
			try {
				const res = await axios.post("/api/signup", { // needs the /api/
					email,
					username,
					password,
				});
				if (res.status === 200) {
					setIsAuthenticated(true);
					// Extract jwt token from response
					// MUST do res.data.data cuz res.data is an object with {jwt_token: something, user_id: something}
					const token = res.data.data.jwt_token;
					console.log("JWT Token:", token);

					// Save the token to a cookie
					Cookies.set('tuneshare_cookie', token, {
						expires: 30, // 30 days
						secure: process.env.NODE_ENV === 'production',
						sameSite: 'lax',
					});
					// let's get the user_id from the cookie!
					const cookieValue = Cookies.get('tuneshare_cookie');
					if (cookieValue) {
						// Decode the token to access the payload
						const decodedToken = jwtDecode(cookieValue);
						const userId = decodedToken.user_id;
						console.log('User ID from cookie:', userId);
						// Now you can use userId for any react logic in this component
						setUserID(userId);
					} else {
						console.log('No Token found in the cookie.');
					}
				}
			} catch (error) {
				console.error("Signup error:", error);
				// Throw a specific error message
				throw new Error(error.response?.data?.error || "Server error");
			}
		},
		onSuccess: () => {
			toast.success("Account created successfully!");
			//reroute user to Login page
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		mutate(formData);
	};

	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};
	if(isAuthenticated){
		<Navigate to= "/" />
	}
	return (
		<div className="max-w-screen-xl mx-auto flex h-screen ">
			<div className="flex-1 hidden lg:flex items-center justify-center">
				<XSvg className="lg:w-2/3 fill-white" />
			</div>
			<div className="flex-1 flex flex-col justify-center items-center">
				<form
					className="lg:w-2/3 mx-auto md:mx-20 flex gap-4 flex-col"
					onSubmit={handleSubmit}
				>
					<h1 className="text-4xl font-extrabold text-primary">Join today.</h1>
					<label className="input input-bordered rounded flex items-center gap-2">
						<MdOutlineMail />
						<input
							type="email"
							className="grow"
							placeholder="Email"
							name="email"
							onChange={handleInputChange}
							value={formData.email}
							required
						/>
					</label>
					<div className="flex gap-4 flex-wrap">
						<label className="input input-bordered rounded flex items-center gap-2 flex-1">
							<FaUser />
							<input
								type="text"
								className="grow"
								placeholder="Username"
								name="username"
								onChange={handleInputChange}
								value={formData.username}
								required
							/>
						</label>
					</div>
					<label className="input input-bordered rounded flex items-center gap-2">
						<MdPassword />
						<input
							type="password"
							className="grow"
							placeholder="Password"
							name="password"
							onChange={handleInputChange}
							value={formData.password}
							required
						/>
					</label>
					<button
						type="submit"
						className="btn rounded-full btn-primary text-gray"
						disabled={isPending}
					>
						{isPending ? "Loading..." : "Sign Up"}
					</button>
					{isError && <p className="text-red-500">{error.message}</p>}
				</form>
				<div className="flex flex-col lg:w-2/3 gap-2 mt-4">
					<p className="text-primary text-lg">Already have an account?</p>
					<Link to="/login">
						<button className="btn rounded-full btn-primary text-white btn-outline w-full">
							Sign in
						</button>
					</Link>
				</div>
			</div>
		</div>
	);
};

export default SignUpPage;