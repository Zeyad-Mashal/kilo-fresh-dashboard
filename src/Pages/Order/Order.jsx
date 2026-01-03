import React, { useState, useEffect } from "react";
import "./Order.css";
import { FiTrash2, FiEye, FiX } from "react-icons/fi";
import {
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  getOrderById,
} from "../../API/Order/orderApi";

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const result = await getAllOrders();
    setLoading(false);
    if (result.success) {
      setOrders(result.orders);
    } else {
      setMessage({ type: "error", text: result.error });
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setLoading(true);
    const result = await updateOrderStatus(orderId, newStatus);
    setLoading(false);

    if (result.success) {
      setMessage({ type: "success", text: result.message });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      await fetchOrders();
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(result.order);
      }
    } else {
      setMessage({ type: "error", text: result.error });
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذا الطلب؟")) {
      setLoading(true);
      const result = await deleteOrder(id);
      setLoading(false);

      if (result.success) {
        setMessage({ type: "success", text: result.message });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        await fetchOrders();
        if (selectedOrder && selectedOrder._id === id) {
          setIsDetailOpen(false);
          setSelectedOrder(null);
        }
      } else {
        setMessage({ type: "error", text: result.error });
        setTimeout(() => setMessage({ type: "", text: "" }), 5000);
      }
    }
  };

  const handleViewDetails = async (order) => {
    const result = await getOrderById(order._id);
    if (result.success) {
      setSelectedOrder(result.order);
      setIsDetailOpen(true);
    } else {
      setMessage({ type: "error", text: result.error });
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    }
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      pending: "قيد الانتظار",
      processing: "قيد المعالجة",
      completed: "مكتمل",
      cancelled: "ملغي",
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    const statusClassMap = {
      pending: "status-pending",
      processing: "status-processing",
      completed: "status-completed",
      cancelled: "status-cancelled",
    };
    return statusClassMap[status] || "";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="order-page">
      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      <div className="order-header">
        <h1 className="order-title">إدارة الطلبات</h1>
      </div>

      {/* Orders List */}
      <div className="orders-section">
        {loading && orders.length === 0 ? (
          <div className="empty-state">
            <p>جاري التحميل...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <p>لا توجد طلبات بعد.</p>
          </div>
        ) : (
          <div className="orders-container">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-card-header">
                  <div className="order-info">
                    <h3 className="order-name">{order.name}</h3>
                    <p className="order-phone">{order.phone}</p>
                    <p className="order-date">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className={`order-status ${getStatusClass(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </div>
                </div>

                <div className="order-card-body">
                  <div className="order-summary">
                    <div className="summary-item">
                      <span className="summary-label">عدد العناصر:</span>
                      <span className="summary-value">{order.items.length}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">المجموع:</span>
                      <span className="summary-value total-price">
                        {order.total.toFixed(2)} ر.س
                      </span>
                    </div>
                  </div>

                  <div className="order-address">
                    <strong>العنوان:</strong> {order.address}
                  </div>
                </div>

                <div className="order-card-footer">
                  <div className="status-selector">
                    <label>تغيير الحالة:</label>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order._id, e.target.value)
                      }
                      disabled={loading}
                      className="status-select"
                    >
                      <option value="pending">قيد الانتظار</option>
                      <option value="processing">قيد المعالجة</option>
                      <option value="completed">مكتمل</option>
                      <option value="cancelled">ملغي</option>
                    </select>
                  </div>
                  <div className="order-actions">
                    <button
                      className="btn-view"
                      onClick={() => handleViewDetails(order)}
                      title="عرض التفاصيل"
                      disabled={loading}
                    >
                      <FiEye />
                      التفاصيل
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(order._id)}
                      title="حذف الطلب"
                      disabled={loading}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {isDetailOpen && selectedOrder && (
        <div
          className="detail-overlay"
          onClick={() => {
            setIsDetailOpen(false);
            setSelectedOrder(null);
          }}
        >
          <div
            className="detail-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="detail-header">
              <h2>تفاصيل الطلب</h2>
              <button
                className="btn-close"
                onClick={() => {
                  setIsDetailOpen(false);
                  setSelectedOrder(null);
                }}
              >
                <FiX />
              </button>
            </div>

            <div className="detail-content">
              <div className="detail-section">
                <h3>معلومات العميل</h3>
                <div className="detail-info">
                  <div className="info-item">
                    <span className="info-label">الاسم:</span>
                    <span className="info-value">{selectedOrder.name}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">الهاتف:</span>
                    <span className="info-value">{selectedOrder.phone}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">العنوان:</span>
                    <span className="info-value">{selectedOrder.address}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">تاريخ الطلب:</span>
                    <span className="info-value">
                      {formatDate(selectedOrder.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>عناصر الطلب</h3>
                <div className="items-table">
                  <table>
                    <thead>
                      <tr>
                        <th>اسم المنتج</th>
                        <th>الكمية</th>
                        <th>السعر</th>
                        <th>المجموع</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, index) => (
                        <tr key={index}>
                          <td>{item.productName}</td>
                          <td>{item.quantity}</td>
                          <td>{(item.price / item.quantity).toFixed(2)} ر.س</td>
                          <td>{item.price.toFixed(2)} ر.س</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="detail-section">
                <h3>ملخص الطلب</h3>
                <div className="order-totals">
                  <div className="total-row">
                    <span>المجموع الفرعي:</span>
                    <span>{selectedOrder.subtotal.toFixed(2)} ر.س</span>
                  </div>
                  <div className="total-row">
                    <span>الشحن:</span>
                    <span>{selectedOrder.shipping.toFixed(2)} ر.س</span>
                  </div>
                  <div className="total-row total-final">
                    <span>الإجمالي:</span>
                    <span>{selectedOrder.total.toFixed(2)} ر.س</span>
                  </div>
                </div>
              </div>

              <div className="detail-actions">
                <div className="status-selector-full">
                  <label>حالة الطلب:</label>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) =>
                      handleStatusChange(selectedOrder._id, e.target.value)
                    }
                    disabled={loading}
                    className="status-select"
                  >
                    <option value="pending">قيد الانتظار</option>
                    <option value="processing">قيد المعالجة</option>
                    <option value="completed">مكتمل</option>
                    <option value="cancelled">ملغي</option>
                  </select>
                </div>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(selectedOrder._id)}
                  disabled={loading}
                >
                  <FiTrash2 />
                  حذف الطلب
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Order;

