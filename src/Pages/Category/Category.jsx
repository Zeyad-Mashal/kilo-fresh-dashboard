import React, { useState, useEffect } from "react";
import "./Category.css";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave } from "react-icons/fi";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../API/Category/categoryApi";

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    image: "",
  });
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Load categories from API on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const result = await getAllCategories();
    setLoading(false);
    if (result.success) {
      setCategories(result.categories);
    } else {
      setMessage({ type: "error", text: result.error });
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setErrors({
          ...errors,
          image: "حجم الصورة كبير جداً (الحد الأقصى 5 ميجابايت)",
        });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result;
        setImagePreview(imageUrl);
        if (errors.image) {
          setErrors({
            ...errors,
            image: "",
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "اسم الفئة مطلوب";
    }
    if (!editingId && !imageFile) {
      newErrors.image = "صورة الفئة مطلوبة";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    let result;

    if (editingId) {
      // Update existing category
      result = await updateCategory(editingId, formData.name.trim(), imageFile);
    } else {
      // Create new category
      result = await createCategory(formData.name.trim(), imageFile);
    }

    setLoading(false);

    if (result.success) {
      setMessage({ type: "success", text: result.message });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      // Reset form
      setFormData({ name: "", image: "" });
      setImagePreview("");
      setImageFile(null);
      setIsFormOpen(false);
      setErrors({});
      setEditingId(null);
      // Refresh categories list
      await fetchCategories();
    } else {
      setErrors({ submit: result.error });
      setMessage({ type: "error", text: result.error });
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    }
  };

  const handleEdit = (category) => {
    setFormData({
      name: category.name,
      image: category.image?.url || "",
    });
    setImagePreview(category.image?.url || "");
    setImageFile(null);
    setEditingId(category._id);
    setIsFormOpen(true);
    setErrors({});
  };

  const handleDelete = async (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذه الفئة؟")) {
      setLoading(true);
      const result = await deleteCategory(id);
      setLoading(false);

      if (result.success) {
        setMessage({ type: "success", text: result.message });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        // Refresh categories list
        await fetchCategories();
      } else {
        setMessage({ type: "error", text: result.error });
        setTimeout(() => setMessage({ type: "", text: "" }), 5000);
      }
    }
  };

  const handleCancel = () => {
    setFormData({ name: "", image: "" });
    setImagePreview("");
    setImageFile(null);
    setIsFormOpen(false);
    setEditingId(null);
    setErrors({});
  };

  return (
    <div className="category-page">
      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}
      <div className="category-header">
        <h1 className="category-title">إدارة الفئات</h1>
        <button
          className="btn-add"
          onClick={() => setIsFormOpen(true)}
          disabled={isFormOpen || loading}
        >
          <FiPlus className="icon" />
          إضافة فئة جديدة
        </button>
      </div>

      {/* Add/Edit Form */}
      {isFormOpen && (
        <div className="form-overlay" onClick={handleCancel}>
          <div className="form-container" onClick={(e) => e.stopPropagation()}>
            <div className="form-header">
              <h2>{editingId ? "تعديل الفئة" : "إضافة فئة جديدة"}</h2>
              <button className="btn-close" onClick={handleCancel}>
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="category-form">
              <div className="form-group">
                <label htmlFor="name">
                  اسم الفئة <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={errors.name ? "input-error" : ""}
                  placeholder="أدخل اسم الفئة"
                  autoFocus
                />
                {errors.name && (
                  <span className="error-message">{errors.name}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="image">
                  صورة الفئة <span className="required">*</span>
                </label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file-input"
                />
                {errors.image && (
                  <span className="error-message">{errors.image}</span>
                )}
                {errors.submit && (
                  <span className="error-message">{errors.submit}</span>
                )}
                {imagePreview && (
                  <div className="image-preview-container">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="image-preview"
                    />
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  إلغاء
                </button>
                <button type="submit" className="btn-save" disabled={loading}>
                  <FiSave className="icon" />
                  {loading ? "جاري الحفظ..." : editingId ? "تحديث" : "حفظ"}{" "}
                  الفئة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="categories-section">
        <h2 className="section-title">جميع الفئات</h2>
        {loading && categories.length === 0 ? (
          <div className="empty-state">
            <p>جاري التحميل...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="empty-state">
            <p>لا توجد فئات بعد. انقر على "إضافة فئة جديدة" للبدء.</p>
          </div>
        ) : (
          <div className="categories-grid">
            {categories.map((category) => (
              <div key={category._id} className="category-card">
                <div className="category-content">
                  {category.image?.url && (
                    <div className="category-image-container">
                      <img
                        src={category.image.url}
                        alt={category.name}
                        className="category-image"
                      />
                    </div>
                  )}
                  <h3 className="category-name">{category.name}</h3>
                </div>
                <div className="category-actions">
                  <button
                    className="btn-edit"
                    onClick={() => handleEdit(category)}
                    title="تعديل الفئة"
                    disabled={loading}
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(category._id)}
                    title="حذف الفئة"
                    disabled={loading}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Category;
