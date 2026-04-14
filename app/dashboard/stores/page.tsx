'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Store } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

export default function StorePage() {
    const [stores, setStores] = useState<any[]>([]);
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [contact, setContact] = useState('');
    const [printerEnabled, setPrinterEnabled] = useState(false);
    const [printerEndpoint, setPrinterEndpoint] = useState('');
    const [loading, setLoading] = useState(false);
    const [editingStoreId, setEditingStoreId] = useState<string | null>(null);

    const fetchStores = async () => {
        try {
            const res = await api.get('/stores');
            setStores(res.data);
        } catch (error) {
            console.error('Failed to fetch stores', error);
        }
    };

    useEffect(() => {
        fetchStores();
    }, []);

    const resetForm = () => {
        setName('');
        setLocation('');
        setContact('');
        setPrinterEnabled(false);
        setPrinterEndpoint('');
        setEditingStoreId(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const storeData = { name, location, contactNumber: contact, printerEnabled, printerEndpoint };
        try {
            if (editingStoreId) {
                await api.put(`/stores/${editingStoreId}`, storeData);
            } else {
                await api.post('/stores', storeData);
            }
            resetForm();
            fetchStores();
        } catch (error) {
            console.error('Failed to save store', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (store: any) => {
        setEditingStoreId(store._id);
        setName(store.name);
        setLocation(store.location || '');
        setContact(store.contactNumber || '');
        setPrinterEnabled(store.printerEnabled || false);
        setPrinterEndpoint(store.printerEndpoint || '');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen space-y-8 bg-slate-50 p-6 dark:bg-slate-950 md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                    <h1 className="flex items-center gap-3 text-3xl font-bold text-slate-900 dark:text-white">
                        <Store className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        Store Management
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Add and manage business locations and IoT printers.</p>
                </div>
                <Link
                    href="/dashboard/select-store"
                    className="flex shrink-0 items-center gap-2 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Store Selection
                </Link>
            </div>

            <Card className="border-slate-200 dark:border-slate-800 dark:bg-slate-900 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-slate-900 dark:text-white">
                        {editingStoreId ? 'Edit Store' : 'Add New Store'}
                    </CardTitle>
                    <CardDescription className="text-slate-500 dark:text-slate-400">Configure business details and IoT receipt printer settings.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Store Name</Label>
                                <Input id="name" value={name} onChange={e => setName(e.target.value)} required className="dark:bg-slate-800/50 dark:border-slate-700 h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="location" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Location</Label>
                                <Input id="location" value={location} onChange={e => setLocation(e.target.value)} className="dark:bg-slate-800/50 dark:border-slate-700 h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contact" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Contact Number</Label>
                                <Input id="contact" value={contact} onChange={e => setContact(e.target.value)} className="dark:bg-slate-800/50 dark:border-slate-700 h-11" />
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 p-4 bg-slate-100 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-800">
                            <div className="flex flex-col justify-center">
                                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">IoT Receipt Printer</Label>
                                <div className="flex items-center gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setPrinterEnabled(!printerEnabled)}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${printerEnabled
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                            }`}
                                    >
                                        {printerEnabled ? 'PRINTER ENABLED' : 'PRINTER DISABLED'}
                                    </button>
                                    <p className="text-xs text-slate-500 italic">Enable to auto-print receipts for this store</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endpoint" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">IoT Printer Endpoint (URL/IP)</Label>
                                <Input
                                    id="endpoint"
                                    placeholder="http://192.168.1.50/print"
                                    value={printerEndpoint}
                                    onChange={e => setPrinterEndpoint(e.target.value)}
                                    disabled={!printerEnabled}
                                    className="dark:bg-slate-800/50 dark:border-slate-700 h-11"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            {editingStoreId && (
                                <Button type="button" variant="outline" onClick={resetForm} className="font-semibold">
                                    Cancel
                                </Button>
                            )}
                            <Button type="submit" disabled={loading} className="bg-blue-600 font-bold text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 px-8 h-11">
                                {loading ? 'Saving...' : (editingStoreId ? 'Update Store' : 'Create Store')}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {stores.map((store) => (
                    <Card key={store._id} className="border-slate-200 shadow-sm transition-all hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 group">
                        <CardHeader className="flex flex-row items-start justify-between space-y-0">
                            <div>
                                <CardTitle className="text-slate-900 dark:text-white">{store.name}</CardTitle>
                                <CardDescription className="text-slate-500 dark:text-slate-400">Business ID: {store._id.substring(0, 8)}</CardDescription>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(store)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            >
                                Edit Settings
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1 text-sm">
                                <p className="text-slate-600 dark:text-slate-400"><span className="font-bold text-slate-700 dark:text-slate-300">Location:</span> {store.location || 'N/A'}</p>
                                <p className="text-slate-600 dark:text-slate-400"><span className="font-bold text-slate-700 dark:text-slate-300">Contact:</span> {store.contactNumber || 'N/A'}</p>
                            </div>
                            <div className={`p-3 rounded-lg border flex flex-col gap-1 ${store.printerEnabled
                                ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/20'
                                : 'bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700 opacity-60'
                                }`}>
                                <div className="flex items-center gap-2">
                                    <div className={`h-2 w-2 rounded-full ${store.printerEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                                    <span className={`text-[10px] font-bold uppercase ${store.printerEnabled ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500'}`}>
                                        {store.printerEnabled ? 'IoT Printer Active' : 'IoT Printer Disabled'}
                                    </span>
                                </div>
                                {store.printerEnabled && (
                                    <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-500 truncate">
                                        {store.printerEndpoint || 'No endpoint set'}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
