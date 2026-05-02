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
import { formatDateSafe, formatDateTimeSafe } from "@/lib/utils";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download } from "lucide-react";

const printStyles = `
  @media print {
    @page { size: A4 landscape; margin: 10mm; }
    body { background: white !important; font-size: 10pt; }
    .print\\:hidden { display: none !important; }
    .shadow-sm, .shadow, .shadow-md, .shadow-lg, .shadow-xl { shadow: none !important; }
    .border-slate-200 { border-color: #000 !important; }
    table { width: 100% !important; border-collapse: collapse !important; }
    th, td { border: 1px solid #000 !important; padding: 4px 8px !important; }
    .text-blue-600, .text-rose-500, .text-amber-600, .text-emerald-600, .text-purple-600 { color: #000 !important; font-weight: bold !important; }
    h1 { font-size: 18pt !important; margin-bottom: 10px !important; }
    .grid { display: block !important; }
    .grid > div { margin-bottom: 10px !important; border: 1px solid #000 !important; padding: 10px !important; }
  }
`;

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
      const res = await api.get(
        `/analytics/financial-report?${params.toString()}`,
      );
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

  const downloadPDF = () => {
    const doc = new jsPDF("landscape");
    doc.setFontSize(18);
    doc.text("Financial Summary Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);
    doc.text(
      `Report Period: ${startDate || "Initial"} to ${endDate || "Present"}`,
      14,
      28,
    );

    const tableData = reportData.map((item) => [
      formatDateTimeSafe(item.date),
      (item.productNames || []).join(", ") || "-",
      `Rs. ${(item.cashSales || 0).toLocaleString()}`,
      `Rs. ${(item.cardSales || 0).toLocaleString()}`,
      `Rs. ${(item.bankTransferSales || 0).toLocaleString()}`,
      `Rs. ${item.sales.toLocaleString()}`,
      `Rs. ${item.purchases.toLocaleString()}`,
      `Rs. ${item.expenses.toLocaleString()}`,
      `Rs. ${item.profit.toLocaleString()}`,
      `Rs. ${item.netProfit.toLocaleString()}`,
    ]);

    autoTable(doc, {
      startY: 35,
      head: [
        [
          "Date",
          "Products Sold",
          "Cash",
          "Card",
          "Bank",
          "Total Sales",
          "Purchases",
          "Expenses",
          "Gross Profit",
          "Net Profit",
        ],
      ],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 8 },
    });

    doc.save(
      `financial_summary_${startDate || "full"}_to_${endDate || "full"}.pdf`,
    );
    toast.success("PDF Downloaded successfully");
  };

  // Calculate Aggregates
  const totals = reportData.reduce(
    (acc, curr) => ({
      sales: acc.sales + curr.sales,
      cash: acc.cash + (curr.cashSales || 0),
      card: acc.card + (curr.cardSales || 0),
      bankTransfer: acc.bankTransfer + (curr.bankTransferSales || 0),
      purchases: acc.purchases + (curr.purchases || 0),
      expenses: acc.expenses + (curr.expenses || 0),
      profit: acc.profit + (curr.profit || 0),
      netProfit: acc.netProfit + (curr.netProfit || 0),
    }),
    {
      sales: 0,
      cash: 0,
      card: 0,
      bankTransfer: 0,
      purchases: 0,
      expenses: 0,
      profit: 0,
      netProfit: 0,
    },
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
            onClick={downloadPDF}
            variant="outline"
            className="gap-2 border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-900/50 dark:text-blue-400 dark:hover:bg-blue-900/20"
          >
            <Download className="h-4 w-4" /> Download PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="w-full border-slate-200 dark:border-slate-800 dark:bg-slate-900 print:hidden">
        <CardContent className="pt-4">
          <form
            onSubmit={handleFilter}
            className="flex flex-wrap items-end gap-3"
          >
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-slate-500">
                Start Date
              </Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-9 w-40 dark:bg-slate-800/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-slate-500">
                End Date
              </Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-9 w-40 dark:bg-slate-800/50"
              />
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={loading}
              className="h-9 gap-2"
            >
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
      <style>{printStyles}</style>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <Card className="border-blue-100 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-blue-600 dark:text-blue-400">
              Total Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-blue-700 dark:text-blue-300">
              Rs. {totals.sales.toLocaleString()}
            </div>
            <div className="mt-1 flex flex-col text-[10px] text-slate-500 font-medium">
              <span>Cash: Rs. {totals.cash.toLocaleString()}</span>
              <span>Card: Rs. {totals.card.toLocaleString()}</span>
              <span>Bank: Rs. {totals.bankTransfer.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-rose-100 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-rose-600 dark:text-rose-400">
              Total Purchases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-rose-700 dark:text-rose-300">
              Rs. {totals.purchases.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-100 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-amber-600 dark:text-amber-400">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-amber-700 dark:text-amber-300">
              Rs. {totals.expenses.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400">
              Gross Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
              Rs. {totals.profit.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-100 dark:border-emerald-900/50 bg-emerald-600 dark:bg-emerald-600 text-white shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-emerald-100">
              Net Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              Rs. {totals.netProfit.toLocaleString()}
            </div>
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
                  <th className="px-4 py-3">Products Sold</th>
                  <th className="px-4 py-3 text-right">Cash</th>
                  <th className="px-4 py-3 text-right">Card</th>
                  <th className="px-4 py-3 text-right">Bank</th>
                  <th className="px-4 py-3 text-right">Total Sales</th>
                  <th className="px-4 py-3 text-right">Purchases</th>
                  <th className="px-4 py-3 text-right">Expenses</th>
                  <th className="px-4 py-3 text-right">Gross Profit</th>
                  <th className="px-4 py-3 text-right rounded-r-lg">
                    Net Profit
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {reportData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-4 py-8 text-center text-slate-400"
                    >
                      No records found for the selected range.
                    </td>
                  </tr>
                ) : (
                  reportData.map((item, index) => (
                    <tr
                      key={item._id || index}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors tabular-nums"
                    >
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                        {formatDateTimeSafe(item.date)}
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300 text-sm font-medium">
                        {(item.productNames || []).join(", ") || "-"}
                      </td>
                      <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400 font-medium">
                        Rs. {(item.cashSales || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-blue-600 dark:text-blue-400 font-medium">
                        Rs. {(item.cardSales || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-purple-600 dark:text-purple-400 font-medium">
                        Rs. {(item.bankTransferSales || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="font-bold text-slate-900 dark:text-white">
                          Rs. {item.sales.toLocaleString()}
                        </div>
                        {(item.returns !== 0 || item.exchanges !== 0) && (
                          <div className="flex flex-col text-[10px] items-end mt-1">
                            {item.returns !== 0 && (
                              <span className="text-orange-600 font-medium">
                                Ret: Rs. {item.returns.toLocaleString()}
                              </span>
                            )}
                            {item.exchanges !== 0 && (
                              <span className="text-blue-600 font-medium">
                                Exc: Rs. {item.exchanges.toLocaleString()}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-rose-500 font-medium">
                        Rs. {item.purchases.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-amber-600 font-medium">
                        Rs. {item.expenses.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400 font-bold">
                        Rs. {item.profit.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-black">
                        <span
                          className={
                            item.netProfit >= 0
                              ? "text-emerald-600"
                              : "text-rose-600"
                          }
                        >
                          Rs. {item.netProfit.toLocaleString()}
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
