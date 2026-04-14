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
  UserCheck,
  Plus,
  Search,
  Edit,
  Trash2,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
} from "lucide-react";
import api from "@/lib/api";
import { cn, formatDateSafe } from "@/lib/utils";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    joiningDate: "",
    salary: 0,
    phone: "",
    address: "",
    CNIC: "",
    notes: "",
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await api.get("/employees");
      setEmployees(res.data || []);
    } catch (error) {
      console.error("Failed to fetch employees", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingEmployee) {
        await api.put(`/employees/${editingEmployee._id}`, formData);
      } else {
        await api.post("/employees", formData);
      }
      setShowForm(false);
      setEditingEmployee(null);
      setFormData({
        name: "",
        joiningDate: "",
        salary: 0,
        phone: "",
        address: "",
        CNIC: "",
        notes: "",
      });
      fetchEmployees();
    } catch (error) {
      console.error("Failed to save employee", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (employee: any) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      joiningDate: employee.joiningDate
        ? new Date(employee.joiningDate).toISOString().split("T")[0]
        : "",
      salary: employee.salary || 0,
      phone: employee.phone,
      address: employee.address || "",
      CNIC: employee.CNIC,
      notes: employee.notes || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;
    try {
      await api.delete(`/employees/${id}`);
      fetchEmployees();
    } catch (error) {
      console.error("Failed to delete employee", error);
    }
  };

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.CNIC.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 dark:bg-slate-950 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white">
              <UserCheck className="h-8 w-8 text-blue-600 dark:text-blue-400" />{" "}
              Employee Management
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage employee information, joining dates, salaries, and contact details.
            </p>
          </div>
          <Button
            onClick={() => {
              setShowForm(true);
              setEditingEmployee(null);
              setFormData({
                name: "",
                joiningDate: "",
                salary: 0,
                phone: "",
                address: "",
                CNIC: "",
                notes: "",
              });
            }}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> Add Employee
          </Button>
        </div>

        {showForm && (
          <Card className="border-slate-200 dark:border-slate-800 dark:bg-slate-900">
            <CardHeader>
              <CardTitle>
                {editingEmployee ? "Edit Employee" : "Add New Employee"}
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
                    <Label>Joining Date</Label>
                    <Input
                      type="date"
                      value={formData.joiningDate}
                      onChange={(e) =>
                        setFormData({ ...formData, joiningDate: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Salary</Label>
                    <Input
                      type="number"
                      value={formData.salary}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          salary: Number(e.target.value),
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
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
                <div className="space-y-2">
                  <Label>CNIC</Label>
                  <Input
                    value={formData.CNIC}
                    onChange={(e) =>
                      setFormData({ ...formData, CNIC: e.target.value })
                    }
                    required
                    placeholder="12345-1234567-1"
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
                    {editingEmployee ? "Update" : "Create"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditingEmployee(null);
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
                  Employees Directory
                </CardTitle>
                <CardDescription className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Name, joining date, salary, phone, address, CNIC
                </CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search employees..."
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
                Loading employees...
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="p-8 text-center italic text-slate-400">
                No employees found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase text-xs font-bold">
                    <tr>
                      <th className="rounded-l-lg px-4 py-3">Name</th>
                      <th className="px-4 py-3">Joining Date</th>
                      <th className="px-4 py-3">Salary</th>
                      <th className="px-4 py-3">Phone</th>
                      <th className="px-4 py-3">Address</th>
                      <th className="px-4 py-3">CNIC</th>
                      <th className="rounded-r-lg px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredEmployees.map((employee) => (
                      <tr
                        key={employee._id}
                        className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                          {employee.name}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            {formatDateSafe(employee.joiningDate)}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-green-600 dark:text-green-400">
                          Rs. {employee.salary.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-slate-400" />
                            {employee.phone}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-slate-400" />
                            {employee.address || "N/A"}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-slate-400" />
                            {employee.CNIC}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEdit(employee)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-600"
                              onClick={() => handleDelete(employee._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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
