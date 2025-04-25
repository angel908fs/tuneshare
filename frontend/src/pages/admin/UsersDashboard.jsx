import { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const UsersDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.post("/api/get-users");
            if (response.data.success) {
                setUsers(response.data.data.users);
            }
        } catch (err) {
            console.error("Failed to fetch users:", err);
            toast.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userID) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;

        try {
            const response = await axios.post("/api/delete-user", { userID });
            if (response.data.success) {
                setUsers((prev) => prev.filter((u) => u.user_id !== userID));
                toast.success("User deleted successfully!");
            } else {
                toast.error("Failed to delete user: " + response.data.message);
            }
        } catch (err) {
            console.error("Error deleting user:", err);
            toast.error("An error occurred while deleting the user.");
        }
    };

    const filteredUsers = users.filter((user) =>
        JSON.stringify(user, null, 2).toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="p-4 overflow-x-hidden max-w-full">
            {/* If you already have <Toaster /> in App.jsx, remove this line */}
            <Toaster position="top-right" />

            <h1 className="text-2xl font-bold mb-4">Users Dashboard</h1>

            <input
                type="text"
                placeholder="Search users..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full mb-4 p-2 border rounded"
            />

            {loading ? (
                <p>Loading users...</p>
            ) : (
                <>
                    <p className="text-m text-white-600 mb-4">
                        Showing {filteredUsers.length} result{filteredUsers.length !== 1 ? "s" : ""}
                    </p>

                    <div className="max-h-[calc(100vh-10rem)] overflow-y-auto overflow-x-hidden space-y-10 rounded p-2">
                        {filteredUsers.length === 0 ? (
                            <p className="text-gray-500">No matching users.</p>
                        ) : (
                            filteredUsers.map((log, index) => (
                                <div
                                    key={log.user_id || index}
                                    className="relative border p-4 rounded-lg shadow-sm break-words"
                                >
                                    <div className="text-sm max-w-full whitespace-pre-wrap break-words font-mono">
                                        {Object.entries(log).map(([key, value]) => (
                                            <div key={key}>
                                                <span className="text-cyan-400">{key}</span>:{" "}
                                                <span>
                                                    {highlightSearch(
                                                        typeof value === "object" && value !== null
                                                            ? JSON.stringify(value, null, 2)
                                                            : String(value),
                                                        query
                                                    )}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* DELETE BUTTON - BOTTOM RIGHT */}
                                    <div className="absolute bottom-2 right-2">
                                        <button
                                            onClick={() => handleDeleteUser(log.user_id)}
                                            className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

function highlightSearch(text, query) {
    if (!query) return text;

    const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, "gi"));
    return parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-cyan-300 rounded-sm">{part}</mark>
        ) : (
            <span key={i}>{part}</span>
        )
    );
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default UsersDashboard;
