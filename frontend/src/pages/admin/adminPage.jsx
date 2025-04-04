
import { useEffect, useState } from "react";
import axios from "axios";

const AdminPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await axios.post("/api/get-logs");
                if (response.data.success) {
                    setLogs(response.data.data.logs);
                }
            } catch (err) {
                console.error("Failed to fetch logs:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
            {loading ? (
                <p>Loading logs...</p>
            ) : (
                <div className="space-y-2">
                    {logs.map((log, index) => (
                        <div
                            key={log.log_id || index}
                            className="border p-2 rounded shadow-sm bg-white"
                        >
                            <pre className="text-sm overflow-x-auto">
                                {JSON.stringify(log, null, 2)}
                            </pre>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminPage;
