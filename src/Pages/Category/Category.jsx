import React, { useState, useEffect } from "react";
import "./Category.css";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave } from "react-icons/fi";

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

  // Load categories from localStorage on mount
  useEffect(() => {
    const storedCategories = localStorage.getItem("categories");
    if (storedCategories) {
      setCategories(JSON.parse(storedCategories));
    }
  }, []);

  // Save categories to localStorage whenever categories change
  useEffect(() => {
    localStorage.setItem("categories", JSON.stringify(categories));
  }, [categories]);

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
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result;
        setFormData({
          ...formData,
          image: imageUrl,
        });
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
    if (!formData.image) {
      newErrors.image = "صورة الفئة مطلوبة";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingId) {
      // Update existing category
      setCategories(
        categories.map((cat) =>
          cat.id === editingId
            ? {
                ...cat,
                ...formData,
                updatedAt: new Date().toLocaleDateString(),
              }
            : cat
        )
      );
      setEditingId(null);
    } else {
      // Add new category
      const newCategory = {
        id: Date.now(),
        ...formData,
        createdAt: new Date().toLocaleDateString(),
      };
      setCategories([...categories, newCategory]);
    }

    // Reset form
    setFormData({ name: "", image: "" });
    setImagePreview("");
    setIsFormOpen(false);
    setErrors({});
  };

  const handleEdit = (category) => {
    setFormData({
      name: category.name,
      image: category.image || "",
    });
    setImagePreview(category.image || "");
    setEditingId(category.id);
    setIsFormOpen(true);
    setErrors({});
  };

  const handleDelete = (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذه الفئة؟")) {
      setCategories(categories.filter((cat) => cat.id !== id));
    }
  };

  const handleCancel = () => {
    setFormData({ name: "", image: "" });
    setImagePreview("");
    setIsFormOpen(false);
    setEditingId(null);
    setErrors({});
  };

  return (
    <div className="category-page">
      <div className="category-header">
        <h1 className="category-title">إدارة الفئات</h1>
        <button
          className="btn-add"
          onClick={() => setIsFormOpen(true)}
          disabled={isFormOpen}
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
                >
                  إلغاء
                </button>
                <button type="submit" className="btn-save">
                  <FiSave className="icon" />
                  {editingId ? "تحديث" : "حفظ"} الفئة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="categories-section">
        <h2 className="section-title">جميع الفئات</h2>
        {categories.length === 0 ? (
          <div className="empty-state">
            <p>لا توجد فئات بعد. انقر على "إضافة فئة جديدة" للبدء.</p>
          </div>
        ) : (
          <div className="categories-grid">
            {categories.map((category) => (
              <div key={category.id} className="category-card">
                <div className="category-content">
                  {category.image && (
                    <div className="category-image-container">
                      <img
                        src={category.image}
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
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(category.id)}
                    title="حذف الفئة"
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
