import { useState } from "react";
import { Link } from "react-router-dom";

import XSvg from "../../../components/svgs/Logo";

import { MdOutlineMail } from "react-icons/md";
import { MdPassword } from "react-icons/md";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axios from "axios";
import cookies from 'js-cookies'
import jwtDecode from 'jwt-decode'

const LoginPage = () => {
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});
	
	const { mutate:login, isError,isPending, error} = useMutation({
		mutationFn: async ({ email, password}) => {
			try{
				const res = await axios.post("/api/login", { // needs api for vite config
					email,
					password,
				},
				{
				withCredentials:true
				});
				if (res.status === 200) {
					// Extract jwt token from response
					// need to do res.data.data cuz res.data is an object with {jwt_token: something, user_id: something}
					const token = res.data.data.jwt_token;
	
					// Save the token to a cookie
					cookies.set('tuneshare_cookie', token, {
						expires: 30, // 30 days
						secure: process.env.NODE_ENV === 'production',
						sameSite: 'lax',
					});
				}

				// let's get the user_id from the cookie!
				const token = cookies.get('tuneshare_cookie');

				if (token) {
					// Decode the token to access the payload
					const decodedToken = jwtDecode(token);
					const userId = decodedToken.user_id;
				
					console.log('User ID from token:', userId);
					// Now you can use userId for your application logic
				} else {
					console.log('No token found in the cookie.');
				}

				return res.data;
			}catch (error) {
				if (error.response) {
					// Server responded with a status code outside of the range of 2xx
					throw new Error(error.response.data.message || "Server responded with an error");
				} else if (error.request) {
					// No response received (e.g., network error)
					throw new Error("No response received from server");
				} else {
					// Something went wrong while setting up the request
					throw new Error(error.message || "An error occurred");
				}
			}
		},
		onSuccess: () =>{
			toast.success("Logged In!");
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		login(formData);
	};

	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	

	return (
		<div className='max-w-screen-xl mx-auto flex h-screen'>
			<div className='flex-1 hidden lg:flex items-center  justify-center'>
				<XSvg className='lg:w-2/3 fill-white' />
			</div>
			<div className='flex-1 flex flex-col justify-center items-center'>
				<form className='flex gap-4 flex-col' onSubmit={handleSubmit}>
					
					<h1 className='text-4xl font-extrabold text-primary'>{"Let's"} go.</h1>
					<label className='input input-bordered rounded flex items-center gap-2'>
						<MdOutlineMail />
						<input
							type='text'
							className='grow'
							placeholder='email'
							name='email'
							onChange={handleInputChange}
							value={formData.email}
						/>
					</label>

					<label className='input input-bordered rounded flex items-center gap-2'>
						<MdPassword />
						<input
							type='password'
							className='grow'
							placeholder='Password'
							name='password'
							onChange={handleInputChange}
							value={formData.password}
						/>
					</label>
					<button className='btn rounded-full btn-primary text-white'>
							{isPending ? "Loading..." : "Login"}
						</button>
					{isError && <p className='text-red-500'>Something went wrong</p>}
				</form>
				<div className='flex flex-col gap-2 mt-4'>
					<p className='text-primary text-lg'>{"Don't"} have an account?</p>
					<Link to='/signup'>
						<button className='btn rounded-full btn-primary text-white btn-outline w-full'>Sign up</button>
					</Link>
				</div>
			</div>
		</div>
	);
};
export default LoginPage;