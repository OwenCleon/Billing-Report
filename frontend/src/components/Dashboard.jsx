import React, { useState } from 'react';
import { Menu, X, FileText, Download, Plus, Heart, FileStack } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import TagihanPAMJAYA from './billing/TagihanPAMJAYA';
import TagihanListrikPLN from './billing/TagihanListrikPLN';
import PembayaranPAMLainnya from './billing/PembayaranPAMLainnya';
import PembayaranTransaksiUmum from './billing/PembayaranTransaksiUmum';
import PembayaranPenerimaanNegara from './billing/PembayaranPenerimaanNegara';
import ExportService from '../services/ExportService';
import { toast } from 'sonner';

const Dashboard = () => {
  const [activeCategory, setActiveCategory] = useState('pam-jaya');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const categories = [
    { id: 'pam-jaya', name: 'Tagihan PAM JAYA', icon: FileText, component: TagihanPAMJAYA },
    { id: 'listrik-pln', name: 'Tagihan Listrik PLN', icon: FileText, component: TagihanListrikPLN },
    { id: 'pam-lainnya', name: 'Pembayaran PAM (Lainnya)', icon: FileText, component: PembayaranPAMLainnya },
    { id: 'transaksi-umum', name: 'Pembayaran Transaksi Umum', icon: FileText, component: PembayaranTransaksiUmum },
    { id: 'penerimaan-negara', name: 'Pembayaran Penerimaan Negara', icon: FileText, component: PembayaranPenerimaanNegara },
  ];

  const handleExportExcel = async () => {
    try {
      await ExportService.exportToExcel();
      toast.success('Excel file exported successfully!');
    } catch (error) {
      toast.error('Failed to export Excel file');
      console.error('Export error:', error);
    }
  };

  const handleExportPDF = async () => {
    try {
      await ExportService.exportToPDF();
      toast.success('PDF file exported successfully!');
    } catch (error) {
      toast.error('Failed to export PDF file');
      console.error('Export error:', error);
    }
  };

  const handleExportCombinedPDF = async () => {
    try {
      await ExportService.exportToCombinedPDF();
      toast.success('Combined PDF exported successfully!');
    } catch (error) {
      toast.error('Failed to export Combined PDF');
      console.error('Export error:', error);
    }
  };

  const ActiveComponent = categories.find(cat => cat.id === activeCategory)?.component;

  const SidebarContent = () => (
    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Billing Reports</h1>
        <p className="text-sm text-gray-600">Monthly billing management system</p>
      </div>
      
      <div className="space-y-2 mb-8">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "ghost"}
              className={`w-full justify-start text-left p-3 h-auto transition-all duration-200 ${
                activeCategory === category.id 
                  ? 'bg-blue-600 text-white shadow-lg transform scale-105' 
                  : 'hover:bg-white/70 hover:shadow-md'
              }`}
              onClick={() => {
                setActiveCategory(category.id);
                setIsSidebarOpen(false);
              }}
            >
              <Icon className="mr-3 h-5 w-5" />
              <span className="text-sm font-medium">{category.name}</span>
            </Button>
          );
        })}
      </div>

      <div className="space-y-3">
        <Button
          onClick={handleExportExcel}
          className="w-full bg-green-600 hover:bg-green-700 text-white transition-all duration-200 hover:shadow-lg"
        >
          <Download className="mr-2 h-4 w-4" />
          Export Excel
        </Button>
        <Button
          onClick={handleExportPDF}
          className="w-full bg-red-600 hover:bg-red-700 text-white transition-all duration-200 hover:shadow-lg"
        >
          <Download className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
        <Button
          onClick={handleExportCombinedPDF}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white transition-all duration-200 hover:shadow-lg"
          title="Compact layout PDF with all categories merged for efficient printing"
        >
          <FileStack className="mr-2 h-4 w-4" />
          Export Combined PDF
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">Billing Reports</h1>
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-80 min-h-screen bg-white shadow-xl border-r border-gray-200">
          <SidebarContent />
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold text-gray-800">
                    {categories.find(cat => cat.id === activeCategory)?.name}
                  </CardTitle>
                  <div className="flex items-center space-x-4">
                    {/* Made by Owen C credit */}
                    <div className="hidden lg:flex items-center text-sm text-gray-500">
                      Made by Owen C with <Heart className="h-4 w-4 text-red-500 mx-1" />
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleExportExcel}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white hidden lg:flex transition-all duration-200 hover:shadow-lg"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Excel
                      </Button>
                      <Button
                        onClick={handleExportPDF}
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white hidden lg:flex transition-all duration-200 hover:shadow-lg"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        PDF
                      </Button>
                      <Button
                        onClick={handleExportCombinedPDF}
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700 text-white hidden lg:flex transition-all duration-200 hover:shadow-lg"
                        title="Compact layout PDF with all categories merged for efficient printing"
                      >
                        <FileStack className="mr-2 h-4 w-4" />
                        Combined
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {ActiveComponent && <ActiveComponent />}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500 flex items-center justify-center">
            Made by Owen C with <Heart className="h-4 w-4 text-red-500 mx-1" />
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;