import { useState, useEffect } from "react";
import api from "../api/api";

function Categories() {
  const [activeTab, setActiveTab] = useState("EXPENSE");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    icon: "💰",
    color: "#3b82f6", // Default blue
    type: "EXPENSE"
  });

  useEffect(() => {
    fetchCategories();
  }, [activeTab]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/categories?type=${activeTab}`);
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newCategory = { ...formData, type: activeTab };
      await api.post("/categories", newCategory);
      setFormData({ ...formData, name: "", icon: "💰" }); // Reset form
      fetchCategories(); // Refresh list
    } catch (err) {
      alert("Failed to add category");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err) {
      alert("Failed to delete category");
    }
  };

  return (
    <div className="text-zinc-800 dark:text-zinc-100 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Manage Categories</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-zinc-200 dark:border-zinc-700">
        <button
          className={`pb-2 px-4 ${
            activeTab === "EXPENSE"
              ? "border-b-2 border-blue-500 font-bold text-blue-500"
              : "text-zinc-500"
          }`}
          onClick={() => setActiveTab("EXPENSE")}
        >
          Expense Categories
        </button>
        <button
          className={`pb-2 px-4 ${
            activeTab === "INCOME"
              ? "border-b-2 border-green-500 font-bold text-green-500"
              : "text-zinc-500"
          }`}
          onClick={() => setActiveTab("INCOME")}
        >
          Income Categories
        </button>
      </div>

      {/* Add Form */}
      <div className="card p-6 mb-8 bg-white dark:bg-zinc-800 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Add New Category</h2>
        <form onSubmit={handleSubmit} className="flex gap-4 items-end flex-wrap">
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input
              type="text"
              required
              className="input px-3 py-2 border rounded dark:bg-zinc-700 dark:border-zinc-600"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Groceries"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Icon (Emoji)</label>
            <input
              type="text"
              className="input px-3 py-2 border rounded w-20 text-center dark:bg-zinc-700 dark:border-zinc-600"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="🍔"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Color</label>
            <input
              type="color"
              className="h-10 w-20 p-1 border rounded dark:bg-zinc-700 dark:border-zinc-600"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="btn bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Add Category
          </button>
        </form>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p>Loading...</p>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between p-4 bg-white dark:bg-zinc-800 rounded-lg shadow border-l-4"
              style={{ borderLeftColor: cat.color || "#ccc" }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{cat.icon || "📁"}</span>
                <span className="font-medium">{cat.name}</span>
              </div>
              <button
                onClick={() => handleDelete(cat.id)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Delete
              </button>
            </div>
          ))
        )}
        
        {!loading && categories.length === 0 && (
          <p className="text-zinc-500 col-span-3 text-center py-8">
            No categories found. Add one above!
          </p>
        )}
      </div>
    </div>
  );
}

export default Categories;
