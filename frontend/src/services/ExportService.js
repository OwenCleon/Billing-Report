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

  static getHumanReadableHeaders(categoryKey) {
    const headerMappings = {
      'pam-jaya': {
        'namaPAM': 'Nama PAM',
        'noRef': 'No. Ref',
        'noPelanggan': 'No. Pelanggan',
        'nama': 'Nama',
        'alamat': 'Alamat',
        'totalTagihan': 'Total Tagihan',
        'biayaAdmin': 'Biaya Admin',
        'periodeTerbayar': 'Periode Terbayar',
        'pemakaian': 'Pemakaian (m³)',
        'tagihan': 'Tagihan'
      },
      'listrik-pln': {
        'idPelanggan': 'ID Pelanggan',
        'namaCustomer': 'Nama Customer',
        'tarifDaya': 'Tarif / Daya',
        'tagihanPLN': 'Tagihan PLN',
        'noReferensi': 'No. Referensi',
        'blTh': 'BL / TH',
        'power': 'Power',
        'subscriberSegmentation': 'Subscriber Segmentation',
        'totalBayar': 'Total Bayar'
      },
      'pam-lainnya': {
        'noPelanggan': 'No. Pelanggan',
        'nama': 'Nama',
        'totalTagihan': 'Total Tagihan',
        'biayaAdmin': 'Biaya Admin',
        'totalBayar': 'Total Bayar',
        'periode': 'Periode',
        'tagihan': 'Tagihan'
      },
      'transaksi-umum': {
        'waktu': 'Waktu',
        'nomorReferensi': 'Nomor Referensi',
        'nomorPelanggan': 'Nomor Pelanggan',
        'nama': 'Nama',
        'totalTagihan': 'Total Tagihan',
        'biayaAdmin': 'Biaya Admin',
        'totalBayar': 'Total Bayar'
      },
      'penerimaan-negara': {
        'tanggal': 'Tanggal',
        'jam': 'Jam',
        'noReferensi': 'No. Referensi',
        'dariRekening': 'Dari Rekening',
        'kodeBilling': 'Kode Billing',
        'npwp': 'NPWP',
        'namaWP': 'Nama WP',
        'alamat': 'Alamat',
        'jumlahSetor': 'Jumlah Setor',
        'ntpn': 'NTPN',
        'ntb': 'NTB',
        'stan': 'STAN',
        'tanggalBuku': 'Tanggal Buku',
        'status': 'Status'
      }
    };
    
    return headerMappings[categoryKey] || {};
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
        const headerMapping = this.getHumanReadableHeaders(category.key);
        
        // Format the data for Excel with human-readable headers
        const formattedData = data.map(item => {
          const formatted = {};
          
          Object.keys(item).forEach(key => {
            if (key !== 'id') {
              const humanKey = headerMapping[key] || key;
              let value = item[key];
              
              // Format currency fields
              if (key.includes('tagihan') || key.includes('biaya') || key.includes('bayar') || key.includes('setor')) {
                if (typeof value === 'number') {
                  value = this.formatCurrency(value);
                }
              }
              
              formatted[humanKey] = value;
            }
          });
          
          return formatted;
        });

        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        
        // Set column widths and styling
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        const cols = [];
        
        for (let C = range.s.c; C <= range.e.c; ++C) {
          let maxWidth = 10;
          for (let R = range.s.r; R <= range.e.r; ++R) {
            const cell = worksheet[XLSX.utils.encode_cell({r: R, c: C})];
            if (cell && cell.v) {
              const cellWidth = cell.v.toString().length;
              if (cellWidth > maxWidth) {
                maxWidth = cellWidth;
              }
            }
          }
          cols.push({ width: Math.min(maxWidth + 2, 50) });
        }
        
        worksheet['!cols'] = cols;
        
        // Apply Times New Roman font to all cells
        for (let R = range.s.r; R <= range.e.r; ++R) {
          for (let C = range.s.c; C <= range.e.c; ++C) {
            const cell = worksheet[XLSX.utils.encode_cell({r: R, c: C})];
            if (cell) {
              cell.s = {
                font: { name: 'Times New Roman', sz: 11 },
                alignment: { vertical: 'center', horizontal: 'left' }
              };
              
              // Header styling
              if (R === 0) {
                cell.s.font.bold = true;
                cell.s.fill = { fgColor: { rgb: 'E6E6FA' } };
              }
            }
          }
        }
        
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