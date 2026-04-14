"use client";

import { useEffect, useState } from "react";
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
  Clock,
  Search,
  Calendar,
  UserCheck,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import api from "@/lib/api";
import { cn, formatDateSafe, formatTimeSafe } from "@/lib/utils";

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [checkInEmployeeId, setCheckInEmployeeId] = useState("");
  const [checkOutEmployeeId, setCheckOutEmployeeId] = useState("");

  useEffect(() => {
    fetchAttendance();
    fetchEmployees();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (selectedEmployee) params.append("employeeId", selectedEmployee);

      const res = await api.get(`/attendance?${params.toString()}`);
      setAttendance(res.data || []);
    } catch (error) {
      console.error("Failed to fetch attendance", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/employees");
      setEmployees(res.data || []);
    } catch (error) {
      console.error("Failed to fetch employees", error);
    }
  };

  const fetchReport = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const res = await api.get(`/attendance/report?${params.toString()}`);
      setReport(res.data);
      setShowReport(true);
    } catch (error) {
      console.error("Failed to fetch report", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!checkInEmployeeId) return;
    try {
      await api.post("/attendance/checkin", { employeeId: checkInEmployeeId });
      setCheckInEmployeeId("");
      fetchAttendance();
      alert("Check-in successful!");
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to check in");
    }
  };

  const handleCheckOut = async () => {
    if (!checkOutEmployeeId) return;
    try {
      await api.post("/attendance/checkout", { employeeId: checkOutEmployeeId });
      setCheckOutEmployeeId("");
      fetchAttendance();
      alert("Check-out successful!");
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to check out");
    }
  };

  const filteredAttendance = attendance.filter(
    (record) =>
      record.employee?.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      record.employee?.CNIC?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 dark:bg-slate-950 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white">
              <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400" />{" "}
              Attendance Tracking
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Track employee check-in, check-out, and generate attendance reports.
            </p>
          </div>
        </div>

        {/* Check-in/Check-out Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-slate-200 dark:border-slate-800 dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" /> Check In
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select Employee</Label>
                <select
                  className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                  value={checkInEmployeeId}
                  onChange={(e) => setCheckInEmployeeId(e.target.value)}
                >
                  <option value="">Select employee...</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} ({emp.CNIC})
                    </option>
                  ))}
                </select>
              </div>
              <Button
                onClick={handleCheckIn}
                disabled={!checkInEmployeeId}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Check In
              </Button>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800 dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" /> Check Out
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select Employee</Label>
                <select
                  className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                  value={checkOutEmployeeId}
                  onChange={(e) => setCheckOutEmployeeId(e.target.value)}
                >
                  <option value="">Select employee...</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} ({emp.CNIC})
                    </option>
                  ))}
                </select>
              </div>
              <Button
                onClick={handleCheckOut}
                disabled={!checkOutEmployeeId}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                Check Out
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-slate-200 dark:border-slate-800 dark:bg-slate-900">
          <CardHeader>
            <CardTitle>Filters & Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Employee</Label>
                <select
                  className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                >
                  <option value="">All Employees</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={fetchAttendance} className="flex-1">
                  Filter
                </Button>
                <Button
                  onClick={fetchReport}
                  variant="outline"
                  className="flex-1"
                >
                  <TrendingUp className="h-4 w-4 mr-2" /> Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Summary */}
        {showReport && report && (
          <Card className="border-slate-200 dark:border-slate-800 dark:bg-slate-900">
            <CardHeader>
              <CardTitle>Attendance Report Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {report.summary.totalRecords}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Total Records
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {report.summary.presentCount}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Present
                  </p>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {report.summary.absentCount}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Absent
                  </p>
                </div>
                <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {report.summary.totalHours.toFixed(1)}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Total Hours
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Attendance Records */}
        <Card className="overflow-hidden border-slate-200 dark:border-slate-800 dark:bg-slate-900">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-slate-900 dark:text-white">
                  Attendance Records
                </CardTitle>
                <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Check-in, check-out, and attendance status
                </CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search attendance..."
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
                Loading attendance...
              </div>
            ) : filteredAttendance.length === 0 ? (
              <div className="p-8 text-center italic text-slate-400">
                No attendance records found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase text-xs font-bold">
                    <tr>
                      <th className="rounded-l-lg px-4 py-3">Employee</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Check In</th>
                      <th className="px-4 py-3">Check Out</th>
                      <th className="px-4 py-3">Hours</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredAttendance.map((record) => (
                      <tr
                        key={record._id}
                        className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                          {record.employee?.name || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            {formatDateSafe(record.date)}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                          {record.checkIn ? formatTimeSafe(record.checkIn) : "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                          {record.checkOut ? formatTimeSafe(record.checkOut) : "—"}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                          {record.totalHours || 0} hrs
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase",
                              record.status === "present"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : record.status === "absent"
                                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                  : record.status === "late"
                                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                            )}
                          >
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
