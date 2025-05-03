import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

const AdminUserPage = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "" });

  // Simulate fetching users
  useEffect(() => {
    setUsers([
      { id: uuidv4(), name: "Alice", email: "alice@example.com" },
      { id: uuidv4(), name: "Bob", email: "bob@example.com" },
    ]);
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingUser) {
      // Update
      setUsers(users.map(u => (u.id === editingUser.id ? { ...editingUser, ...formData } : u)));
      setEditingUser(null);
    } else {
      // Create
      setUsers([...users, { id: uuidv4(), ...formData }]);
    }
    setFormData({ name: "", email: "" });
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email });
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin - Manage Users</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-gray-100 p-4 rounded">
        <input
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded"
        />
        <input
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          {editingUser ? "Update User" : "Add User"}
        </button>
      </form>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">User List</h2>
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Email</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="border px-4 py-2">{user.name}</td>
                <td className="border px-4 py-2">{user.email}</td>
                <td className="border px-4 py-2 space-x-2">
                  <button onClick={() => handleEdit(user)} className="text-blue-600">Edit</button>
                  <button onClick={() => handleDelete(user.id)} className="text-red-600">Delete</button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="3" className="text-center py-4">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUserPage;
