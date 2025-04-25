import { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Link } from "react-router-dom";

const CommentsDashboard = () => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");

    useEffect(() => {
        fetchComments();
    }, []);

    const fetchComments = async () => {
        try {
            const response = await axios.post("/api/admin/get-comments");
            if (response.data.success) {
                setComments(response.data.data.comments);
            }
        } catch (err) {
            console.error("Failed to fetch comments:", err);
            toast.error("Failed to fetch comments");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteComment = async (commentID) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;

        try {
            const response = await axios.post("/api/admin/delete-comment", { commentID });
            if (response.data.success) {
                setComments((prev) => prev.filter((p) => p.comment_id !== commentID));
                toast.success("Comment deleted successfully!");
            } else {
                toast.error("Failed to delete comment: " + response.data.message);
            }
        } catch (err) {
            console.error("Error deleting comment:", err);
            toast.error("An error occurred while deleting the comment.");
        }
    };

    const filteredComments = comments.filter((comment) =>
        JSON.stringify(comment, null, 2).toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="p-4 overflow-x-hidden max-w-full">
            <Toaster position="top-right" />
            <h1 className="text-2xl font-bold mb-4">Comments Dashboard</h1>
            <Link to="/admin"
                className="block rounded transition duration-200 hover:border-cyan-500 hover:text-cyan-300"
                >
                 ⬅ Go back
            </Link>
            <input
                type="text"
                placeholder="Search comments..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full mb-4 p-2 border rounded"
            />

            {loading ? (
                <p>Loading comments...</p>
            ) : (
                <>
                    <p className="text-m text-white-600 mb-4">
                        Showing {filteredComments.length} result{filteredComments.length !== 1 ? "s" : ""}
                    </p>

                    <div className="max-h-[calc(100vh-10rem)] overflow-y-auto overflow-x-hidden space-y-10 rounded p-2">
                        {filteredComments.length === 0 ? (
                            <p className="text-gray-500">No matching comments.</p>
                        ) : (
                            filteredComments.map((log, index) => (
                                <div
                                    key={log.comment_id || index}
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

                                    <div className="absolute bottom-2 right-2">
                                        <button
                                            onClick={() => handleDeleteComment(log.comment_id)}
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

export default CommentsDashboard;
