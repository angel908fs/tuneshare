import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const EditProfileModal = ({ userData, setUserData }) => {
    const [formData, setFormData] = useState({
        fullName: userData?.fullName || "",
        username: userData?.username || "",
        email: userData?.email || "",
        bio: userData?.bio || "",
        link: userData?.link || "",
        newPassword: "",
        currentPassword: "",
        profile_picture: userData?.profile_picture || "",
    });

    const [profileImgPreview, setProfileImgPreview] = useState(userData?.profile_picture || "");
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setProfileImgPreview(reader.result);
                setFormData({ ...formData, profile_picture: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.put("/api/profile/update", {
                user_id: userData.user_id,
                ...formData,
            });

            if (response.data.success) {
                toast.success("Profile Updated!");
                setUserData(response.data.data);
                document.getElementById("edit_profile_modal").close();
            } else {
                toast.error(response.data.message || "Failed to update profile.");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("An error occurred while updating your profile.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                className='btn btn-outline rounded-full btn-sm'
                onClick={() => document.getElementById("edit_profile_modal").showModal()}
            >
                Edit Profile
            </button>

            <dialog id='edit_profile_modal' className='modal'>
                <div className='modal-box border rounded-md border-gray-700 shadow-md'>
                    <h3 className='font-bold text-lg my-3'>Update Profile</h3>

                    <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
                        {/* Profile Picture Upload */}
                        <div className="flex justify-center">
                            <label htmlFor="profile_picture" className="cursor-pointer">
                                <img
                                    src={profileImgPreview || "/avatar-placeholder.png"}
                                    alt="Profile Preview"
                                    className="w-24 h-24 rounded-full border"
                                />
                                <input
                                    type="file"
                                    id="profile_picture"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>

                        {/* Full Name & Username */}
                        <div className='flex flex-wrap gap-2'>
                            <input
                                type='text'
                                placeholder='Full Name'
                                className='flex-1 input border border-gray-700 rounded p-2 input-md'
                                value={formData.fullName}
                                name='fullName'
                                onChange={handleInputChange}
                            />
                            <input
                                type='text'
                                placeholder='Username'
                                className='flex-1 input border border-gray-700 rounded p-2 input-md'
                                value={formData.username}
                                name='username'
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* Email & Link */}
                        <div className='flex flex-wrap gap-2'>
                            <input
                                type='email'
                                placeholder='Email'
                                className='flex-1 input border border-gray-700 rounded p-2 input-md'
                                value={formData.email}
                                name='email'
                                onChange={handleInputChange}
                            />
                            <input
                                type='text'
                                placeholder='Website or Link'
                                className='flex-1 input border border-gray-700 rounded p-2 input-md'
                                value={formData.link}
                                name='link'
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* Password Update */}
                        <div className='flex flex-wrap gap-2'>
                            <input
                                type='password'
                                placeholder='Current Password'
                                className='flex-1 input border border-gray-700 rounded p-2 input-md'
                                value={formData.currentPassword}
                                name='currentPassword'
                                onChange={handleInputChange}
                            />
                            <input
                                type='password'
                                placeholder='New Password'
                                className='flex-1 input border border-gray-700 rounded p-2 input-md'
                                value={formData.newPassword}
                                name='newPassword'
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* Bio */}
                        <textarea
                            placeholder='Bio'
                            className='flex-1 input border border-gray-700 rounded p-2 input-md'
                            value={formData.bio}
                            name='bio'
                            onChange={handleInputChange}
                        />

                        {/* Submit Button */}
                        <button 
                            type="submit" 
                            className='btn btn-primary rounded-full btn-sm text-white'
                            disabled={loading}
                        >
                            {loading ? "Updating..." : "Update"}
                        </button>
                    </form>
                </div>

                {/* Modal Close Button */}
                <form method='dialog' className='modal-backdrop'>
                    <button className='outline-none'>Close</button>
                </form>
            </dialog>
        </>
    );
};

export default EditProfileModal;
