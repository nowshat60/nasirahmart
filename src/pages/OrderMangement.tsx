import React, { useEffect, useState } from 'react';

interface Order {
  id: string;
  user_name: string;
  total_amount: string;
  status: string;
  payment_method: string;
  created_at: string;
}

export const OrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetch('http://localhost/nasirah-mart/api-php/orders/get_all_orders.php')
      .then(res => res.json())
      .then(data => {
        console.log('Fetched Orders:', data);
        setOrders(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Order Management</h1>

      {orders.length === 0 ? (
        <div>No Orders Found</div>
      ) : (
        <table className="w-full border">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.user_name}</td>
                <td>{order.total_amount}</td>
                <td>{order.payment_method}</td>
                <td>{order.status}</td>
                <td>{order.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};