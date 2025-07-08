import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import LocalStorageService from '../../services/LocalStorageService';
import MockDataService from '../../services/MockDataService';
import { toast } from 'sonner';

const TagihanListrikPLN = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    idPelanggan: '',
    namaCustomer: '',
    tarifDaya: '',
    tagihanPLN: '',
    noReferensi: '',
    blTh: '',
    power: '',
    subscriberSegmentation: '',
    totalBayar: ''
  });

  const category = 'listrik-pln';

  const segmentationOptions = ['R1', 'R2', 'R3', 'B1', 'B2', 'B3', 'I1', 'I2', 'I3', 'P1', 'P2', 'P3'];

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
    
    const processedData = {
      ...formData,
      tagihanPLN: parseFloat(formData.tagihanPLN) || 0,
      totalBayar: parseFloat(formData.totalBayar) || 0,
      power: parseFloat(formData.power) || 0
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
      idPelanggan: item.idPelanggan,
      namaCustomer: item.namaCustomer,
      tarifDaya: item.tarifDaya,
      tagihanPLN: item.tagihanPLN.toString(),
      noReferensi: item.noReferensi,
      blTh: item.blTh,
      power: item.power.toString(),
      subscriberSegmentation: item.subscriberSegmentation,
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
      idPelanggan: '',
      namaCustomer: '',
      tarifDaya: '',
      tagihanPLN: '',
      noReferensi: '',
      blTh: '',
      power: '',
      subscriberSegmentation: '',
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
                  <Label htmlFor="idPelanggan">ID Pelanggan</Label>
                  <Input
                    id="idPelanggan"
                    value={formData.idPelanggan}
                    onChange={(e) => handleInputChange('idPelanggan', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="namaCustomer">Nama Customer</Label>
                  <Input
                    id="namaCustomer"
                    value={formData.namaCustomer}
                    onChange={(e) => handleInputChange('namaCustomer', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tarifDaya">Tarif / Daya</Label>
                  <Input
                    id="tarifDaya"
                    value={formData.tarifDaya}
                    onChange={(e) => handleInputChange('tarifDaya', e.target.value)}
                    placeholder="e.g., R1 / 1300VA"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tagihanPLN">Tagihan PLN</Label>
                  <Input
                    id="tagihanPLN"
                    type="number"
                    value={formData.tagihanPLN}
                    onChange={(e) => handleInputChange('tagihanPLN', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="noReferensi">No Referensi</Label>
                  <Input
                    id="noReferensi"
                    value={formData.noReferensi}
                    onChange={(e) => handleInputChange('noReferensi', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="blTh">BL / TH</Label>
                  <Input
                    id="blTh"
                    value={formData.blTh}
                    onChange={(e) => handleInputChange('blTh', e.target.value)}
                    placeholder="e.g., FEB25"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="power">Power</Label>
                  <Input
                    id="power"
                    type="number"
                    value={formData.power}
                    onChange={(e) => handleInputChange('power', e.target.value)}
                    placeholder="e.g., 1300"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="subscriberSegmentation">Subscriber Segmentation</Label>
                  <Select
                    value={formData.subscriberSegmentation}
                    onValueChange={(value) => handleInputChange('subscriberSegmentation', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih segmentasi" />
                    </SelectTrigger>
                    <SelectContent>
                      {segmentationOptions.map(option => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              <TableHead>ID Pelanggan</TableHead>
              <TableHead>Nama Customer</TableHead>
              <TableHead>Tarif / Daya</TableHead>
              <TableHead>Tagihan PLN</TableHead>
              <TableHead>No Referensi</TableHead>
              <TableHead>BL / TH</TableHead>
              <TableHead>Power</TableHead>
              <TableHead>Segmentasi</TableHead>
              <TableHead>Total Bayar</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                  Tidak ada data yang ditemukan
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.idPelanggan}</TableCell>
                  <TableCell>{item.namaCustomer}</TableCell>
                  <TableCell>{item.tarifDaya}</TableCell>
                  <TableCell>{formatCurrency(item.tagihanPLN)}</TableCell>
                  <TableCell>{item.noReferensi}</TableCell>
                  <TableCell>{item.blTh}</TableCell>
                  <TableCell>{item.power}</TableCell>
                  <TableCell>{item.subscriberSegmentation}</TableCell>
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

export default TagihanListrikPLN;