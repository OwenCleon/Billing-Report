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
    const margin = 15;
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
      
      // Set font to Times New Roman
      pdf.setFont('times', 'normal');
      
      // Add title
      pdf.setFontSize(16);
      pdf.setFont('times', 'bold');
      pdf.text(category.name, pageWidth / 2, 25, { align: 'center' });
      
      // Add current date
      pdf.setFontSize(10);
      pdf.setFont('times', 'normal');
      const currentDate = new Date().toLocaleDateString('id-ID');
      pdf.text(`Tanggal: ${currentDate}`, margin, 35);
      
      // Add "Made by Owen C with ❤️" credit
      pdf.setFontSize(8);
      pdf.setFont('times', 'italic');
      pdf.text('Made by Owen C with ❤️', pageWidth - margin, 35, { align: 'right' });
      
      if (data.length > 0) {
        const headerMapping = this.getHumanReadableHeaders(category.key);
        
        // Get headers (excluding id)
        const headers = Object.keys(data[0]).filter(key => key !== 'id');
        const humanHeaders = headers.map(key => headerMapping[key] || key);
        
        // Calculate column widths based on content
        const columnWidths = headers.map(header => {
          const headerLength = (headerMapping[header] || header).length;
          const maxContentLength = Math.max(...data.map(item => {
            let value = item[header];
            if (header.includes('tagihan') || header.includes('biaya') || header.includes('bayar') || header.includes('setor')) {
              if (typeof value === 'number') {
                value = this.formatCurrency(value);
              }
            }
            return value.toString().length;
          }));
          return Math.max(headerLength, maxContentLength);
        });
        
        // Calculate total width needed
        const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);
        
        // Adjust column widths to fit page
        const scaleFactor = usableWidth / (totalWidth * 2.5); // 2.5 is approximate char width
        const adjustedWidths = columnWidths.map(width => Math.max(width * scaleFactor, 15));
        
        // Start table
        let yPosition = 50;
        const lineHeight = 6;
        
        // Determine font size based on number of columns
        const fontSize = headers.length > 10 ? 7 : headers.length > 8 ? 8 : 9;
        pdf.setFontSize(fontSize);
        
        // Headers
        pdf.setFont('times', 'bold');
        let xPosition = margin;
        humanHeaders.forEach((header, index) => {
          // Wrap text if too long
          const wrappedHeader = pdf.splitTextToSize(header, adjustedWidths[index]);
          pdf.text(wrappedHeader, xPosition, yPosition);
          xPosition += adjustedWidths[index];
        });
        
        // Draw line under headers
        pdf.line(margin, yPosition + 2, pageWidth - margin, yPosition + 2);
        yPosition += lineHeight + 2;
        
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
            
            // Wrap text if too long
            const wrappedText = pdf.splitTextToSize(String(value), adjustedWidths[colIndex]);
            pdf.text(wrappedText, xPosition, yPosition);
            
            // Calculate row height based on wrapped text
            const textHeight = wrappedText.length * (fontSize * 0.35);
            maxRowHeight = Math.max(maxRowHeight, textHeight);
            
            xPosition += adjustedWidths[colIndex];
          });
          
          yPosition += maxRowHeight;
          
          // Add new page if needed
          if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = 25;
            
            // Re-print headers on new page
            pdf.setFont('times', 'bold');
            xPosition = margin;
            humanHeaders.forEach((header, index) => {
              const wrappedHeader = pdf.splitTextToSize(header, adjustedWidths[index]);
              pdf.text(wrappedHeader, xPosition, yPosition);
              xPosition += adjustedWidths[index];
            });
            
            pdf.line(margin, yPosition + 2, pageWidth - margin, yPosition + 2);
            yPosition += lineHeight + 4;
            pdf.setFont('times', 'normal');
          }
        });
      } else {
        pdf.setFontSize(12);
        pdf.setFont('times', 'normal');
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