import { useState } from "react";
import { Link, useSubmit } from "react-router-dom";
import XSvg from "../../../components/svgs/Logo";
import { MdOutlineMail } from "react-icons/md";
import { MdPassword } from "react-icons/md";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axios from "axios";


const LoginPage = () => {
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});

	const { mutate:login, isPending, isError, error } = useMutation({
		mutationFn: async ({ email, password }) => {
			try {
				const res = await axios.post("/login",{ //gotta look at login route, likely leak
					email,
					password,
				});
				const data = res.data;
				
				if(!res.ok){
					throw new Error(data.error || "Something went wrong");
				}
			} catch (error) {
				console.error("Login error:", error);
				// Throw a specific error message
				throw new Error(error.response?.data?.error || "Server error");
			}
		},
		onSuccess: () => {
			toast.success("Logged In!");
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		login(formData); // in the mutation. replacing mutate with login
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
					{isError && <p className='text-red-500'>
						{error.message}
						</p>}
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