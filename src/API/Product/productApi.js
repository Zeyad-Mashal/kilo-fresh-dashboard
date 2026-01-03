const BASE_URL = "https://kilo-fresh-back.vercel.app/api/products";

// Get All Products
export const getAllProducts = async () => {
  try {
    const response = await fetch(`${BASE_URL}/product/getAll`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "فشل في جلب المنتجات",
      }));
      throw new Error(errorData.message || "فشل في جلب المنتجات");
    }

    const data = await response.json();
    return {
      success: true,
      products: data.products,
      count: data.count,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "حدث خطأ في الاتصال بالخادم",
    };
  }
};

// Get Product By ID
export const getProductById = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/product/getById/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "فشل في جلب المنتج",
      }));
      throw new Error(errorData.message || "فشل في جلب المنتج");
    }

    const data = await response.json();
    return {
      success: true,
      product: data.product,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "حدث خطأ في الاتصال بالخادم",
    };
  }
};

// Get Products By Category
export const getProductsByCategory = async (categoryId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/product/getByCategory/${categoryId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "فشل في جلب المنتجات",
      }));
      throw new Error(errorData.message || "فشل في جلب المنتجات");
    }

    const data = await response.json();
    return {
      success: true,
      products: data.products,
      category: data.category,
      count: data.count,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "حدث خطأ في الاتصال بالخادم",
    };
  }
};

// Get All Offered Products
export const getAllOfferedProducts = async () => {
  try {
    const response = await fetch(`${BASE_URL}/product/offers`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "فشل في جلب المنتجات المعروضة",
      }));
      throw new Error(errorData.message || "فشل في جلب المنتجات المعروضة");
    }

    const data = await response.json();
    return {
      success: true,
      products: data.products,
      count: data.count,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "حدث خطأ في الاتصال بالخادم",
    };
  }
};

// Search Products
export const searchProducts = async (query) => {
  try {
    const response = await fetch(
      `${BASE_URL}/product/search?query=${encodeURIComponent(query)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "فشل في البحث",
      }));
      throw new Error(errorData.message || "فشل في البحث");
    }

    const data = await response.json();
    return {
      success: true,
      products: data.products,
      query: data.query,
      count: data.count,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "حدث خطأ في الاتصال بالخادم",
    };
  }
};

// Create Product
export const createProduct = async (
  name,
  priceBefore,
  priceAfter,
  description,
  category,
  isOffer,
  imageFiles
) => {
  try {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("priceBefore", priceBefore);
    formData.append("priceAfter", priceAfter);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("isOffer", isOffer ? "true" : "false");

    // Append all image files
    imageFiles.forEach((file) => {
      formData.append("images", file);
    });

    const response = await fetch(`${BASE_URL}/addProduct`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "فشل في إضافة المنتج",
      }));
      throw new Error(errorData.message || "فشل في إضافة المنتج");
    }

    const data = await response.json();
    return {
      success: true,
      product: data.product,
      message: data.message || "تم إضافة المنتج بنجاح",
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "حدث خطأ في الاتصال بالخادم",
    };
  }
};

// Update Product
export const updateProduct = async (
  id,
  name,
  priceBefore,
  priceAfter,
  description,
  category,
  isOffer,
  imageFiles
) => {
  try {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("priceBefore", priceBefore);
    formData.append("priceAfter", priceAfter);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("isOffer", isOffer ? "true" : "false");

    // Append new image files if provided
    if (imageFiles && imageFiles.length > 0) {
      imageFiles.forEach((file) => {
        formData.append("images", file);
      });
    }

    const response = await fetch(`${BASE_URL}/updateProduct/${id}`, {
      method: "PUT",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "فشل في تحديث المنتج",
      }));
      throw new Error(errorData.message || "فشل في تحديث المنتج");
    }

    const data = await response.json();
    return {
      success: true,
      product: data.product,
      message: data.message || "تم تحديث المنتج بنجاح",
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "حدث خطأ في الاتصال بالخادم",
    };
  }
};

// Delete Product
export const deleteProduct = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/deleteProduct/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "فشل في حذف المنتج",
      }));
      throw new Error(errorData.message || "فشل في حذف المنتج");
    }

    const data = await response.json();
    return {
      success: true,
      message: data.message || "تم حذف المنتج بنجاح",
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "حدث خطأ في الاتصال بالخادم",
    };
  }
};

