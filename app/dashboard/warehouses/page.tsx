'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Warehouse as WarehouseIcon, Trash2, Edit, X, Package, Eye } from 'lucide-react';
import api from '@/lib/api';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export default function WarehousePage() {
    const router = useRouter();
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        contactPerson: '',
        phone: '',
    });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null);
    const [showInventoryModal, setShowInventoryModal] = useState(false);
    const [inventory, setInventory] = useState<any[]>([]);
    const [loadingInventory, setLoadingInventory] = useState(false);

    const fetchWarehouses = async () => {
        try {
            const res = await api.get('/warehouses');
            setWarehouses(res.data);
        } catch (error) {
            console.error('Failed to fetch warehouses', error);
        }
    };

    useEffect(() => {
        fetchWarehouses();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleCancel = () => {
        setEditingId(null);
        setFormData({ name: '', location: '', contactPerson: '', phone: '' });
    };

    const handleEdit = (w: any) => {
        setEditingId(w._id);
        setFormData({
            name: w.name,
            location: w.location || '',
            contactPerson: w.contactPerson || '',
            phone: w.phone || '',
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this warehouse?')) return;
        try {
            await api.delete(`/warehouses/${id}`);
            fetchWarehouses();
        } catch (error) {
            console.error('Failed to delete warehouse', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingId) {
                await api.put(`/warehouses/${editingId}`, formData);
            } else {
                await api.post('/warehouses', formData);
            }
            handleCancel();
            fetchWarehouses();
        } catch (error) {
            console.error('Failed to save warehouse', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewInventory = async (warehouse: any, e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
        }
        // Navigate to warehouse details page
        router.push(`/dashboard/warehouses/${warehouse._id}`);
    };

    const handleQuickView = async (warehouse: any, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedWarehouse(warehouse);
        setShowInventoryModal(true);
        setLoadingInventory(true);
        try {
            const res = await api.get(`/inventory/warehouse/${warehouse._id}`);
            setInventory(res.data || []);
        } catch (error) {
            console.error('Failed to fetch inventory', error);
            setInventory([]);
        } finally {
            setLoadingInventory(false);
        }
    };

    return (
        <div className="min-h-screen space-y-8 bg-slate-50 p-6 dark:bg-slate-950 md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                    <h1 className="flex items-center gap-3 text-3xl font-bold text-slate-900 dark:text-white">
                        <WarehouseIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        Warehouse Management
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Add and manage warehouses and storage locations.</p>
                </div>
            </div>

            <Card className="border-slate-200 dark:border-slate-800 dark:bg-slate-900">
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <div>
                        <CardTitle className="text-slate-900 dark:text-white">{editingId ? 'Edit Warehouse' : 'Add New Warehouse'}</CardTitle>
                        <CardDescription className="mt-1 text-slate-500 dark:text-slate-400">Name, location, contact person and phone.</CardDescription>
                    </div>
                    {editingId && (
                        <Button variant="ghost" size="icon" onClick={handleCancel}><X className="h-5 w-5" /></Button>
                    )}
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-5 md:items-end">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Warehouse Name</Label>
                            <Input id="name" value={formData.name} onChange={handleInputChange} required className="dark:bg-slate-800/50 dark:border-slate-700" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Location</Label>
                            <Input id="location" value={formData.location} onChange={handleInputChange} className="dark:bg-slate-800/50 dark:border-slate-700" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contactPerson" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Contact Person</Label>
                            <Input id="contactPerson" value={formData.contactPerson} onChange={handleInputChange} className="dark:bg-slate-800/50 dark:border-slate-700" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Phone</Label>
                            <Input id="phone" value={formData.phone} onChange={handleInputChange} className="dark:bg-slate-800/50 dark:border-slate-700" />
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" disabled={loading} className="flex-1 bg-blue-600 font-semibold text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700">
                                {loading ? 'Saving...' : (editingId ? 'Update' : 'Create')}
                            </Button>
                            {editingId && <Button type="button" variant="outline" onClick={handleCancel} className="border-slate-200 dark:border-slate-700">Cancel</Button>}
                        </div>
                    </form>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {warehouses.map((w) => (
                    <Card 
                        key={w._id} 
                        className="cursor-pointer border-slate-200 shadow-sm transition-all hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-700"
                        onClick={() => handleViewInventory(w)}
                    >
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                            <CardTitle className="text-slate-900 dark:text-white">{w.name}</CardTitle>
                            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-purple-500 hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-900/20 dark:hover:text-purple-400" 
                                    onClick={(e) => handleQuickView(w, e)}
                                    title="Quick preview"
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400" onClick={(e) => { e.stopPropagation(); handleEdit(w); }}><Edit className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400" onClick={(e) => { e.stopPropagation(); handleDelete(w._id); }}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-1 text-sm">
                            <p className="text-slate-600 dark:text-slate-400"><span className="font-bold text-slate-700 dark:text-slate-300">Location:</span> {w.location || 'N/A'}</p>
                            <p className="text-slate-600 dark:text-slate-400"><span className="font-bold text-slate-700 dark:text-slate-300">Contact:</span> {w.contactPerson || 'N/A'}</p>
                            <p className="text-slate-600 dark:text-slate-400"><span className="font-bold text-slate-700 dark:text-slate-300">Phone:</span> {w.phone || 'N/A'}</p>
                            <div className="mt-2 flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                                <Package className="h-3 w-3" />
                                <span className="font-semibold">Click to view full details</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Inventory Modal */}
            <Dialog open={showInventoryModal} onOpenChange={setShowInventoryModal}>
                <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <WarehouseIcon className="h-6 w-6 text-blue-600" />
                            {selectedWarehouse?.name} - Inventory
                        </DialogTitle>
                        <DialogDescription>
                            Products and quantities in this warehouse
                        </DialogDescription>
                    </DialogHeader>
                    {loadingInventory ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-slate-500">Loading inventory...</div>
                        </div>
                    ) : inventory.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Package className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
                            <p className="text-slate-500 dark:text-slate-400">No products in this warehouse</p>
                        </div>
                    ) : (
                        <div className="mt-4">
                            <div className="mb-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                                <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                                    Total Products: {inventory.length} | Total Quantity: {inventory.reduce((sum, inv) => sum + (inv.quantity || 0), 0)}
                                </p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase text-xs font-bold">
                                        <tr>
                                            <th className="px-4 py-3">Product</th>
                                            <th className="px-4 py-3">Barcode</th>
                                            <th className="px-4 py-3 text-right">Quantity</th>
                                            <th className="px-4 py-3 text-right">Sale Price</th>
                                            <th className="px-4 py-3 text-right">Total Value</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {inventory.map((inv) => (
                                            <tr key={inv._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        {inv.product?.image ? (
                                                            <img 
                                                                src={`http://localhost:5000${inv.product.image}`}
                                                                alt={inv.product?.name || 'Product'}
                                                                className="h-10 w-10 rounded object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-10 w-10 items-center justify-center rounded bg-slate-100 dark:bg-slate-800">
                                                                <Package className="h-5 w-5 text-slate-400" />
                                                            </div>
                                                        )}
                                                        <span className="font-medium text-slate-900 dark:text-white">
                                                            {inv.product?.name || 'Unknown Product'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                                                    {inv.product?.barcode || 'N/A'}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <span className={`font-bold ${inv.quantity > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                        {inv.quantity || 0}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400">
                                                    Rs. {Number(inv.product?.salePrice || 0).toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3 text-right font-semibold text-blue-600 dark:text-blue-400">
                                                    Rs. {((inv.quantity || 0) * Number(inv.product?.salePrice || 0)).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
