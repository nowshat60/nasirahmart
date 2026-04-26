import React, { useState, useEffect } from 'react';
import { UserPlus, Phone, Mail, MapPin, Trash2 } from 'lucide-react';
import AxiosInstance from '../axios/AxiosInstance';

export const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState([]);
  
  useEffect(() => {
    AxiosInstance.get('/inventory/get_suppliers.php').then(res => setSuppliers(res.data));
  }, []);

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-black text-slate-900">Supplier Directory</h1>
        <button className="bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold">+ Add Supplier</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map(s => (
          <div key={s.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 mb-4">{s.name}</h3>
            <div className="space-y-3 text-slate-500 font-medium text-sm">
              <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> {s.phone}</div>
              <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> {s.email}</div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {s.address}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};