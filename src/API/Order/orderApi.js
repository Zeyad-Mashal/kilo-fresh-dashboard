const BASE_URL = "https://kilo-fresh-back.vercel.app/api";

// Get All Orders
export const getAllOrders = async () => {
  try {
    const response = await fetch(`${BASE_URL}/order/getAll`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "فشل في جلب الطلبات",
      }));
      throw new Error(errorData.message || "فشل في جلب الطلبات");
    }

    const data = await response.json();
    return {
      success: true,
      orders: data.orders,
      count: data.count,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "حدث خطأ في الاتصال بالخادم",
    };
  }
};

// Get Order By ID
export const getOrderById = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/order/getById/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "فشل في جلب الطلب",
      }));
      throw new Error(errorData.message || "فشل في جلب الطلب");
    }

    const data = await response.json();
    return {
      success: true,
      order: data.order,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "حدث خطأ في الاتصال بالخادم",
    };
  }
};

// Create Order (Checkout)
export const createOrder = async (name, phone, address, cartId, shipping) => {
  try {
    const response = await fetch(`${BASE_URL}/order/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        phone,
        address,
        cartId,
        shipping: shipping || 50,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "فشل في إنشاء الطلب",
      }));
      throw new Error(errorData.message || "فشل في إنشاء الطلب");
    }

    const data = await response.json();
    return {
      success: true,
      order: data.order,
      message: data.message || "تم إنشاء الطلب بنجاح",
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "حدث خطأ في الاتصال بالخادم",
    };
  }
};

// Update Order Status
export const updateOrderStatus = async (id, status) => {
  try {
    const response = await fetch(`${BASE_URL}/order/updateStatus/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "فشل في تحديث حالة الطلب",
      }));
      throw new Error(errorData.message || "فشل في تحديث حالة الطلب");
    }

    const data = await response.json();
    return {
      success: true,
      order: data.order,
      message: data.message || "تم تحديث حالة الطلب بنجاح",
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "حدث خطأ في الاتصال بالخادم",
    };
  }
};

// Delete Order
export const deleteOrder = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/order/delete/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "فشل في حذف الطلب",
      }));
      throw new Error(errorData.message || "فشل في حذف الطلب");
    }

    const data = await response.json();
    return {
      success: true,
      message: data.message || "تم حذف الطلب بنجاح",
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "حدث خطأ في الاتصال بالخادم",
    };
  }
};

