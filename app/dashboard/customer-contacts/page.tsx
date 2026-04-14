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
import { Search, Users, Phone, MapPin } from "lucide-react";
import api from "@/lib/api";
import { formatDateSafe } from "@/lib/utils";

export default function CustomerContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCustomerContacts();
  }, []);

  const fetchCustomerContacts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/sales");
      const sales = res.data || [];

      // Extract unique customer contacts from sales
      const contactMap = new Map();
      sales.forEach((sale: any) => {
        if (sale.customerName || sale.customerPhone || sale.customerAddress) {
          const key = sale.customerPhone || sale.customerName || "unknown";
          if (!contactMap.has(key)) {
            contactMap.set(key, {
              name: sale.customerName || "N/A",
              phone: sale.customerPhone || "N/A",
              address: sale.customerAddress || "N/A",
              lastSaleDate: sale.saleDate || sale.createdAt,
            });
          } else {
            // Update if this sale is more recent
            const existing = contactMap.get(key);
            const currentDate = new Date(sale.saleDate || sale.createdAt);
            const existingDate = new Date(existing.lastSaleDate);
            if (currentDate > existingDate) {
              contactMap.set(key, {
                ...existing,
                name: sale.customerName || existing.name,
                phone: sale.customerPhone || existing.phone,
                address: sale.customerAddress || existing.address,
                lastSaleDate: sale.saleDate || sale.createdAt,
              });
            }
          }
        }
      });

      const uniqueContacts = Array.from(contactMap.values());
      setContacts(uniqueContacts);
    } catch (error) {
      console.error("Failed to fetch customer contacts", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 dark:bg-slate-950 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white">
              <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />{" "}
              Customer Contacts
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Customer contact information extracted from sales records.
            </p>
          </div>
        </div>

        <Card className="overflow-hidden border-slate-200 dark:border-slate-800 dark:bg-slate-900">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-slate-900 dark:text-white">
                  Customer Contact Directory
                </CardTitle>
                <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Name, contact, and address from sales
                </CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search contacts..."
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
                Loading contacts...
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="p-8 text-center italic text-slate-400">
                No customer contacts found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase text-xs font-bold">
                    <tr>
                      <th className="rounded-l-lg px-4 py-3">Name</th>
                      <th className="px-4 py-3">Contact</th>
                      <th className="px-4 py-3">Address</th>
                      <th className="rounded-r-lg px-4 py-3">Last Sale</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredContacts.map((contact, index) => (
                      <tr
                        key={index}
                        className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            {contact.name}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-slate-400" />
                            {contact.phone}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-slate-400" />
                            {contact.address}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                          {formatDateSafe(contact.lastSaleDate)}
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
