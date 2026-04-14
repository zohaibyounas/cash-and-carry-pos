"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Building2,
  Plus,
  Search,
  Edit,
  Trash2,
  Phone,
  MapPin,
  CreditCard,
  Package,
  ArrowDownCircle,
  ArrowUpCircle,
  History,
  Eye,
  X,
  ShoppingCart,
  FileText,
} from "lucide-react";
import api from "@/lib/api";
import { cn, formatDateSafe, formatDateTimeSafe } from "@/lib/utils";

export default function RetailersPage() {
  const [retailers, setRetailers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingRetailer, setEditingRetailer] = useState<any>(null);
  const [selectedRetailer, setSelectedRetailer] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDescription, setPaymentDescription] = useState("");
  const [selectedSaleForPayment, setSelectedSaleForPayment] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    address: "",
    bankAccount: "",
    bankName: "",
    initialPay: 0,
    notes: "",
  });

  useEffect(() => {
    fetchRetailers();
  }, []);

  const fetchRetailers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/retailers");
      setRetailers(res.data || []);
    } catch (error) {
      console.error("Failed to fetch retailers", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingRetailer) {
        await api.put(`/retailers/${editingRetailer._id}`, formData);
      } else {
        await api.post("/retailers", formData);
      }
      setShowForm(false);
      setEditingRetailer(null);
      setFormData({
        name: "",
        contact: "",
        address: "",
        bankAccount: "",
        bankName: "",
        initialPay: 0,
        notes: "",
      });
      fetchRetailers();
    } catch (error) {
      console.error("Failed to save retailer", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (retailer: any) => {
    setEditingRetailer(retailer);
    setFormData({
      name: retailer.name,
      contact: retailer.contact,
      address: retailer.address || "",
      bankAccount: retailer.bankAccount || "",
      bankName: retailer.bankName || "",
      initialPay: retailer.initialPay || 0,
      notes: retailer.notes || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this retailer?")) return;
    try {
      await api.delete(`/retailers/${id}`);
      fetchRetailers();
    } catch (error) {
      console.error("Failed to delete retailer", error);
    }
  };

  const handleViewDetails = async (retailer: any) => {
    try {
      const res = await api.get(`/retailers/${retailer._id}`);
      setSelectedRetailer(res.data);
      setShowDetails(true);
    } catch (error) {
      console.error("Failed to fetch retailer details", error);
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRetailer || !paymentAmount) return;
    
    // Validation: Check if payment amount exceeds remaining debit
    const remainingDebit = selectedRetailer.remainingBalance !== undefined 
      ? selectedRetailer.remainingBalance 
      : 0;
    
    if (Number(paymentAmount) > remainingDebit) {
      toast.error("Payment Amount Exceeds Remaining Debit!", {
        description: `Remaining Debit: Rs. ${remainingDebit.toLocaleString()} | You entered: Rs. ${Number(paymentAmount).toLocaleString()}`,
        duration: 4000,
      });
      return;
    }
    
    try {
      setLoading(true);
      await api.post(`/retailers/${selectedRetailer._id}/payment`, {
        amount: Number(paymentAmount),
        description: paymentDescription,
        saleId: selectedSaleForPayment || undefined, // Link payment to specific sale if selected
      });
      setPaymentAmount("");
      setPaymentDescription("");
      setSelectedSaleForPayment(null);
      setShowPaymentForm(false);
      handleViewDetails(selectedRetailer);
      fetchRetailers();
    } catch (error) {
      console.error("Failed to add payment", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRetailers = retailers.filter(
    (retailer) =>
      retailer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      retailer.contact.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 dark:bg-slate-950 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white">
              <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />{" "}
              Retailers Management
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage retailer accounts, balances, and purchase history.
            </p>
          </div>
          <Button
            onClick={() => {
              setShowForm(true);
              setEditingRetailer(null);
              setFormData({
                name: "",
                contact: "",
                address: "",
                bankAccount: "",
                bankName: "",
                initialPay: 0,
                notes: "",
              });
            }}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> Add Retailer
          </Button>
        </div>

        {showForm && (
          <Card className="border-slate-200 dark:border-slate-800 dark:bg-slate-900">
            <CardHeader>
              <CardTitle>
                {editingRetailer ? "Edit Retailer" : "Add New Retailer"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact</Label>
                    <Input
                      value={formData.contact}
                      onChange={(e) =>
                        setFormData({ ...formData, contact: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Bank Account</Label>
                    <Input
                      value={formData.bankAccount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bankAccount: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bank Name</Label>
                    <Input
                      value={formData.bankName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bankName: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Initial Pay</Label>
                  <Input
                    type="number"
                    value={formData.initialPay}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        initialPay: Number(e.target.value),
                      })
                    }
                    placeholder="Enter initial payment amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading}>
                    {editingRetailer ? "Update" : "Create"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditingRetailer(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card className="overflow-hidden border-slate-200 dark:border-slate-800 dark:bg-slate-900">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-slate-900 dark:text-white">
                  Retailers Directory
                </CardTitle>
                <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-4">
                  Total purchases, total paid, remaining debit, and transaction history
                </CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search retailers..."
                  className="pl-10 dark:bg-slate-800/50 dark:border-slate-700"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-slate-500">
                Loading retailers...
              </div>
            ) : filteredRetailers.length === 0 ? (
              <div className="p-8 text-center italic text-slate-400">
                No retailers found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase text-xs font-bold">
                    <tr>
                      <th className="rounded-l-lg px-4 py-3">Name</th>
                      <th className="px-4 py-3">Contact</th>
                      <th className="px-4 py-3">Bank Name</th>
                      <th className="px-4 py-3">Account No</th>
                      <th className="px-4 py-3">Total Sales</th>
                      <th className="px-4 py-3">Total Paid</th>
                      <th className="px-4 py-3">Remaining Debit</th>
                      <th className="px-4 py-3">Transactions</th>
                      <th className="rounded-r-lg px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredRetailers.map((retailer) => {
                      const totalSales = retailer.totalSales || 0;
                      const totalPurchases = retailer.totalPurchases || 0;
                      const totalDebit = retailer.totalDebit || 0;
                      const totalPaid = retailer.totalPaid || 0;
                      const remainingDebit = retailer.remainingBalance !== undefined ? retailer.remainingBalance : (totalDebit - totalPaid);
                      const transactionCount = retailer.transactions?.length || 0;

                      return (
                        <tr
                          key={retailer._id}
                          className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        >
                          <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                            {retailer.name}
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-slate-400" />
                              {retailer.contact}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                            <div className="text-sm font-medium">
                              {retailer.bankName || 'N/A'}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                            <div className="font-mono text-sm">
                              {retailer.bankAccount || 'N/A'}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-semibold text-purple-600 dark:text-purple-400">
                            <div className="flex items-center gap-2">
                              <ShoppingCart className="h-4 w-4" />
                              Rs. {totalSales.toLocaleString()}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-semibold text-green-600 dark:text-green-400">
                            <div className="flex items-center gap-2">
                              <ArrowUpCircle className="h-4 w-4" />
                              Rs. {totalPaid.toLocaleString()}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                "font-bold",
                                remainingDebit > 0
                                  ? "text-red-600 dark:text-red-400"
                                  : remainingDebit < 0
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-slate-600 dark:text-slate-400"
                              )}
                            >
                              {remainingDebit > 0 ? "+" : ""}
                              Rs. {Math.abs(remainingDebit).toLocaleString()}
                            </span>
                            {remainingDebit > 0 && (
                              <span className="block text-[10px] text-slate-500 mt-1">
                                (Debit)
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-2">
                              <History className="h-4 w-4 text-slate-400" />
                              {transactionCount}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-blue-500 hover:text-blue-600"
                                onClick={() => handleViewDetails(retailer)}
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleEdit(retailer)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-600"
                                onClick={() => handleDelete(retailer._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
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

        {/* Retailer Details Modal */}
        {showDetails && selectedRetailer && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden border-slate-200 dark:border-slate-800 dark:bg-slate-900">
              <CardHeader className="border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-slate-900 dark:text-white">
                      {selectedRetailer.name} - Credit/Debit Details
                    </CardTitle>
                    <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">
                      Complete transaction history and balance breakdown
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowDetails(false);
                      setShowPaymentForm(false);
                      setSelectedRetailer(null);
                    }}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {/* Retailer Info */}
                <Card className="mb-6 border-slate-200 dark:border-slate-800">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Name</p>
                        <p className="font-semibold text-slate-900 dark:text-white">{selectedRetailer.name}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Contact</p>
                        <p className="font-semibold text-slate-900 dark:text-white">{selectedRetailer.contact}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Bank Name</p>
                        <p className="font-semibold text-slate-900 dark:text-white">{selectedRetailer.bankName || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Bank Account</p>
                        <p className="font-semibold text-slate-900 dark:text-white">{selectedRetailer.bankAccount || "N/A"}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Address</p>
                        <p className="font-semibold text-slate-900 dark:text-white">{selectedRetailer.address || "N/A"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Summary Cards */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <Card className="border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <ShoppingCart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        <span className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400">
                          Total Sales
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        Rs. {(selectedRetailer.totalSales || 0).toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <ArrowDownCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400">
                          Total Purchases
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        Rs. {(selectedRetailer.totalPurchases || 0).toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <ArrowUpCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <span className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400">
                          Total Paid
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        Rs. {(selectedRetailer.totalPaid || 0).toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className={cn(
                    "border",
                    (selectedRetailer.remainingBalance || 0) > 0
                      ? "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400">
                          Remaining Debit
                        </span>
                      </div>
                      <p className={cn(
                        "text-2xl font-bold",
                        (selectedRetailer.remainingBalance || 0) > 0
                          ? "text-red-600 dark:text-red-400"
                          : "text-slate-600 dark:text-slate-400"
                      )}>
                        Rs. {Math.abs(selectedRetailer.remainingBalance || 0).toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Payment Form */}
                {showPaymentForm ? (
                  <Card className="mb-6 border-slate-200 dark:border-slate-800">
                    <CardHeader>
                      <CardTitle className="text-lg">Add Payment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleAddPayment} className="space-y-4">
                        {/* Show unpaid/partial sales for selection */}
                        {selectedRetailer.transactions?.filter((t: any) => 
                          t.type === 'sale' && t.sale && 
                          (!t.sale.paymentStatus || t.sale.paymentStatus !== 'paid')
                        ).length > 0 && (
                          <div className="space-y-2">
                            <Label>Apply Payment To Sale (Optional)</Label>
                            <select
                              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                              value={selectedSaleForPayment || ""}
                              onChange={(e) => setSelectedSaleForPayment(e.target.value || null)}
                            >
                              <option value="">General Payment (Not linked to specific sale)</option>
                              {selectedRetailer.transactions
                                .filter((t: any) => 
                                  t.type === 'sale' && t.sale && 
                                  (!t.sale.paymentStatus || t.sale.paymentStatus !== 'paid')
                                )
                                .map((t: any) => (
                                  <option key={t.sale._id} value={t.sale._id}>
                                    {t.sale.invoiceId} - Rs. {t.sale.totalAmount} 
                                    ({t.sale.paymentStatus === 'partial' ? `Paid: ${t.sale.paidAmount}, Remaining: ${t.sale.totalAmount - t.sale.paidAmount}` : 'Unpaid'})
                                  </option>
                                ))}
                            </select>
                          </div>
                        )}
                        <div className="space-y-2">
                          <Label>Payment Amount</Label>
                          <Input
                            type="number"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            placeholder="Enter amount"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description (Optional)</Label>
                          <Input
                            value={paymentDescription}
                            onChange={(e) => setPaymentDescription(e.target.value)}
                            placeholder="Payment description"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit" disabled={loading}>
                            Record Payment
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowPaymentForm(false);
                              setPaymentAmount("");
                              setPaymentDescription("");
                              setSelectedSaleForPayment(null);
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="mb-6">
                    <Button
                      onClick={() => setShowPaymentForm(true)}
                      className="gap-2 bg-green-600 hover:bg-green-700"
                    >
                      <ArrowUpCircle className="h-4 w-4" /> Add Payment
                    </Button>
                  </div>
                )}

                {/* Transaction History */}
                <Card className="border-slate-200 dark:border-slate-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5" /> Transaction History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedRetailer.transactions && selectedRetailer.transactions.length > 0 ? (
                      <div className="space-y-3">
                        {selectedRetailer.transactions
                          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((transaction: any, index: number) => {
                            const isSale = transaction.type === "sale";
                            const isPayment = transaction.type === "payment";
                            const isPurchase = transaction.type === "purchase";
                            const sale = transaction.sale;
                            
                            return (
                              <div
                                key={index}
                                className={cn(
                                  "p-4 rounded-lg border",
                                  isSale
                                    ? "border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20"
                                    : isPurchase
                                      ? "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20"
                                      : isPayment
                                        ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20"
                                        : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
                                )}
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex items-start gap-3 flex-1">
                                    {isSale ? (
                                      <ShoppingCart className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                                    ) : isPurchase ? (
                                      <ArrowDownCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                    ) : (
                                      <ArrowUpCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                                    )}
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <p className="font-semibold text-slate-900 dark:text-white">
                                          {isSale ? "Sale" : isPurchase ? "Purchase" : "Payment"}
                                        </p>
                                        {sale && sale.invoiceId && (
                                          <span className="text-xs font-mono bg-white dark:bg-slate-800 px-2 py-0.5 rounded text-purple-600 dark:text-purple-400">
                                            {sale.invoiceId}
                                          </span>
                                        )}
                                      </div>
                                      {isSale && sale ? (
                                        <div className="space-y-1 mt-2">
                                          <div className="grid grid-cols-3 gap-4 text-xs">
                                            <div>
                                              <span className="text-slate-500 dark:text-slate-400">Sale Amount:</span>
                                              <p className="font-semibold text-purple-600 dark:text-purple-400">
                                                Rs. {(sale.totalAmount || transaction.amount).toLocaleString()}
                                              </p>
                                            </div>
                                            <div>
                                              <span className="text-slate-500 dark:text-slate-400">Paid:</span>
                                              <p className="font-semibold text-green-600 dark:text-green-400">
                                                Rs. {(sale.paidAmount || 0).toLocaleString()}
                                              </p>
                                            </div>
                                            <div>
                                              <span className="text-slate-500 dark:text-slate-400">Remaining:</span>
                                              <p className="font-semibold text-red-600 dark:text-red-400">
                                                Rs. {((sale.totalAmount || transaction.amount) - (sale.paidAmount || 0)).toLocaleString()}
                                              </p>
                                            </div>
                                          </div>
                                          {sale.items && sale.items.length > 0 && (
                                            <div className="mt-2 pt-2 border-t border-purple-200 dark:border-purple-800">
                                              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Products:</p>
                                              <div className="flex flex-wrap gap-1">
                                                {sale.items.slice(0, 3).map((item: any, idx: number) => (
                                                  <span key={idx} className="text-xs bg-white dark:bg-slate-800 px-2 py-0.5 rounded">
                                                    {item.product?.name || "Item"} (Qty: {item.quantity})
                                                  </span>
                                                ))}
                                                {sale.items.length > 3 && (
                                                  <span className="text-xs text-slate-500">+{sale.items.length - 3} more</span>
                                                )}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                          {transaction.description || `Transaction on ${formatDateSafe(transaction.date)}`}
                                        </p>
                                      )}
                                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                                        {formatDateTimeSafe(transaction.date)}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p
                                      className={cn(
                                        "text-lg font-bold",
                                        isSale || isPurchase
                                          ? "text-purple-600 dark:text-purple-400"
                                          : "text-green-600 dark:text-green-400"
                                      )}
                                    >
                                      {isSale || isPurchase ? "+" : "-"}Rs.{" "}
                                      {transaction.amount.toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    ) : (
                      <p className="text-center text-slate-500 py-8">
                        No transactions found
                      </p>
                    )}
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
