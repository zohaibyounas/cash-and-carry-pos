'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Store, Package, TrendingUp, TrendingDown, Boxes } from 'lucide-react';
import api from '@/lib/api';

export default function StoresInventoryPage() {
    const [stores, setStores] = useState<any[]>([]);
    const [storesData, setStoresData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch all stores
                const storesRes = await api.get('/stores');
                const storesArr = storesRes.data || [];
                setStores(storesArr);

                // Fetch products for each store
                const storesInventory = await Promise.all(
                    storesArr.map(async (store: any) => {
                        try {
                            // Fetch products for this specific store using query param
                            const productsRes = await api.get(`/products?storeId=${store._id}`);
                            const allProducts = productsRes.data || [];
                            
                            // Filter out products that have warehouse inventory
                            // Only show products with NO warehouse assignment (general store inventory)
                            const productsWithInventory = await Promise.all(
                                allProducts.map(async (product: any) => {
                                    try {
                                        const inventoryRes = await api.get(`/inventory/product/${product._id}`);
                                        return {
                                            product,
                                            hasWarehouseInventory: (inventoryRes.data || []).length > 0
                                        };
                                    } catch {
                                        return { product, hasWarehouseInventory: false };
                                    }
                                })
                            );
                            
                            // Only include products WITHOUT warehouse inventory
                            const products = productsWithInventory
                                .filter(item => !item.hasWarehouseInventory)
                                .map(item => item.product);
                            
                            // Calculate statistics
                            const totalProducts = products.length;
                            const totalStock = products.reduce((sum: number, p: any) => 
                                sum + (Number(p.totalStock) || 0), 0
                            );
                             const totalCostValue = products.reduce((sum: number, p: any) => {
                                 const stock = Number(p.totalStock) || 0;
                                 const perPieceCost = p.hasPieces ? (Number(p.pieceCostPrice) || (Number(p.costPrice) / (Number(p.piecesPerBox) || 1))) : Number(p.costPrice);
                                 return sum + (stock * perPieceCost);
                             }, 0);
                             const totalSaleValue = products.reduce((sum: number, p: any) => {
                                 const stock = Number(p.totalStock) || 0;
                                 const perPieceSale = p.hasPieces ? (Number(p.pieceSalePrice) || (Number(p.salePrice) / (Number(p.piecesPerBox) || 1))) : Number(p.salePrice);
                                 return sum + (stock * perPieceSale);
                             }, 0);
                            
                            return {
                                store,
                                products,
                                stats: {
                                    totalProducts,
                                    totalStock,
                                    totalCostValue,
                                    totalSaleValue,
                                    potentialProfit: totalSaleValue - totalCostValue
                                }
                            };
                        } catch (error) {
                            console.error(`Failed to fetch products for store ${store.name}`, error);
                            return {
                                store,
                                products: [],
                                stats: {
                                    totalProducts: 0,
                                    totalStock: 0,
                                    totalCostValue: 0,
                                    totalSaleValue: 0,
                                    potentialProfit: 0
                                }
                            };
                        }
                    })
                );

                setStoresData(storesInventory);
            } catch (error) {
                console.error('Failed to fetch stores inventory', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="text-center">
                    <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    <p className="text-slate-600 dark:text-slate-400">Loading stores inventory...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen space-y-6 bg-slate-50 p-6 dark:bg-slate-950 md:p-8">
            {/* Header */}
            <div className="space-y-1">
                <h1 className="flex items-center gap-3 text-3xl font-bold text-slate-900 dark:text-white">
                    <Store className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    Stores Inventory
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    View inventory breakdown for each store
                </p>
            </div>

            {/* Stores Inventory Cards */}
            <div className="space-y-6">
                {storesData.map((storeData) => (
                    <Card key={storeData.store._id} className="border-slate-200 dark:border-slate-800 dark:bg-slate-900">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                                <Store className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                {storeData.store.name}
                            </CardTitle>
                            <CardDescription>
                                {storeData.store.address && `${storeData.store.address} • `}
                                {storeData.stats.totalProducts} Products • {storeData.stats.totalStock} Total Items
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Statistics Grid */}
                            <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                                <Card className="border-slate-200 dark:border-slate-800 dark:bg-slate-800/50">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Products</CardTitle>
                                        <Boxes className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                            {storeData.stats.totalProducts}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-slate-200 dark:border-slate-800 dark:bg-slate-800/50">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Stock</CardTitle>
                                        <Package className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                            {storeData.stats.totalStock.toLocaleString()}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-slate-200 dark:border-slate-800 dark:bg-slate-800/50">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Cost Value</CardTitle>
                                        <TrendingDown className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                            Rs. {storeData.stats.totalCostValue.toLocaleString()}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-slate-200 dark:border-slate-800 dark:bg-slate-800/50">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Sale Value</CardTitle>
                                        <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                            Rs. {storeData.stats.totalSaleValue.toLocaleString()}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-slate-200 dark:border-slate-800 dark:bg-slate-800/50">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Profit</CardTitle>
                                        <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                            Rs. {storeData.stats.potentialProfit.toLocaleString()}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Products Table */}
                            {storeData.products.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8">
                                    <Package className="mb-3 h-12 w-12 text-slate-300 dark:text-slate-600" />
                                    <p className="text-slate-500 dark:text-slate-400">No products in this store</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-100 text-xs font-bold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                            <tr>
                                                <th className="px-4 py-3">Product</th>
                                                <th className="px-4 py-3">Barcode</th>
                                                <th className="px-4 py-3 text-right">Stock</th>
                                                <th className="px-4 py-3 text-right">Cost Price</th>
                                                <th className="px-4 py-3 text-right">Sale Price</th>
                                                <th className="px-4 py-3 text-right">Cost Value</th>
                                                <th className="px-4 py-3 text-right">Sale Value</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {storeData.products.map((product: any) => {
                                                 const stock = Number(product.totalStock) || 0;
                                                 const perPieceCost = product.hasPieces ? (Number(product.pieceCostPrice) || (Number(product.costPrice) / (Number(product.piecesPerBox) || 1))) : Number(product.costPrice);
                                                 const perPieceSale = product.hasPieces ? (Number(product.pieceSalePrice) || (Number(product.salePrice) / (Number(product.piecesPerBox) || 1))) : Number(product.salePrice);
                                                 const costValue = stock * perPieceCost;
                                                 const saleValue = stock * perPieceSale;
                                                
                                                return (
                                                    <tr key={product._id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-3">
                                                                {product.image ? (
                                                                    <img 
                                                                        src={`http://localhost:5000${product.image}`}
                                                                        alt={product.name}
                                                                        className="h-10 w-10 rounded object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="flex h-10 w-10 items-center justify-center rounded bg-slate-100 dark:bg-slate-800">
                                                                        <Package className="h-4 w-4 text-slate-400" />
                                                                    </div>
                                                                )}
                                                                <span className="font-medium text-slate-900 dark:text-white">
                                                                    {product.name}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                                                            {product.barcode || 'N/A'}
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <span className={`font-bold ${stock > 10 ? 'text-green-600 dark:text-green-400' : stock > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                                                                {product.hasPieces ? (
                                                                    `${Math.floor(stock / (product.piecesPerBox || 1))} ${product.unitName || 'Box'}${Math.floor(stock / (product.piecesPerBox || 1)) !== 1 ? 's' : ''}${stock % (product.piecesPerBox || 1) > 0 ? `, ${stock % (product.piecesPerBox || 1)} ${product.pieceName || 'Piece'}` : ''}`
                                                                ) : stock}
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
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}

                {storesData.length === 0 && (
                    <Card className="border-slate-200 dark:border-slate-800 dark:bg-slate-900">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Store className="mb-3 h-12 w-12 text-slate-300 dark:text-slate-600" />
                            <p className="text-slate-500 dark:text-slate-400">No stores found</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
