"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  FileText,
  TrendingUp,
  ArrowDownCircle,
  ArrowUpCircle,
  Printer,
  Search,
  Calendar,
  Wallet,
} from "lucide-react";
import api from "@/lib/api";
import { formatDateSafe } from "@/lib/utils";
import { toast } from "sonner";

export default function FinancialReportsPage() {
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      // Ensure backend route matches registration
      const res = await api.get(`/analytics/financial-report?${params.toString()}`);
      setReportData(res.data);
    } catch (error) {
      console.error("Failed to fetch report", error);
      toast.error("Failed to load financial report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReport();
  };

  // Calculate Aggregates
  const totals = reportData.reduce(
    (acc, curr) => ({
      sales: acc.sales + curr.sales,
      purchases: acc.purchases + (curr.purchases || 0),
      expenses: acc.expenses + (curr.expenses || 0),
      profit: acc.profit + (curr.profit || 0),
      netProfit: acc.netProfit + (curr.netProfit || 0),
    }),
    { sales: 0, purchases: 0, expenses: 0, profit: 0, netProfit: 0 }
  );

  return (
    <div className="min-h-screen space-y-8 bg-slate-50 p-6 dark:bg-slate-950 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="flex items-center gap-3 text-3xl font-bold text-slate-900 dark:text-white">
            <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            Financial Summary Report
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Daily and monthly ledger of sales, purchases, and profits.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 print:hidden">
          <Button
            onClick={() => window.print()}
            variant="outline"
            className="gap-2 border-slate-200 dark:border-slate-700"
          >
            <Printer className="h-4 w-4" /> Print Ledger
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="w-full border-slate-200 dark:border-slate-800 dark:bg-slate-900 print:hidden">
        <CardContent className="pt-4">
          <form onSubmit={handleFilter} className="flex flex-wrap items-end gap-3">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-slate-500">Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-9 w-40 dark:bg-slate-800/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-slate-500">End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-9 w-40 dark:bg-slate-800/50"
              />
            </div>
            <Button type="submit" size="sm" disabled={loading} className="h-9 gap-2">
              <Search className="h-4 w-4" /> Apply Filters
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setStartDate("");
                setEndDate("");
                fetchReport();
              }}
              className="h-9"
            >
              Reset
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-blue-100 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-blue-600 dark:text-blue-400">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">Rs. {totals.sales.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="border-rose-100 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-rose-600 dark:text-rose-400">Total Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-700 dark:text-rose-300">Rs. {totals.purchases.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="border-amber-100 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-amber-600 dark:text-amber-400">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">Rs. {totals.expenses.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">Rs. {totals.netProfit.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card className="border-slate-200 dark:border-slate-800 dark:bg-slate-900">
        <CardHeader>
          <CardTitle>Daily Transaction Ledger</CardTitle>
          <CardDescription>Breakdown of performance by date</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase text-xs font-bold tabular-nums">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Date</th>
                  <th className="px-4 py-3 text-right">Sales</th>
                  <th className="px-4 py-3 text-right">Purchases</th>
                  <th className="px-4 py-3 text-right">Expenses</th>
                  <th className="px-4 py-3 text-right">Gross Profit</th>
                  <th className="px-4 py-3 text-right rounded-r-lg">Net Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {reportData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      No records found for the selected range.
                    </td>
                  </tr>
                ) : (
                  reportData.map((day) => (
                    <tr key={day.date} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors tabular-nums">
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                        {formatDateSafe(day.date)}
                      </td>
                      <td className="px-4 py-3 text-right text-blue-600 dark:text-blue-400 font-medium">
                        Rs. {day.sales.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-rose-500 font-medium">
                        Rs. {day.purchases.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-amber-600 font-medium">
                        Rs. {day.expenses.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400 font-bold">
                        Rs. {day.profit.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-black">
                        <span className={day.netProfit >= 0 ? "text-emerald-600" : "text-rose-600"}>
                          Rs. {day.netProfit.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
