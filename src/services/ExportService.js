import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import LocalStorageService from './LocalStorageService';

class ExportService {
  static formatCurrency(value) {
    if (!value) return '';
    const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, '')) : value;
    
    // Format with Indonesian locale for proper thousand separators and comma for decimals
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(numericValue).replace('IDR', 'Rp').replace(/\s/g, ' ');
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
              
              // Format currency fields with proper Indonesian formatting
              if (key.includes('tagihan') || key.includes('biaya') || key.includes('bayar') || key.includes('setor')) {
                if (typeof value === 'number') {
                  // Format as Indonesian currency: Rp 250.000,50
                  const formatted = new Intl.NumberFormat('id-ID', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2
                  }).format(value);
                  value = `Rp ${formatted}`;
                }
              }
              
              formatted[humanKey] = value;
            }
          });
          
          return formatted;
        });

        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        
        // Set column widths and auto-fit
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        const cols = [];
        
        for (let C = range.s.c; C <= range.e.c; ++C) {
          let maxWidth = 12; // Minimum width
          for (let R = range.s.r; R <= range.e.r; ++R) {
            const cell = worksheet[XLSX.utils.encode_cell({r: R, c: C})];
            if (cell && cell.v) {
              const cellWidth = cell.v.toString().length;
              if (cellWidth > maxWidth) {
                maxWidth = cellWidth;
              }
            }
          }
          // Add padding and set max width
          cols.push({ width: Math.min(maxWidth + 4, 60) });
        }
        
        worksheet['!cols'] = cols;
        
        // Apply Times New Roman font and formatting to all cells
        for (let R = range.s.r; R <= range.e.r; ++R) {
          for (let C = range.s.c; C <= range.e.c; ++C) {
            const cell = worksheet[XLSX.utils.encode_cell({r: R, c: C})];
            if (cell) {
              const header = Object.keys(formattedData[0] || {})[C];
              const isNumericField = header && (
                header.includes('Tagihan') || 
                header.includes('Biaya') || 
                header.includes('Bayar') || 
                header.includes('Setor') ||
                header.includes('Power') ||
                header.includes('Pemakaian')
              );
              
              // Apply Times New Roman font with proper alignment
              cell.s = {
                font: { 
                  name: 'Times New Roman', 
                  sz: 11,
                  family: 1 // Roman family
                },
                alignment: { 
                  vertical: 'center', 
                  horizontal: isNumericField && R > 0 ? 'right' : (R === 0 ? 'center' : 'left'),
                  wrapText: true
                },
                border: {
                  top: { style: 'thin', color: { rgb: 'CCCCCC' } },
                  bottom: { style: 'thin', color: { rgb: 'CCCCCC' } },
                  left: { style: 'thin', color: { rgb: 'CCCCCC' } },
                  right: { style: 'thin', color: { rgb: 'CCCCCC' } }
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
        
        // Set row heights for better readability
        const rows = [];
        for (let R = range.s.r; R <= range.e.r; ++R) {
          rows.push({ hpt: R === 0 ? 20 : 16 }); // Header row taller
        }
        worksheet['!rows'] = rows;
        
        XLSX.utils.book_append_sheet(workbook, worksheet, category.name);
      }
    });

    // Set workbook properties with Times New Roman as default
    workbook.Props = {
      Title: 'Billing Reports',
      Subject: 'Monthly Billing Data',
      Author: 'Billing System',
      CreatedDate: new Date()
    };

    // Set workbook default font to Times New Roman
    workbook.Workbook = {
      Views: [{
        RTL: false
      }]
    };

    // Generate filename with current date
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `billing-reports-${currentDate}.xlsx`;
    
    XLSX.writeFile(workbook, filename);
  }

  static async exportToCombinedPDF() {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 15;
    const usableWidth = pageWidth - (margin * 2);
    
    // Multi-column layout settings
    const numColumns = 3;
    const columnWidth = (usableWidth - ((numColumns - 1) * 5)) / numColumns; // 5mm spacing between columns
    const columnSpacing = 5;
    
    const categories = [
      { key: 'pam-jaya', name: 'Tagihan PAM JAYA' },
      { key: 'listrik-pln', name: 'Tagihan Listrik PLN' },
      { key: 'pam-lainnya', name: 'Pembayaran PAM (Lainnya)' },
      { key: 'transaksi-umum', name: 'Transaksi Umum' },
      { key: 'penerimaan-negara', name: 'Penerimaan Negara' }
    ];

    // Set font to Times New Roman
    pdf.setFont('times', 'normal');
    
    // Add main title
    pdf.setFontSize(16);
    pdf.setFont('times', 'bold');
    pdf.text('LAPORAN BILLING LENGKAP', pageWidth / 2, 20, { align: 'center' });
    
    // Add current date
    pdf.setFontSize(9);
    pdf.setFont('times', 'normal');
    const currentDate = new Date().toLocaleDateString('id-ID');
    pdf.text(`Tanggal Cetak: ${currentDate}`, margin, 30);
    
    // Initialize layout variables
    let currentColumn = 0;
    let yPosition = 40;
    const maxYPosition = pageHeight - 20; // Bottom margin
    const columnStartY = 40;
    
    // Collect all data from all categories
    const allEntries = [];
    categories.forEach(category => {
      const data = LocalStorageService.getData(category.key);
      data.forEach(item => {
        allEntries.push({
          category: category.name,
          data: item,
          headerMapping: this.getHumanReadableHeaders(category.key)
        });
      });
    });
    
    // Process each entry
    allEntries.forEach((entry, entryIndex) => {
      const headers = Object.keys(entry.data).filter(key => key !== 'id');
      
      // Calculate space needed for this entry
      const estimatedHeight = (headers.length * 4.5) + 12; // 4.5mm per field + spacing
      
      // Check if entry fits in current column
      if (yPosition + estimatedHeight > maxYPosition) {
        // Move to next column
        currentColumn++;
        yPosition = columnStartY;
        
        // Check if we need a new page
        if (currentColumn >= numColumns) {
          pdf.addPage();
          currentColumn = 0;
          yPosition = columnStartY;
        }
      }
      
      // Calculate X position for current column
      const xPosition = margin + (currentColumn * (columnWidth + columnSpacing));
      
      // Add category label (small, italic)
      pdf.setFontSize(7);
      pdf.setFont('times', 'italic');
      pdf.text(`[${entry.category}]`, xPosition, yPosition);
      yPosition += 6;
      
      // Add entry fields
      pdf.setFontSize(8);
      headers.forEach((header) => {
        const humanLabel = entry.headerMapping[header] || header;
        let value = entry.data[header];
        
        // Format currency fields
        if (header.includes('tagihan') || header.includes('biaya') || header.includes('bayar') || header.includes('setor')) {
          if (typeof value === 'number') {
            const formatted = new Intl.NumberFormat('id-ID', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2
            }).format(value);
            value = `Rp ${formatted}`;
          }
        }
        
        // Format datetime fields
        if (header === 'waktu' && value) {
          const date = new Date(value);
          value = date.toLocaleString('id-ID');
        }
        
        // Format date fields
        if ((header === 'tanggal' || header === 'tanggalBuku') && value) {
          const date = new Date(value);
          value = date.toLocaleDateString('id-ID');
        }
        
        // Label (bold)
        pdf.setFont('times', 'bold');
        const labelText = `${humanLabel}:`;
        pdf.text(labelText, xPosition, yPosition);
        
        // Value (normal) - handle text wrapping within column
        pdf.setFont('times', 'normal');
        const labelWidth = pdf.getTextWidth(labelText);
        const valueStartX = xPosition + labelWidth + 2; // 2mm spacing
        const maxValueWidth = columnWidth - labelWidth - 4; // Leave some margin
        
        // Split text if too long for column
        const valueLines = pdf.splitTextToSize(String(value), maxValueWidth);
        
        valueLines.forEach((line, lineIndex) => {
          pdf.text(line, valueStartX, yPosition + (lineIndex * 3.5));
        });
        
        yPosition += Math.max(4.5, valueLines.length * 3.5);
      });
      
      // Add separator line between entries
      if (entryIndex < allEntries.length - 1) {
        pdf.setLineWidth(0.2);
        pdf.setDrawColor(180, 180, 180);
        pdf.line(xPosition, yPosition + 2, xPosition + columnWidth - 5, yPosition + 2);
        yPosition += 6;
      } else {
        yPosition += 4; // Less space for last entry
      }
    });
    
    // Add summary footer
    pdf.setFontSize(8);
    pdf.setFont('times', 'italic');
    const totalEntries = allEntries.length;
    const footerText = `Total ${totalEntries} entri dari ${categories.length} kategori billing`;
    pdf.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });
    
    // Generate filename
    const currentDateFile = new Date().toISOString().split('T')[0];
    const filename = `billing-combined-${currentDateFile}.pdf`;
    
    pdf.save(filename);
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
      pdf.setFontSize(18);
      pdf.setFont('times', 'bold');
      pdf.text(category.name, pageWidth / 2, 25, { align: 'center' });
      
      // Add current date (left-aligned)
      pdf.setFontSize(10);
      pdf.setFont('times', 'normal');
      const currentDate = new Date().toLocaleDateString('id-ID');
      pdf.text(`Tanggal: ${currentDate}`, margin, 40);
      
      let yPosition = 55;
      
      if (data.length > 0) {
        const headerMapping = this.getHumanReadableHeaders(category.key);
        
        // Get headers (excluding id)
        const headers = Object.keys(data[0]).filter(key => key !== 'id');
        
        // Process each data item as a vertical block
        data.forEach((item, itemIndex) => {
          // Check if we need a new page
          const estimatedHeight = headers.length * 6 + 15; // Estimate space needed
          if (yPosition + estimatedHeight > pageHeight - 30) {
            pdf.addPage();
            
            // Re-add title on new page
            pdf.setFontSize(16);
            pdf.setFont('times', 'bold');
            pdf.text(category.name, pageWidth / 2, 25, { align: 'center' });
            
            yPosition = 45;
          }
          
          // Add item separator if not first item
          if (itemIndex > 0) {
            pdf.setLineWidth(0.3);
            pdf.setDrawColor(200, 200, 200);
            pdf.line(margin, yPosition - 5, pageWidth - margin, yPosition - 5);
            yPosition += 5;
          }
          
          // Process each field as label: value
          headers.forEach((header) => {
            const humanLabel = headerMapping[header] || header;
            let value = item[header];
            
            // Format currency fields
            if (header.includes('tagihan') || header.includes('biaya') || header.includes('bayar') || header.includes('setor')) {
              if (typeof value === 'number') {
                // Format as Indonesian currency: Rp 250.000,50
                const formatted = new Intl.NumberFormat('id-ID', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2
                }).format(value);
                value = `Rp ${formatted}`;
              }
            }
            
            // Format datetime fields
            if (header === 'waktu' && value) {
              const date = new Date(value);
              value = date.toLocaleString('id-ID');
            }
            
            // Format date fields
            if ((header === 'tanggal' || header === 'tanggalBuku') && value) {
              const date = new Date(value);
              value = date.toLocaleDateString('id-ID');
            }
            
            pdf.setFontSize(10);
            
            // Label (bold)
            pdf.setFont('times', 'bold');
            pdf.text(`${humanLabel}:`, margin, yPosition);
            
            // Value (normal) - positioned after the label with proper spacing
            pdf.setFont('times', 'normal');
            const labelWidth = pdf.getTextWidth(`${humanLabel}:`);
            const valueStartX = margin + labelWidth + 3; // 3mm spacing
            
            // Handle long values with text wrapping
            const maxValueWidth = usableWidth - labelWidth - 5;
            const valueLines = pdf.splitTextToSize(String(value), maxValueWidth);
            
            valueLines.forEach((line, lineIndex) => {
              pdf.text(line, valueStartX, yPosition + (lineIndex * 5));
            });
            
            yPosition += Math.max(5, valueLines.length * 5); // Minimum 5mm line height
          });
          
          yPosition += 10; // Space between items
        });
      } else {
        // No data message (center-aligned)
        pdf.setFontSize(12);
        pdf.setFont('times', 'italic');
        pdf.text('Tidak ada data tersedia', pageWidth / 2, yPosition + 20, { align: 'center' });
      }
    }
    
    // Generate filename with current date
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `billing-reports-${currentDate}.pdf`;
    
    pdf.save(filename);
  }
}

export default ExportService;