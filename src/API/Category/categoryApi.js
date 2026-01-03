const BASE_URL = "https://kilo-fresh-back.vercel.app/api/categories";

// Get All Categories
export const getAllCategories = async () => {
  try {
    const response = await fetch(`${BASE_URL}/category/getAll`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "فشل في جلب الفئات",
      }));
      throw new Error(errorData.message || "فشل في جلب الفئات");
    }

    const data = await response.json();
    return {
      success: true,
      categories: data.categories,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "حدث خطأ في الاتصال بالخادم",
    };
  }
};

// Get Category By ID
export const getCategoryById = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/category/getById/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "فشل في جلب الفئة",
      }));
      throw new Error(errorData.message || "فشل في جلب الفئة");
    }

    const data = await response.json();
    return {
      success: true,
      category: data.category,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "حدث خطأ في الاتصال بالخادم",
    };
  }
};

// Create Category
export const createCategory = async (name, imageFile) => {
  try {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("image", imageFile);

    const response = await fetch(`${BASE_URL}/addCategory`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "فشل في إضافة الفئة",
      }));
      throw new Error(errorData.message || "فشل في إضافة الفئة");
    }

    const data = await response.json();
    return {
      success: true,
      category: data.category,
      message: data.message || "تم إضافة الفئة بنجاح",
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "حدث خطأ في الاتصال بالخادم",
    };
  }
};

// Update Category
export const updateCategory = async (id, name, imageFile) => {
  try {
    const formData = new FormData();
    formData.append("name", name);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    const response = await fetch(`${BASE_URL}/updateCategory/${id}`, {
      method: "PUT",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "فشل في تحديث الفئة",
      }));
      throw new Error(errorData.message || "فشل في تحديث الفئة");
    }

    const data = await response.json();
    return {
      success: true,
      category: data.category,
      message: data.message || "تم تحديث الفئة بنجاح",
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "حدث خطأ في الاتصال بالخادم",
    };
  }
};

// Delete Category
export const deleteCategory = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/deleteCategory/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "فشل في حذف الفئة",
      }));
      throw new Error(errorData.message || "فشل في حذف الفئة");
    }

    const data = await response.json();
    return {
      success: true,
      message: data.message || "تم حذف الفئة بنجاح",
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "حدث خطأ في الاتصال بالخادم",
    };
  }
};

