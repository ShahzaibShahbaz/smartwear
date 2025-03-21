import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminNavbar from "../../components/AdminNavbar";

const UserManagement = () => {
  const [users, setUsers] = useState([]);

  // Fetch all users and filter non-admin users
  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:8000/users");
      const nonAdminUsers = response.data.users.filter(
        (user) => !user.is_admin
      ); // Filter out admin users
      setUsers(nonAdminUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Update user status (Suspend/Unsuspend)
  const updateUserStatus = async (userId, newStatus) => {
    try {
      await axios.patch(`http://localhost:8000/users/${userId}/status`, {
        status: newStatus,
      });
      alert(`User status updated to ${newStatus}`);
      fetchUsers(); // Refresh the user list
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  // Delete user
  const deleteUser = async (userId) => {
    try {
      await axios.delete(`http://localhost:8000/users/${userId}`);
      alert("User deleted successfully!");
      fetchUsers(); // Refresh the user list
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  // Fetch users when component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />
      <div className="min-h-screen bg-gray-100 p-8">
        <h1 className="text-2xl font-bold mb-6">Manage Users</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow-lg">
            <thead>
              <tr className="bg-gray-200">
                <th className="py-3 px-4 text-left font-semibold text-gray-600">
                  Name
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-600">
                  Email
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-600">
                  Status
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr
                  key={user._id}
                  className={`${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-gray-100 transition-all rounded-md my-2`}
                >
                  <td className="py-4 px-4">{user.username}</td>
                  <td className="py-4 px-4">{user.email}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2 py-1 rounded ${
                        user.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 flex space-x-4">
                    <button
                      onClick={() =>
                        updateUserStatus(
                          user._id,
                          user.status === "active" ? "suspended" : "active"
                        )
                      }
                      className={` w-28 px-3 py-1 rounded-full text-sm ${
                        user.status === "active"
                          ? "bg-yellow-500 text-white"
                          : "bg-green-600 text-white"
                      }`}
                    >
                      {user.status === "active" ? "Suspend" : "Unsuspend"}
                    </button>
                    <button
                      onClick={() => deleteUser(user._id)}
                      className="w-28 px-3 py-1 text-sm bg-red-600 text-white rounded-full"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
