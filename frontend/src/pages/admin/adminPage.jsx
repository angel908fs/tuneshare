import { Link } from "react-router-dom";

const AdminPage = () => {
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
            <Link
                    to="/"
                    className="block rounded transition duration-200 hover:border-cyan-500 hover:text-cyan-300"
                    >
                    ⌂ Home 
            </Link>
            <div className="space-y-4">
                <Link
                    to="/admin/logs"
                    className="block border p-4 rounded-lg transition duration-200 hover:border-cyan-500 hover:bg-[#083344] hover:text-cyan-300"
                    >
                    Logs Dashboard 
                </Link>
                <Link
                    to="/admin/users"
                    className="block border p-4 rounded-lg transition duration-200 hover:border-cyan-500 hover:bg-[#083344] hover:text-cyan-300"
                    >
                    Users Dashboard 
                </Link>
                <Link
                    to="/admin/posts"
                    className="block border p-4 rounded-lg transition duration-200 hover:border-cyan-500 hover:bg-[#083344] hover:text-cyan-300"
                    >
                    Posts Dashboard 
                </Link>
                <Link
                    to="/admin/songs"
                    className="block border p-4 rounded-lg transition duration-200 hover:border-cyan-500 hover:bg-[#083344] hover:text-cyan-300"
                    >
                    Songs Dashboard 
                </Link>
                <Link
                    to="/admin/comments"
                    className="block border p-4 rounded-lg transition duration-200 hover:border-cyan-500 hover:bg-[#083344] hover:text-cyan-300"
                    >
                    Comments Dashboard 
                </Link>
            </div>
        </div>
    );
};

export default AdminPage;