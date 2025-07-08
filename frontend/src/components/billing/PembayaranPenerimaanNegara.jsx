import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import LocalStorageService from '../../services/LocalStorageService';
import MockDataService from '../../services/MockDataService';
import { toast } from 'sonner';

const PembayaranPenerimaanNegara = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    tanggal: '',
    jam: '',
    noReferensi: '',
    dariRekening: '',
    kodeBilling: '',
    npwp: '',
    namaWP: '',
    alamat: '',
    jumlahSetor: '',
    ntpn: '',
    ntb: '',
    stan: '',
    tanggalBuku: '',
    status: ''
  });

  const category = 'penerimaan-negara';
  const statusOptions = ['BERHASIL', 'GAGAL'];

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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
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
      jumlahSetor: parseFloat(formData.jumlahSetor) || 0
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
      tanggal: item.tanggal,
      jam: item.jam,
      noReferensi: item.noReferensi,
      dariRekening: item.dariRekening,
      kodeBilling: item.kodeBilling,
      npwp: item.npwp,
      namaWP: item.namaWP,
      alamat: item.alamat,
      jumlahSetor: item.jumlahSetor.toString(),
      ntpn: item.ntpn,
      ntb: item.ntb,
      stan: item.stan,
      tanggalBuku: item.tanggalBuku,
      status: item.status
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
      tanggal: '',
      jam: '',
      noReferensi: '',
      dariRekening: '',
      kodeBilling: '',
      npwp: '',
      namaWP: '',
      alamat: '',
      jumlahSetor: '',
      ntpn: '',
      ntb: '',
      stan: '',
      tanggalBuku: '',
      status: ''
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
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Edit Data' : 'Tambah Data Baru'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tanggal">Tanggal</Label>
                  <Input
                    id="tanggal"
                    type="date"
                    value={formData.tanggal}
                    onChange={(e) => handleInputChange('tanggal', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="jam">Jam</Label>
                  <Input
                    id="jam"
                    type="time"
                    step="1"
                    value={formData.jam}
                    onChange={(e) => handleInputChange('jam', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="noReferensi">No. Referensi</Label>
                  <Input
                    id="noReferensi"
                    value={formData.noReferensi}
                    onChange={(e) => handleInputChange('noReferensi', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dariRekening">Dari Rekening</Label>
                  <Input
                    id="dariRekening"
                    value={formData.dariRekening}
                    onChange={(e) => handleInputChange('dariRekening', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="kodeBilling">Kode Billing</Label>
                  <Input
                    id="kodeBilling"
                    value={formData.kodeBilling}
                    onChange={(e) => handleInputChange('kodeBilling', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="npwp">NPWP</Label>
                  <Input
                    id="npwp"
                    value={formData.npwp}
                    onChange={(e) => handleInputChange('npwp', e.target.value)}
                    maxLength="15"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="namaWP">Nama WP</Label>
                  <Input
                    id="namaWP"
                    value={formData.namaWP}
                    onChange={(e) => handleInputChange('namaWP', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="jumlahSetor">Jumlah Setor</Label>
                  <Input
                    id="jumlahSetor"
                    type="number"
                    value={formData.jumlahSetor}
                    onChange={(e) => handleInputChange('jumlahSetor', e.target.value)}
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
                  <Label htmlFor="ntpn">NTPN</Label>
                  <Input
                    id="ntpn"
                    value={formData.ntpn}
                    onChange={(e) => handleInputChange('ntpn', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="ntb">NTB</Label>
                  <Input
                    id="ntb"
                    value={formData.ntb}
                    onChange={(e) => handleInputChange('ntb', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="stan">STAN</Label>
                  <Input
                    id="stan"
                    value={formData.stan}
                    onChange={(e) => handleInputChange('stan', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tanggalBuku">Tanggal Buku</Label>
                  <Input
                    id="tanggalBuku"
                    type="date"
                    value={formData.tanggalBuku}
                    onChange={(e) => handleInputChange('tanggalBuku', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(option => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              <TableHead>Tanggal</TableHead>
              <TableHead>Jam</TableHead>
              <TableHead>No. Referensi</TableHead>
              <TableHead>Dari Rekening</TableHead>
              <TableHead>Kode Billing</TableHead>
              <TableHead>NPWP</TableHead>
              <TableHead>Nama WP</TableHead>
              <TableHead>Alamat</TableHead>
              <TableHead>Jumlah Setor</TableHead>
              <TableHead>NTPN</TableHead>
              <TableHead>NTB</TableHead>
              <TableHead>STAN</TableHead>
              <TableHead>Tanggal Buku</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={15} className="text-center py-8 text-gray-500">
                  Tidak ada data yang ditemukan
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{formatDate(item.tanggal)}</TableCell>
                  <TableCell>{item.jam}</TableCell>
                  <TableCell>{item.noReferensi}</TableCell>
                  <TableCell>{item.dariRekening}</TableCell>
                  <TableCell>{item.kodeBilling}</TableCell>
                  <TableCell>{item.npwp}</TableCell>
                  <TableCell>{item.namaWP}</TableCell>
                  <TableCell>{item.alamat}</TableCell>
                  <TableCell>{formatCurrency(item.jumlahSetor)}</TableCell>
                  <TableCell>{item.ntpn}</TableCell>
                  <TableCell>{item.ntb}</TableCell>
                  <TableCell>{item.stan}</TableCell>
                  <TableCell>{formatDate(item.tanggalBuku)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={item.status === 'BERHASIL' ? 'default' : 'destructive'}
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
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

export default PembayaranPenerimaanNegara;