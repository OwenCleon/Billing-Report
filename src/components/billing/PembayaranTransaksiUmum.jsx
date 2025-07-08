import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import LocalStorageService from '../../services/LocalStorageService';
import MockDataService from '../../services/MockDataService';
import { toast } from 'sonner';

const PembayaranTransaksiUmum = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    waktu: '',
    nomorReferensi: '',
    nomorPelanggan: '',
    nama: '',
    totalTagihan: '',
    biayaAdmin: '',
    totalBayar: ''
  });

  const category = 'transaksi-umum';

  useEffect(() => {
    MockDataService.initializeMockData();
    loadData();
  }, []);

  const loadData = () => {
    const storedData = LocalStorageService.getData(category);
    setData(storedData);
  };

  const formatCurrency = (value) => {
    if (!value) return '';
    const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, '')) : value;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(numericValue).replace('IDR', 'Rp');
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return date.toLocaleString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const processedData = {
      ...formData,
      totalTagihan: parseFloat(formData.totalTagihan) || 0,
      biayaAdmin: parseFloat(formData.biayaAdmin) || 0,
      totalBayar: parseFloat(formData.totalBayar) || 0
    };

    if (editingItem) {
      LocalStorageService.updateItem(category, editingItem.id, processedData);
      toast.success('Data berhasil diupdate!');
    } else {
      LocalStorageService.addItem(category, processedData);
      toast.success('Data berhasil ditambahkan!');
    }

    loadData();
    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      waktu: item.waktu,
      nomorReferensi: item.nomorReferensi,
      nomorPelanggan: item.nomorPelanggan,
      nama: item.nama,
      totalTagihan: item.totalTagihan.toString(),
      biayaAdmin: item.biayaAdmin.toString(),
      totalBayar: item.totalBayar.toString()
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      LocalStorageService.deleteItem(category, id);
      loadData();
      toast.success('Data berhasil dihapus!');
    }
  };

  const resetForm = () => {
    setFormData({
      waktu: '',
      nomorReferensi: '',
      nomorPelanggan: '',
      nama: '',
      totalTagihan: '',
      biayaAdmin: '',
      totalBayar: ''
    });
    setEditingItem(null);
  };

  const filteredData = data.filter(item =>
    Object.values(item).some(val =>
      val.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Cari data..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Data
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Edit Data' : 'Tambah Data Baru'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="waktu">Waktu</Label>
                  <Input
                    id="waktu"
                    type="datetime-local"
                    value={formData.waktu}
                    onChange={(e) => handleInputChange('waktu', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="nomorReferensi">Nomor Referensi</Label>
                  <Input
                    id="nomorReferensi"
                    value={formData.nomorReferensi}
                    onChange={(e) => handleInputChange('nomorReferensi', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="nomorPelanggan">Nomor Pelanggan</Label>
                  <Input
                    id="nomorPelanggan"
                    value={formData.nomorPelanggan}
                    onChange={(e) => handleInputChange('nomorPelanggan', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="nama">Nama</Label>
                  <Input
                    id="nama"
                    value={formData.nama}
                    onChange={(e) => handleInputChange('nama', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="totalTagihan">Total Tagihan</Label>
                  <Input
                    id="totalTagihan"
                    type="number"
                    value={formData.totalTagihan}
                    onChange={(e) => handleInputChange('totalTagihan', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="biayaAdmin">Biaya Admin</Label>
                  <Input
                    id="biayaAdmin"
                    type="number"
                    value={formData.biayaAdmin}
                    onChange={(e) => handleInputChange('biayaAdmin', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="totalBayar">Total Bayar</Label>
                  <Input
                    id="totalBayar"
                    type="number"
                    value={formData.totalBayar}
                    onChange={(e) => handleInputChange('totalBayar', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit">
                  {editingItem ? 'Update' : 'Simpan'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Data Table */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Waktu</TableHead>
              <TableHead>Nomor Referensi</TableHead>
              <TableHead>Nomor Pelanggan</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Total Tagihan</TableHead>
              <TableHead>Biaya Admin</TableHead>
              <TableHead>Total Bayar</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  Tidak ada data yang ditemukan
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{formatDateTime(item.waktu)}</TableCell>
                  <TableCell>{item.nomorReferensi}</TableCell>
                  <TableCell>{item.nomorPelanggan}</TableCell>
                  <TableCell>{item.nama}</TableCell>
                  <TableCell>{formatCurrency(item.totalTagihan)}</TableCell>
                  <TableCell>{formatCurrency(item.biayaAdmin)}</TableCell>
                  <TableCell>{formatCurrency(item.totalBayar)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PembayaranTransaksiUmum;