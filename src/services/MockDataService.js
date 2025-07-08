// Mock data service for demonstration
class MockDataService {
  static generateMockData() {
    const mockData = {
      'pam-jaya': [
        {
          id: '1',
          namaPAM: 'PAM JAYA Pusat',
          noRef: 'REF001',
          noPelanggan: 'PEL001',
          nama: 'John Doe',
          alamat: 'Jl. Sudirman No. 1, Jakarta',
          totalTagihan: 250000,
          biayaAdmin: 2500,
          periodeTerbayar: 'Februari 2025',
          pemakaian: 25,
          tagihan: 247500
        },
        {
          id: '2',
          namaPAM: 'PAM JAYA Selatan',
          noRef: 'REF002',
          noPelanggan: 'PEL002',
          nama: 'Jane Smith',
          alamat: 'Jl. Gatot Subroto No. 15, Jakarta',
          totalTagihan: 180000,
          biayaAdmin: 2500,
          periodeTerbayar: 'Februari 2025',
          pemakaian: 18,
          tagihan: 177500
        }
      ],
      'listrik-pln': [
        {
          id: '1',
          idPelanggan: 'PLN001',
          namaCustomer: 'Ahmad Rahman',
          tarifDaya: 'R1 / 1300VA',
          tagihanPLN: 450000,
          noReferensi: 'PLNREF001',
          blTh: 'FEB25',
          power: 1300,
          subscriberSegmentation: 'R1',
          totalBayar: 452500
        },
        {
          id: '2',
          idPelanggan: 'PLN002',
          namaCustomer: 'Siti Nurhaliza',
          tarifDaya: 'R2 / 2200VA',
          tagihanPLN: 680000,
          noReferensi: 'PLNREF002',
          blTh: 'FEB25',
          power: 2200,
          subscriberSegmentation: 'R2',
          totalBayar: 682500
        }
      ],
      'pam-lainnya': [
        {
          id: '1',
          noPelanggan: 'PAML001',
          nama: 'Budi Santoso',
          totalTagihan: 120000,
          biayaAdmin: 2000,
          totalBayar: 122000,
          periode: 'Februari 2025',
          tagihan: 118000
        }
      ],
      'transaksi-umum': [
        {
          id: '1',
          waktu: '2025-02-15T10:30:00',
          nomorReferensi: 'TU001',
          nomorPelanggan: 'UMUM001',
          nama: 'CV. Maju Jaya',
          totalTagihan: 500000,
          biayaAdmin: 5000,
          totalBayar: 505000
        }
      ],
      'penerimaan-negara': [
        {
          id: '1',
          tanggal: '2025-02-15',
          jam: '14:30:00',
          noReferensi: 'PN001',
          dariRekening: '1234567890',
          kodeBilling: 'BILL001',
          npwp: '123456789012345',
          namaWP: 'PT. ABC Indonesia',
          alamat: 'Jl. Thamrin No. 10, Jakarta',
          jumlahSetor: 1000000,
          ntpn: '625234F8BLL43NKH',
          ntb: '000088162354',
          stan: '162437',
          tanggalBuku: '2025-02-15',
          status: 'BERHASIL'
        }
      ]
    };

    // Store in localStorage if not exists
    Object.keys(mockData).forEach(key => {
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify(mockData[key]));
      }
    });

    return mockData;
  }

  static initializeMockData() {
    this.generateMockData();
  }
}

export default MockDataService;