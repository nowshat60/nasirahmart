import React, { useState, useEffect } from 'react';
import { Users, DollarSign, Calendar, CheckCircle, ArrowRight, Download } from 'lucide-react';
import AxiosInstance from "../axios/AxiosInstance";
import { useToast } from '../context/ToastContext';

export const Payroll = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    // Employee list fetch koro (assuming you have an employee table)
    const fetchEmployees = async () => {
      try {
        const res = await AxiosInstance.get('/hr/get_employees.php');
        setEmployees(res.data);
        setLoading(false);
      } catch (e) {
        showToast("Failed to load employees", "error");
      }
    };
    fetchEmployees();
  }, []);

  const processSalary = async (empId, amount) => {
    try {
      const payload = {
        date: new Date().toISOString().split('T')[0],
        employee_id: empId,
        amount: amount,
        description: `Salary payment for ${new Date().toLocaleString('default', { month: 'long' })}`
      };
      // Eta auto-journal entry create korbe (Debit Expense, Credit Cash)
      await AxiosInstance.post('/finance/process_payroll.php', payload);
      showToast("Salary processed and posted to ledger!", "success");
    } catch (e) {
      showToast("Payroll processing failed", "error");
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-black text-slate-900 mb-8">Payroll Management</h1>
      
      <div className="grid grid-cols-1 gap-6">
        {employees.map(emp => (
          <div key={emp.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600">
                {emp.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-black text-slate-900">{emp.name}</h4>
                <p className="text-xs text-slate-500 font-bold uppercase">{emp.designation}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-10">
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Salary</p>
                <p className="font-black text-slate-900">৳ {emp.base_salary.toLocaleString()}</p>
              </div>
              <button 
                onClick={() => processSalary(emp.id, emp.base_salary)}
                className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-500 transition-all"
              >
                Pay Salary <DollarSign className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};