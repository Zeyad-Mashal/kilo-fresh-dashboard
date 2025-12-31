import React, { useState, useEffect } from "react";
import "./Product.css";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiSave,
  FiImage,
} from "react-icons/fi";

const Product = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priceBefore: "",
    priceAfter: "",
    categoryId: "",
    images: [],
    isOffer: false,
  });
  const [errors, setErrors] = useState({});
  const [imagePreviews, setImagePreviews] = useState([]);

  // Load categories from localStorage
  useEffect(() => {
    const loadCategories = () => {
      const storedCategories = localStorage.getItem("categories");
      if (storedCategories) {
        setCategories(JSON.parse(storedCategories));
      }
    };

    loadCategories();
    // Listen for category updates
    const interval = setInterval(loadCategories, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    const validFiles = files.filter((file) => {
      if (file.size > maxSize) {
        setErrors({
          ...errors,
          images: "حجم إحدى الصور كبير جداً (الحد الأقصى 5 ميجابايت لكل صورة)",
        });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const readers = validFiles.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((newImages) => {
      setFormData({
        ...formData,
        images: [...formData.images, ...newImages],
      });
      setImagePreviews([...imagePreviews, ...newImages]);
      if (errors.images) {
        setErrors({
          ...errors,
          images: "",
        });
      }
    });
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      images: newImages,
    });
    setImagePreviews(newPreviews);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = "عنوان المنتج مطلوب";
    }
    if (!formData.description.trim()) {
      newErrors.description = "وصف المنتج مطلوب";
    }
    if (!formData.priceBefore || parseFloat(formData.priceBefore) <= 0) {
      newErrors.priceBefore = "السعر قبل الخصم مطلوب ويجب أن يكون أكبر من صفر";
    }
    if (!formData.priceAfter || parseFloat(formData.priceAfter) <= 0) {
      newErrors.priceAfter = "السعر بعد الخصم مطلوب ويجب أن يكون أكبر من صفر";
    }
    if (parseFloat(formData.priceAfter) >= parseFloat(formData.priceBefore)) {
      newErrors.priceAfter = "السعر بعد الخصم يجب أن يكون أقل من السعر الأصلي";
    }
    if (!formData.categoryId) {
      newErrors.categoryId = "يجب اختيار الفئة";
    }
    if (formData.images.length === 0) {
      newErrors.images = "يجب إضافة صورة واحدة على الأقل";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingId) {
      setProducts(
        products.map((prod) =>
          prod.id === editingId
            ? {
                ...prod,
                ...formData,
                priceBefore: parseFloat(formData.priceBefore),
                priceAfter: parseFloat(formData.priceAfter),
                updatedAt: new Date().toLocaleDateString(),
              }
            : prod
        )
      );
      setEditingId(null);
    } else {
      const newProduct = {
        id: Date.now(),
        ...formData,
        priceBefore: parseFloat(formData.priceBefore),
        priceAfter: parseFloat(formData.priceAfter),
        createdAt: new Date().toLocaleDateString(),
      };
      setProducts([...products, newProduct]);
    }

    setFormData({
      title: "",
      description: "",
      priceBefore: "",
      priceAfter: "",
      categoryId: "",
      images: [],
      isOffer: false,
    });
    setImagePreviews([]);
    setIsFormOpen(false);
    setErrors({});
  };

  const handleEdit = (product) => {
    setFormData({
      title: product.title,
      description: product.description,
      priceBefore: product.priceBefore.toString(),
      priceAfter: product.priceAfter.toString(),
      categoryId: product.categoryId,
      images: product.images,
      isOffer: product.isOffer || false,
    });
    setImagePreviews(product.images);
    setEditingId(product.id);
    setIsFormOpen(true);
    setErrors({});
  };

  const handleDelete = (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
      setProducts(products.filter((prod) => prod.id !== id));
    }
  };

  const handleCancel = () => {
    setFormData({
      title: "",
      description: "",
      priceBefore: "",
      priceAfter: "",
      categoryId: "",
      images: [],
      isOffer: false,
    });
    setImagePreviews([]);
    setIsFormOpen(false);
    setEditingId(null);
    setErrors({});
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "غير محدد";
  };

  return (
    <div className="product-page">
      <div className="product-header">
        <h1 className="product-title">إدارة المنتجات</h1>
        <button
          className="btn-add"
          onClick={() => setIsFormOpen(true)}
          disabled={isFormOpen}
        >
          <FiPlus className="icon" />
          إضافة منتج جديد
        </button>
      </div>

      {/* Add/Edit Form */}
      {isFormOpen && (
        <div className="form-overlay" onClick={handleCancel}>
          <div className="form-container" onClick={(e) => e.stopPropagation()}>
            <div className="form-header">
              <h2>{editingId ? "تعديل المنتج" : "إضافة منتج جديد"}</h2>
              <button className="btn-close" onClick={handleCancel}>
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-group">
                <label htmlFor="title">
                  عنوان المنتج <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={errors.title ? "input-error" : ""}
                  placeholder="أدخل عنوان المنتج"
                  autoFocus
                />
                {errors.title && (
                  <span className="error-message">{errors.title}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="description">
                  وصف المنتج <span className="required">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className={errors.description ? "input-error" : ""}
                  placeholder="أدخل وصف المنتج"
                />
                {errors.description && (
                  <span className="error-message">{errors.description}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="priceBefore">
                    السعر قبل الخصم <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    id="priceBefore"
                    name="priceBefore"
                    value={formData.priceBefore}
                    onChange={handleInputChange}
                    className={errors.priceBefore ? "input-error" : ""}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                  {errors.priceBefore && (
                    <span className="error-message">{errors.priceBefore}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="priceAfter">
                    السعر بعد الخصم <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    id="priceAfter"
                    name="priceAfter"
                    value={formData.priceAfter}
                    onChange={handleInputChange}
                    className={errors.priceAfter ? "input-error" : ""}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                  {errors.priceAfter && (
                    <span className="error-message">{errors.priceAfter}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="categoryId">
                  الفئة <span className="required">*</span>
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className={errors.categoryId ? "input-error" : ""}
                >
                  <option value="">اختر الفئة</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <span className="error-message">{errors.categoryId}</span>
                )}
                {categories.length === 0 && (
                  <span className="error-message" style={{ color: "#ffd700" }}>
                    لا توجد فئات متاحة. يرجى إضافة فئة أولاً من صفحة الفئات.
                  </span>
                )}
              </div>

              <div className="form-group checkbox-group">
                <label htmlFor="isOffer" className="checkbox-label">
                  <input
                    type="checkbox"
                    id="isOffer"
                    name="isOffer"
                    checked={formData.isOffer}
                    onChange={handleInputChange}
                    className="checkbox-input"
                  />
                  <span>إضافة المنتج إلى قسم العروض ؟</span>
                </label>
              </div>

              <div className="form-group">
                <label htmlFor="images">
                  صور المنتج <span className="required">*</span>
                </label>
                <input
                  type="file"
                  id="images"
                  name="images"
                  accept="image/*"
                  multiple
                  onChange={handleImagesChange}
                  className="file-input"
                />
                {errors.images && (
                  <span className="error-message">{errors.images}</span>
                )}
                {imagePreviews.length > 0 && (
                  <div className="images-preview-container">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="image-preview-item">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="image-preview"
                        />
                        <button
                          type="button"
                          className="btn-remove-image"
                          onClick={() => removeImage(index)}
                        >
                          <FiX />
                        </button>
                      </div>
                    ))}
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
                  {editingId ? "تحديث" : "حفظ"} المنتج
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products List */}
      <div className="products-section">
        <h2 className="section-title">جميع المنتجات</h2>
        {products.length === 0 ? (
          <div className="empty-state">
            <p>لا توجد منتجات بعد. انقر على "إضافة منتج جديد" للبدء.</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-content">
                  {product.images.length > 0 && (
                    <div className="product-images-container">
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="product-image"
                      />
                      {product.isOffer && (
                        <div className="offer-badge">عرض</div>
                      )}
                      {product.images.length > 1 && (
                        <div className="images-count">
                          <FiImage />+{product.images.length - 1}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="product-info">
                    <h3 className="product-title-card">{product.title}</h3>
                    <p className="product-description">{product.description}</p>
                    <div className="product-category">
                      <span className="category-badge">
                        {getCategoryName(product.categoryId)}
                      </span>
                      {product.isOffer && (
                        <span className="offer-badge-text">في العروض</span>
                      )}
                    </div>
                    <div className="product-prices">
                      <span className="price-before">
                        {product.priceBefore} ر.س
                      </span>
                      <span className="price-after">
                        {product.priceAfter} ر.س
                      </span>
                    </div>
                  </div>
                </div>
                <div className="product-actions">
                  <button
                    className="btn-edit"
                    onClick={() => handleEdit(product)}
                    title="تعديل المنتج"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(product.id)}
                    title="حذف المنتج"
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

export default Product;
