import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import LocalStorageService from './LocalStorageService';

class ExportService {
  static formatCurrency(value) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value).replace('IDR', 'Rp');
  }

  static async exportToExcel() {
    const workbook = XLSX.utils.book_new();
    
    const categories = [
      { key: 'pam-jaya', name: 'Tagihan PAM JAYA' },
      { key: 'listrik-pln', name: 'Tagihan Listrik PLN' },
      { key: 'pam-lainnya', name: 'Pembayaran PAM (Lainnya)' },
      { key: 'transaksi-umum', name: 'Transaksi Umum' },
      { key: 'penerimaan-negara', name: 'Penerimaan Negara' }
    ];

    categories.forEach(category => {
      const data = LocalStorageService.getData(category.key);
      
      if (data.length > 0) {
        // Format the data for Excel
        const formattedData = data.map(item => {
          const formatted = { ...item };
          
          // Format currency fields
          Object.keys(formatted).forEach(key => {
            if (key.includes('tagihan') || key.includes('biaya') || key.includes('bayar') || key.includes('setor')) {
              if (typeof formatted[key] === 'number') {
                formatted[key] = this.formatCurrency(formatted[key]);
              }
            }
          });
          
          // Remove ID field
          delete formatted.id;
          
          return formatted;
        });

        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        XLSX.utils.book_append_sheet(workbook, worksheet, category.name);
      }
    });

    // Generate filename with current date
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `billing-reports-${currentDate}.xlsx`;
    
    XLSX.writeFile(workbook, filename);
  }

  static async exportToPDF() {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    
    const categories = [
      { key: 'pam-jaya', name: 'Tagihan PAM JAYA' },
      { key: 'listrik-pln', name: 'Tagihan Listrik PLN' },
      { key: 'pam-lainnya', name: 'Pembayaran PAM (Lainnya)' },
      { key: 'transaksi-umum', name: 'Transaksi Umum' },
      { key: 'penerimaan-negara', name: 'Penerimaan Negara' }
    ];

    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      const data = LocalStorageService.getData(category.key);
      
      if (i > 0) {
        pdf.addPage();
      }
      
      // Add title
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(category.name, pageWidth / 2, 20, { align: 'center' });
      
      // Add current date
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const currentDate = new Date().toLocaleDateString('id-ID');
      pdf.text(`Tanggal: ${currentDate}`, 20, 35);
      
      if (data.length > 0) {
        // Create table data
        const tableData = data.map(item => {
          const row = [];
          Object.keys(item).forEach(key => {
            if (key !== 'id') {
              let value = item[key];
              if (key.includes('tagihan') || key.includes('biaya') || key.includes('bayar') || key.includes('setor')) {
                if (typeof value === 'number') {
                  value = this.formatCurrency(value);
                }
              }
              row.push(value);
            }
          });
          return row;
        });
        
        // Get headers (excluding id)
        const headers = Object.keys(data[0]).filter(key => key !== 'id');
        
        // Add table
        let yPosition = 45;
        pdf.setFontSize(8);
        
        // Headers
        pdf.setFont('helvetica', 'bold');
        headers.forEach((header, index) => {
          pdf.text(header, 20 + (index * 25), yPosition);
        });
        
        yPosition += 10;
        
        // Data rows
        pdf.setFont('helvetica', 'normal');
        tableData.forEach((row, rowIndex) => {
          row.forEach((cell, cellIndex) => {
            pdf.text(String(cell), 20 + (cellIndex * 25), yPosition);
          });
          yPosition += 8;
          
          // Add new page if needed
          if (yPosition > pageHeight - 20) {
            pdf.addPage();
            yPosition = 20;
          }
        });
      } else {
        pdf.setFontSize(12);
        pdf.text('Tidak ada data tersedia', pageWidth / 2, 60, { align: 'center' });
      }
    }
    
    // Generate filename with current date
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `billing-reports-${currentDate}.pdf`;
    
    pdf.save(filename);
  }
}

export default ExportService;