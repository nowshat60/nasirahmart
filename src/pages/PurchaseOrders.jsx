import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, ShoppingBag } from 'lucide-react';
import AxiosInstance from '../axios/AxiosInstance';
import { useToast } from '../context/ToastContext';

export const PurchaseOrder = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [order, setOrder] = useState({ supplier_id: '', date: new Date().toISOString().split('T')[0], items: [] });
  const { showToast } = useToast();

  useEffect(() => {
    AxiosInstance.get('/inventory/get_suppliers.php').then(res => setSuppliers(res.data));
    AxiosInstance.get('/inventory/get_inventory.php').then(res => setProducts(res.data.items));
  }, []);

  const addItem = () => {
    setOrder({ ...order, items: [...order.items, { product_id: '', qty: 1, price: 0 }] });
  };

  const removeItem = (index) => {
    const newItems = order.items.filter((_, i) => i !== index);
    setOrder({ ...order, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const total_amount = order.items.reduce((sum, item) => sum + (item.qty * item.price), 0);
    
    try {
      const res = await AxiosInstance.post('/inventory/purchase_controller.php', { ...order, total_amount });
      if (res.data.status === "success") {
        showToast("Purchase Recorded & Ledger Updated!", "success");
        setOrder({ supplier_id: '', date: new Date().toISOString().split('T')[0], items: [] });
      }
    } catch (err) {
      showToast("Error processing purchase", "error");
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-black text-slate-900 mb-8">New Purchase Order</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
        <div className="grid grid-cols-2 gap-8 mb-10">
          <div>
            <label className="block text-xs font-black uppercase text-slate-400 mb-2">Select Supplier</label>
            <select 
              className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold"
              value={order.supplier_id}
              onChange={(e) => setOrder({...order, supplier_id: e.target.value})}
              required
            >
              <option value="">Choose Supplier</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-slate-400 mb-2">Purchase Date</label>
            <input 
              type="date" 
              className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold"
              value={order.date}
              onChange={(e) => setOrder({...order, date: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-4 mb-10">
          {order.items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-4 items-center bg-slate-50 p-4 rounded-2xl">
              <div className="col-span-5">
                <select 
                  className="w-full bg-transparent border-none font-bold"
                  onChange={(e) => {
                    const newItems = [...order.items];
                    newItems[idx].product_id = e.target.value;
                    setOrder({...order, items: newItems});
                  }}
                >
                  <option>Select Product</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock_quantity})</option>)}
                </select>
              </div>
              <div className="col-span-3">
                <input type="number" placeholder="Qty" className="w-full bg-white p-2 rounded-xl border-none text-center font-bold" 
                  onChange={(e) => {
                    const newItems = [...order.items];
                    newItems[idx].qty = e.target.value;
                    setOrder({...order, items: newItems});
                  }}
                />
              </div>
              <div className="col-span-3">
                <input type="number" placeholder="Price" className="w-full bg-white p-2 rounded-xl border-none text-right font-bold"
                  onChange={(e) => {
                    const newItems = [...order.items];
                    newItems[idx].price = e.target.value;
                    setOrder({...order, items: newItems});
                  }}
                />
              </div>
              <button type="button" onClick={() => removeItem(idx)} className="col-span-1 text-rose-500"><Trash2 /></button>
            </div>
          ))}
          <button type="button" onClick={addItem} className="text-emerald-600 font-bold text-sm">+ Add Item</button>
        </div>

        <div className="flex justify-between items-center border-t pt-8">
          <div className="text-2xl font-black text-slate-900">
            Total: ৳ {order.items.reduce((sum, item) => sum + (item.qty * item.price), 0).toLocaleString()}
          </div>
          <button type="submit" className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-500 transition-all">
            <Save className="w-5 h-5" /> Confirm Purchase
          </button>
        </div>
      </form>
    </div>
  );
};