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
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../API/Product/productApi";
import { getAllCategories } from "../../API/Category/categoryApi";

const Product = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    priceBefore: "",
    priceAfter: "",
    categoryId: "",
    isOffer: false,
  });
  const [errors, setErrors] = useState({});
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Load products and categories from API on mount
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const result = await getAllProducts();
    setLoading(false);
    if (result.success) {
      setProducts(result.products);
    } else {
      setMessage({ type: "error", text: result.error });
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    }
  };

  const fetchCategories = async () => {
    const result = await getAllCategories();
    if (result.success) {
      setCategories(result.categories);
    }
  };

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

    setImageFiles([...imageFiles, ...validFiles]);

    const readers = validFiles.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((newPreviews) => {
      setImagePreviews([...imagePreviews, ...newPreviews]);
      if (errors.images) {
        setErrors({
          ...errors,
          images: "",
        });
      }
    });
  };

  const removeImage = (index) => {
    // Check if it's an existing image or a new file
    const totalPreviews = existingImages.length + imagePreviews.length;
    if (index < existingImages.length) {
      // Remove existing image
      const newExisting = existingImages.filter((_, i) => i !== index);
      setExistingImages(newExisting);
    } else {
      // Remove new file
      const fileIndex = index - existingImages.length;
      const newFiles = imageFiles.filter((_, i) => i !== fileIndex);
      const newPreviews = imagePreviews.filter((_, i) => i !== fileIndex);
      setImageFiles(newFiles);
      setImagePreviews(newPreviews);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "اسم المنتج مطلوب";
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
    if (!editingId && imageFiles.length === 0) {
      newErrors.images = "يجب إضافة صورة واحدة على الأقل";
    }
    if (editingId && existingImages.length === 0 && imageFiles.length === 0) {
      newErrors.images = "يجب إضافة صورة واحدة على الأقل";
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
      // Update existing product
      result = await updateProduct(
        editingId,
        formData.name.trim(),
        formData.priceBefore,
        formData.priceAfter,
        formData.description.trim(),
        formData.categoryId,
        formData.isOffer,
        imageFiles.length > 0 ? imageFiles : undefined
      );
    } else {
      // Create new product
      result = await createProduct(
        formData.name.trim(),
        formData.priceBefore,
        formData.priceAfter,
        formData.description.trim(),
        formData.categoryId,
        formData.isOffer,
        imageFiles
      );
    }

    setLoading(false);

    if (result.success) {
      setMessage({ type: "success", text: result.message });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      // Reset form
      setFormData({
        name: "",
        description: "",
        priceBefore: "",
        priceAfter: "",
        categoryId: "",
        isOffer: false,
      });
      setImagePreviews([]);
      setImageFiles([]);
      setExistingImages([]);
      setIsFormOpen(false);
      setErrors({});
      setEditingId(null);
      // Refresh products list
      await fetchProducts();
    } else {
      setErrors({ submit: result.error });
      setMessage({ type: "error", text: result.error });
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      description: product.description,
      priceBefore: product.priceBefore.toString(),
      priceAfter: product.priceAfter.toString(),
      categoryId: product.category?._id || product.category || "",
      isOffer: product.isOffer || false,
    });
    // Set existing images for preview
    const existingImageUrls = product.images?.map((img) => img.url) || [];
    setExistingImages(existingImageUrls);
    setImagePreviews([]);
    setImageFiles([]);
    setEditingId(product._id);
    setIsFormOpen(true);
    setErrors({});
  };

  const handleDelete = async (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
      setLoading(true);
      const result = await deleteProduct(id);
      setLoading(false);

      if (result.success) {
        setMessage({ type: "success", text: result.message });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        // Refresh products list
        await fetchProducts();
      } else {
        setMessage({ type: "error", text: result.error });
        setTimeout(() => setMessage({ type: "", text: "" }), 5000);
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      description: "",
      priceBefore: "",
      priceAfter: "",
      categoryId: "",
      isOffer: false,
    });
    setImagePreviews([]);
    setImageFiles([]);
    setExistingImages([]);
    setIsFormOpen(false);
    setEditingId(null);
    setErrors({});
  };

  const getCategoryName = (categoryId) => {
    if (!categoryId) return "غير محدد";
    const category = categories.find((cat) => cat._id === categoryId);
    return category ? category.name : "غير محدد";
  };

  const getAllImagePreviews = () => {
    return [...existingImages, ...imagePreviews];
  };

  return (
    <div className="product-page">
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      <div className="product-header">
        <h1 className="product-title">إدارة المنتجات</h1>
        <button
          className="btn-add"
          onClick={() => setIsFormOpen(true)}
          disabled={isFormOpen || loading}
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
                <label htmlFor="name">
                  اسم المنتج <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={errors.name ? "input-error" : ""}
                  placeholder="أدخل اسم المنتج"
                  autoFocus
                />
                {errors.name && (
                  <span className="error-message">{errors.name}</span>
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
                    <option key={category._id} value={category._id}>
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
                {errors.submit && (
                  <span className="error-message">{errors.submit}</span>
                )}
                {getAllImagePreviews().length > 0 && (
                  <div className="images-preview-container">
                    {getAllImagePreviews().map((preview, index) => (
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
                  disabled={loading}
                >
                  إلغاء
                </button>
                <button type="submit" className="btn-save" disabled={loading}>
                  <FiSave className="icon" />
                  {loading
                    ? "جاري الحفظ..."
                    : editingId
                    ? "تحديث"
                    : "حفظ"}{" "}
                  المنتج
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products List */}
      <div className="products-section">
        <h2 className="section-title">جميع المنتجات</h2>
        {loading && products.length === 0 ? (
          <div className="empty-state">
            <p>جاري التحميل...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <p>لا توجد منتجات بعد. انقر على "إضافة منتج جديد" للبدء.</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <div key={product._id} className="product-card">
                <div className="product-content">
                  {product.images && product.images.length > 0 && (
                    <div className="product-images-container">
                      <img
                        src={product.images[0].url}
                        alt={product.name}
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
                    <h3 className="product-title-card">{product.name}</h3>
                    <p className="product-description">{product.description}</p>
                    <div className="product-category">
                      <span className="category-badge">
                        {getCategoryName(
                          product.category?._id || product.category
                        )}
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
                    disabled={loading}
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(product._id)}
                    title="حذف المنتج"
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

export default Product;
