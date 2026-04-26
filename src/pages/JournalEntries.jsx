// src/pages/JournalEntries.jsx (Partial update for Submit Logic)
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // 1. Check if Debit equals Credit
  const totalDebit = newEntry.items.reduce((sum, i) => sum + Number(i.debit || 0), 0);
  const totalCredit = newEntry.items.reduce((sum, i) => sum + Number(i.credit || 0), 0);

  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    showToast(t('dashboard.journal_entries.mismatch_error'), 'error');
    return;
  }

  try {
    const response = await AxiosInstance.post('/finance/create_journal.php', {
      date: newEntry.date,
      description: newEntry.description,
      transactions: newEntry.items
    });
    
    if(response.data.status === "success") {
      showToast(`Voucher ${response.data.voucher_no} Created!`, 'success');
      setIsModalOpen(false);
      fetchEntries(); // Refresh list
    }
  } catch (error) {
    showToast("Failed to save entry", 'error');
  }
};
// src/pages/JournalEntries.jsx - Update generatePDF function
const generateVoucherPDF = (entry) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text("NASIRAH MART", 105, 20, { align: 'center' });
  doc.setFontSize(10);
  doc.text("JOURNAL VOUCHER", 105, 28, { align: 'center' });
  
  // Voucher Info
  doc.line(20, 35, 190, 35);
  doc.text(`Voucher No: ${entry.voucher_no}`, 20, 45);
  doc.text(`Date: ${entry.entry_date}`, 150, 45);
  doc.text(`Description: ${entry.description}`, 20, 55);
  
  // Table Header
  doc.setFillColor(240, 240, 240);
  doc.rect(20, 65, 170, 10, 'F');
  doc.text("Account Name", 25, 72);
  doc.text("Debit", 130, 72);
  doc.text("Credit", 165, 72);
  
  // Footer for Signatures
  doc.text("________________", 25, 250);
  doc.text("Prepared By", 30, 255);
  
  doc.text("________________", 150, 250);
  doc.text("Authorized By", 155, 255);
  
  doc.save(`Voucher_${entry.voucher_no}.pdf`);
};