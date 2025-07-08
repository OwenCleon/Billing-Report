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

const TagihanPAMJAYA = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    namaPAM: '',
    noRef: '',
    noPelanggan: '',
    nama: '',
    alamat: '',
    totalTagihan: '',
    biayaAdmin: '',
    periodeTerbayar: '',
    pemakaian: '',
    tagihan: ''
  });

  const category = 'pam-jaya';

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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert currency fields to numbers
    const processedData = {
      ...formData,
      totalTagihan: parseFloat(formData.totalTagihan) || 0,
      biayaAdmin: parseFloat(formData.biayaAdmin) || 0,
      tagihan: parseFloat(formData.tagihan) || 0,
      pemakaian: parseFloat(formData.pemakaian) || 0
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
      namaPAM: item.namaPAM,
      noRef: item.noRef,
      noPelanggan: item.noPelanggan,
      nama: item.nama,
      alamat: item.alamat,
      totalTagihan: item.totalTagihan.toString(),
      biayaAdmin: item.biayaAdmin.toString(),
      periodeTerbayar: item.periodeTerbayar,
      pemakaian: item.pemakaian.toString(),
      tagihan: item.tagihan.toString()
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
      namaPAM: '',
      noRef: '',
      noPelanggan: '',
      nama: '',
      alamat: '',
      totalTagihan: '',
      biayaAdmin: '',
      periodeTerbayar: '',
      pemakaian: '',
      tagihan: ''
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
                  <Label htmlFor="namaPAM">Nama PAM</Label>
                  <Input
                    id="namaPAM"
                    value={formData.namaPAM}
                    onChange={(e) => handleInputChange('namaPAM', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="noRef">No. Ref</Label>
                  <Input
                    id="noRef"
                    value={formData.noRef}
                    onChange={(e) => handleInputChange('noRef', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="noPelanggan">No. Pelanggan</Label>
                  <Input
                    id="noPelanggan"
                    value={formData.noPelanggan}
                    onChange={(e) => handleInputChange('noPelanggan', e.target.value)}
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
                <div className="md:col-span-2">
                  <Label htmlFor="alamat">Alamat</Label>
                  <Input
                    id="alamat"
                    value={formData.alamat}
                    onChange={(e) => handleInputChange('alamat', e.target.value)}
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
                  <Label htmlFor="periodeTerbayar">Periode Terbayar</Label>
                  <Input
                    id="periodeTerbayar"
                    value={formData.periodeTerbayar}
                    onChange={(e) => handleInputChange('periodeTerbayar', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="pemakaian">Pemakaian (m³)</Label>
                  <Input
                    id="pemakaian"
                    type="number"
                    value={formData.pemakaian}
                    onChange={(e) => handleInputChange('pemakaian', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tagihan">Tagihan</Label>
                  <Input
                    id="tagihan"
                    type="number"
                    value={formData.tagihan}
                    onChange={(e) => handleInputChange('tagihan', e.target.value)}
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
              <TableHead>Nama PAM</TableHead>
              <TableHead>No. Ref</TableHead>
              <TableHead>No. Pelanggan</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Alamat</TableHead>
              <TableHead>Total Tagihan</TableHead>
              <TableHead>Biaya Admin</TableHead>
              <TableHead>Periode Terbayar</TableHead>
              <TableHead>Pemakaian</TableHead>
              <TableHead>Tagihan</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                  Tidak ada data yang ditemukan
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.namaPAM}</TableCell>
                  <TableCell>{item.noRef}</TableCell>
                  <TableCell>{item.noPelanggan}</TableCell>
                  <TableCell>{item.nama}</TableCell>
                  <TableCell>{item.alamat}</TableCell>
                  <TableCell>{formatCurrency(item.totalTagihan)}</TableCell>
                  <TableCell>{formatCurrency(item.biayaAdmin)}</TableCell>
                  <TableCell>{item.periodeTerbayar}</TableCell>
                  <TableCell>{item.pemakaian} m³</TableCell>
                  <TableCell>{formatCurrency(item.tagihan)}</TableCell>
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

export default TagihanPAMJAYA;