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
        
        // Set column widths
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
          cols.push({ width: Math.min(maxWidth + 3, 50) });
        }
        
        worksheet['!cols'] = cols;
        
        // Apply Times New Roman font to all cells
        for (let R = range.s.r; R <= range.e.r; ++R) {
          for (let C = range.s.c; C <= range.e.c; ++C) {
            const cell = worksheet[XLSX.utils.encode_cell({r: R, c: C})];
            if (cell) {
              // Apply Times New Roman font explicitly
              cell.s = {
                font: { 
                  name: 'Times New Roman', 
                  sz: 12,
                  family: 1 // Roman family
                },
                alignment: { 
                  vertical: 'center', 
                  horizontal: 'left',
                  wrapText: true
                }
              };
              
              // Header styling with Times New Roman
              if (R === 0) {
                cell.s.font.bold = true;
                cell.s.font.name = 'Times New Roman';
                cell.s.fill = { fgColor: { rgb: 'E6E6FA' } };
                cell.s.alignment.horizontal = 'center';
              }
            }
          }
        }
        
        XLSX.utils.book_append_sheet(workbook, worksheet, category.name);
      }
    });

    // Set workbook properties to enforce Times New Roman
    workbook.Props = {
      Title: 'Billing Reports',
      Subject: 'Monthly Billing Data',
      Author: 'Billing System',
      CreatedDate: new Date()
    };

    // Generate filename with current date
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `billing-reports-${currentDate}.xlsx`;
    
    XLSX.writeFile(workbook, filename);
  }

  static async exportToPDF() {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 20;
    const usableWidth = pageWidth - (margin * 2);
    
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
      
      // Set font to Times New Roman explicitly
      pdf.setFont('times', 'normal');
      
      // Add title (center-aligned)
      pdf.setFontSize(16);
      pdf.setFont('times', 'bold');
      pdf.text(category.name, pageWidth / 2, 25, { align: 'center' });
      
      // Add current date (left-aligned)
      pdf.setFontSize(10);
      pdf.setFont('times', 'normal');
      const currentDate = new Date().toLocaleDateString('id-ID');
      pdf.text(`Tanggal: ${currentDate}`, margin, 35);
      
      if (data.length > 0) {
        const headerMapping = this.getHumanReadableHeaders(category.key);
        
        // Get headers (excluding id)
        const headers = Object.keys(data[0]).filter(key => key !== 'id');
        const humanHeaders = headers.map(key => headerMapping[key] || key);
        
        // Calculate optimal column widths
        const numColumns = headers.length;
        let baseFontSize = 10;
        
        // Adjust font size based on number of columns
        if (numColumns > 12) {
          baseFontSize = 7;
        } else if (numColumns > 10) {
          baseFontSize = 8;
        } else if (numColumns > 8) {
          baseFontSize = 9;
        }
        
        // Calculate column widths evenly distributed
        const columnWidth = usableWidth / numColumns;
        const minColumnWidth = 15; // Minimum width per column
        
        // Adjust if columns are too narrow
        const adjustedColumnWidth = Math.max(columnWidth, minColumnWidth);
        
        // Start table
        let yPosition = 50;
        const lineHeight = baseFontSize * 0.5 + 2; // Responsive line height
        
        pdf.setFontSize(baseFontSize);
        
        // Headers (center-aligned)
        pdf.setFont('times', 'bold');
        let xPosition = margin;
        
        humanHeaders.forEach((header, index) => {
          // Center text within column
          const textWidth = pdf.getTextWidth(header);
          const centerX = xPosition + (adjustedColumnWidth / 2) - (textWidth / 2);
          pdf.text(header, Math.max(xPosition, centerX), yPosition);
          xPosition += adjustedColumnWidth;
        });
        
        // Draw line under headers
        pdf.setLineWidth(0.5);
        pdf.line(margin, yPosition + 3, margin + (adjustedColumnWidth * numColumns), yPosition + 3);
        yPosition += lineHeight + 5;
        
        // Data rows
        pdf.setFont('times', 'normal');
        
        data.forEach((item, rowIndex) => {
          xPosition = margin;
          let maxRowHeight = lineHeight;
          
          headers.forEach((header, colIndex) => {
            let value = item[header];
            
            // Format currency fields
            if (header.includes('tagihan') || header.includes('biaya') || header.includes('bayar') || header.includes('setor')) {
              if (typeof value === 'number') {
                value = this.formatCurrency(value);
              }
            }
            
            // Convert value to string and limit length if necessary
            let cellText = String(value);
            
            // Truncate text if too long for column width
            const maxTextWidth = adjustedColumnWidth - 2; // Leave 2mm padding
            while (pdf.getTextWidth(cellText) > maxTextWidth && cellText.length > 3) {
              cellText = cellText.substring(0, cellText.length - 4) + '...';
            }
            
            // Left-align data within column
            pdf.text(cellText, xPosition + 1, yPosition); // 1mm left padding
            
            xPosition += adjustedColumnWidth;
          });
          
          yPosition += lineHeight;
          
          // Add new page if needed
          if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = 25;
            
            // Re-print title and headers on new page
            pdf.setFontSize(14);
            pdf.setFont('times', 'bold');
            pdf.text(category.name, pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 15;
            
            // Re-print headers
            pdf.setFontSize(baseFontSize);
            pdf.setFont('times', 'bold');
            xPosition = margin;
            
            humanHeaders.forEach((header, index) => {
              const textWidth = pdf.getTextWidth(header);
              const centerX = xPosition + (adjustedColumnWidth / 2) - (textWidth / 2);
              pdf.text(header, Math.max(xPosition, centerX), yPosition);
              xPosition += adjustedColumnWidth;
            });
            
            pdf.line(margin, yPosition + 3, margin + (adjustedColumnWidth * numColumns), yPosition + 3);
            yPosition += lineHeight + 5;
            pdf.setFont('times', 'normal');
          }
        });
      } else {
        // No data message (center-aligned)
        pdf.setFontSize(12);
        pdf.setFont('times', 'italic');
        pdf.text('Tidak ada data tersedia', pageWidth / 2, 70, { align: 'center' });
      }
    }
    
    // Generate filename with current date
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `billing-reports-${currentDate}.pdf`;
    
    pdf.save(filename);
  }
}

export default ExportService;