import React, { useEffect, useState } from 'react';

interface Order {
  id: string;
  user_name: string;
  total_amount: string;
  status: string;
  payment_method: string;
  created_at: string;
}

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        'http://localhost/nasirah-mart/api-php/orders/get_all_orders.php'
      );

      const data = await res.json();

      console.log('Fetched Orders:', data);

      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        setOrders([]);
      }

    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // auto refresh every 10 sec
    const interval = setInterval(fetchOrders, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Order Management
      </h1>

      {loading ? (
        <div className="text-gray-500">
          Loading Orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="text-red-500 font-semibold">
          No Orders Found
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 border">Order ID</th>
                <th className="p-4 border">Customer</th>
                <th className="p-4 border">Amount</th>
                <th className="p-4 border">Payment</th>
                <th className="p-4 border">Status</th>
                <th className="p-4 border">Date</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50 transition"
                >
                  <td className="p-4 border font-semibold">
                    #{order.id}
                  </td>

                  <td className="p-4 border">
                    {order.user_name || 'Guest'}
                  </td>

                  <td className="p-4 border">
                    ৳{order.total_amount}
                  </td>

                  <td className="p-4 border">
                    {order.payment_method}
                  </td>

                  <td className="p-4 border capitalize">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        order.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : order.status === 'processing'
                          ? 'bg-blue-100 text-blue-700'
                          : order.status === 'delivered'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>

                  <td className="p-4 border">
                    {new Date(order.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;