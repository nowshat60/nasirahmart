import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, ArrowUpRight, TrendingUp, Plus } from 'lucide-react';
import AxiosInstance from '../axios/AxiosInstance';

export const InventoryDashboard = () => {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ totalItems: 0, lowStock: 0, outOfStock: 0 });

  useEffect(() => {
    // Inventory list ebong stats fetch korar logic
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await AxiosInstance.get('/inventory/get_inventory.php');
      setItems(res.data.items);
      setStats(res.data.stats);
    } catch (e) { console.error("Inventory load failed"); }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-black text-slate-900">Inventory Status</h1>
        <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add New Product
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4"><Package /></div>
          <p className="text-slate-500 text-xs font-bold uppercase">Total SKUs</p>
          <h2 className="text-2xl font-black text-slate-900">{stats.totalItems}</h2>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-rose-100 shadow-sm">
          <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-4"><AlertTriangle /></div>
          <p className="text-slate-500 text-xs font-bold uppercase">Low Stock</p>
          <h2 className="text-2xl font-black text-rose-600">{stats.lowStock}</h2>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-emerald-100 shadow-sm">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4"><TrendingUp /></div>
          <p className="text-slate-500 text-xs font-bold uppercase">Total Stock Value</p>
          <h2 className="text-2xl font-black text-emerald-600">৳ {stats.totalValue?.toLocaleString()}</h2>
        </div>
      </div>

      {/* Product List Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase">Product Name</th>
              <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase">Current Stock</th>
              <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase">Unit Price</th>
              <th className="px-8 py-5 text-right text-xs font-black text-slate-400 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {items.map(item => (
              <tr key={item.id} className="hover:bg-slate-50/50">
                <td className="px-8 py-5 font-black text-slate-800">{item.name}</td>
                <td className="px-8 py-5 font-bold text-slate-600">{item.stock_quantity} units</td>
                <td className="px-8 py-5 text-slate-500">৳ {item.price}</td>
                <td className="px-8 py-5 text-right">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-black ${item.stock_quantity < 10 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {item.stock_quantity < 10 ? 'RESTOCK' : 'IN STOCK'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};