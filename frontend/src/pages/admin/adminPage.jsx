import { Link } from "react-router-dom";

const AdminPage = () => {
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
            <div className="space-y-4">
                <Link
                    to="/admin/logs"
                    className="block border p-4 rounded hover:bg-gray-100 transition"
                >
                    Logs Dashboard
                </Link>
            </div>
        </div>
    );
};

export default AdminPage;