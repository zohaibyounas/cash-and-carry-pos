'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    Warehouse as WarehouseIcon, 
    Package, 
    ArrowLeft, 
    TrendingUp, 
    TrendingDown,
    Boxes,
    Trash2
} from 'lucide-react';
import api from '@/lib/api';

export default function WarehouseDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const warehouseId = params.id as string;
    
    const [warehouse, setWarehouse] = useState<any>(null);
    const [inventory, setInventory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [warehouseRes, inventoryRes] = await Promise.all([
                api.get(`/warehouses/${warehouseId}`),
                api.get(`/inventory/warehouse/${warehouseId}`)
            ]);
            setWarehouse(warehouseRes.data);
            setInventory(inventoryRes.data || []);
        } catch (error) {
            console.error('Failed to fetch warehouse details', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (warehouseId) {
            fetchData();
        }
    }, [warehouseId]);

    const handleDeleteInventory = async (inventoryId: string, productName: string) => {
        if (!confirm(`Are you sure you want to remove "${productName}" from this warehouse?`)) {
            return;
        }

        try {
            setDeletingId(inventoryId);
            await api.delete(`/inventory/${inventoryId}`);
            await fetchData(); // Refresh data
        } catch (error) {
            console.error('Failed to delete inventory', error);
            alert('Failed to remove product from warehouse');
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="text-center">
                    <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    <p className="text-slate-600 dark:text-slate-400">Loading warehouse details...</p>
                </div>
            </div>
        );
    }

    if (!warehouse) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="text-center">
                    <p className="text-slate-600 dark:text-slate-400">Warehouse not found</p>
                    <Button onClick={() => router.push('/dashboard/warehouses')} className="mt-4">
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    // Calculate statistics
    const totalProducts = inventory.length;
    const totalQuantity = inventory.reduce((sum, inv) => sum + (inv.quantity || 0), 0);
    const totalCostValue = inventory.reduce((sum, inv) => 
        sum + ((inv.quantity || 0) * Number(inv.product?.costPrice || 0)), 0
    );
    const totalSaleValue = inventory.reduce((sum, inv) => 
        sum + ((inv.quantity || 0) * Number(inv.product?.salePrice || 0)), 0
    );
    const potentialProfit = totalSaleValue - totalCostValue;

    return (
        <div className="min-h-screen space-y-6 bg-slate-50 p-6 dark:bg-slate-950 md:p-8">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                    <Button 
                        variant="ghost" 
                        onClick={() => router.push('/dashboard/warehouses')}
                        className="mb-2 -ml-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Warehouses
                    </Button>
                    <h1 className="flex items-center gap-3 text-3xl font-bold text-slate-900 dark:text-white">
                        <WarehouseIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        {warehouse.name}
                    </h1>
                    <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                        {warehouse.location && <p><span className="font-semibold">Location:</span> {warehouse.location}</p>}
                        {warehouse.contactPerson && <p><span className="font-semibold">Contact:</span> {warehouse.contactPerson}</p>}
                        {warehouse.phone && <p><span className="font-semibold">Phone:</span> {warehouse.phone}</p>}
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card className="border-slate-200 dark:border-slate-800 dark:bg-slate-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Products</CardTitle>
                        <Boxes className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalProducts}</div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 dark:border-slate-800 dark:bg-slate-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Quantity</CardTitle>
                        <Package className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalQuantity.toLocaleString()}</div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 dark:border-slate-800 dark:bg-slate-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Cost Value</CardTitle>
                        <TrendingDown className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            Rs. {totalCostValue.toLocaleString()}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Total Investment</p>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 dark:border-slate-800 dark:bg-slate-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Sale Value</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            Rs. {totalSaleValue.toLocaleString()}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Potential Revenue</p>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 dark:border-slate-800 dark:bg-slate-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Potential Profit</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            Rs. {potentialProfit.toLocaleString()}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                            {totalCostValue > 0 ? `${((potentialProfit / totalCostValue) * 100).toFixed(1)}% margin` : 'N/A'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Inventory Table */}
            <Card className="border-slate-200 dark:border-slate-800 dark:bg-slate-900">
                <CardHeader>
                    <CardTitle className="text-slate-900 dark:text-white">Inventory Details</CardTitle>
                    <CardDescription>Complete list of products with quantities and values</CardDescription>
                </CardHeader>
                <CardContent>
                    {inventory.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Package className="mb-3 h-12 w-12 text-slate-300 dark:text-slate-600" />
                            <p className="text-slate-500 dark:text-slate-400">No products in this warehouse</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-100 text-xs font-bold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                    <tr>
                                        <th className="px-4 py-3">Product</th>
                                        <th className="px-4 py-3">Barcode</th>
                                        <th className="px-4 py-3 text-right">Quantity</th>
                                        <th className="px-4 py-3 text-right">Cost Price</th>
                                        <th className="px-4 py-3 text-right">Sale Price</th>
                                        <th className="px-4 py-3 text-right">Cost Value</th>
                                        <th className="px-4 py-3 text-right">Sale Value</th>
                                        <th className="px-4 py-3 text-right">Profit</th>
                                        <th className="px-4 py-3 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {inventory.map((inv) => {
                                        const quantity = inv.quantity || 0;
                                        const costPrice = Number(inv.product?.costPrice || 0);
                                        const salePrice = Number(inv.product?.salePrice || 0);
                                        const costValue = quantity * costPrice;
                                        const saleValue = quantity * salePrice;
                                        const profit = saleValue - costValue;
                                        
                                        return (
                                            <tr key={inv._id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        {inv.product?.image ? (
                                                            <img 
                                                                src={`http://localhost:5000${inv.product.image}`}
                                                                alt={inv.product?.name || 'Product'}
                                                                className="h-12 w-12 rounded object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-12 w-12 items-center justify-center rounded bg-slate-100 dark:bg-slate-800">
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
                                                    <span className={`font-bold ${quantity > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                        {quantity}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400">
                                                    Rs. {costPrice.toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400">
                                                    Rs. {salePrice.toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3 text-right font-semibold text-orange-600 dark:text-orange-400">
                                                    Rs. {costValue.toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3 text-right font-semibold text-blue-600 dark:text-blue-400">
                                                    Rs. {saleValue.toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3 text-right font-bold text-green-600 dark:text-green-400">
                                                    Rs. {profit.toLocaleString()}
                                                    <div className="text-[10px] text-slate-500">
                                                        {costPrice > 0 ? `(${((profit / costValue) * 100).toFixed(1)}%)` : 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleDeleteInventory(inv._id, inv.product?.name || 'Product')}
                                                        disabled={deletingId === inv._id}
                                                        className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/50 dark:hover:text-red-300"
                                                    >
                                                        {deletingId === inv._id ? (
                                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                                                        ) : (
                                                            <Trash2 className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot className="border-t-2 border-slate-200 bg-slate-50 font-bold dark:border-slate-700 dark:bg-slate-800/50">
                                    <tr>
                                        <td colSpan={2} className="px-4 py-4 text-slate-900 dark:text-white">
                                            TOTALS
                                        </td>
                                        <td className="px-4 py-4 text-right text-slate-900 dark:text-white">
                                            {totalQuantity.toLocaleString()}
                                        </td>
                                        <td colSpan={2}></td>
                                        <td className="px-4 py-4 text-right text-orange-600 dark:text-orange-400">
                                            Rs. {totalCostValue.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-4 text-right text-blue-600 dark:text-blue-400">
                                            Rs. {totalSaleValue.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-4 text-right text-green-600 dark:text-green-400">
                                            Rs. {potentialProfit.toLocaleString()}
                                        </td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
