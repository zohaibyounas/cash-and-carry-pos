"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Search,
  ShoppingCart,
  Trash2,
  Printer,
  CheckCircle,
  History,
  Filter,
  X,
  Package,
  FileText,
  User,
  ArrowRightLeft,
  Settings2,
  Pencil,
  Building2,
} from "lucide-react";
import api from "@/lib/api";
import { cn, formatDateSafe, formatDateTimeSafe } from "@/lib/utils";

export default function POSPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [selectedSearchIndex, setSelectedSearchIndex] = useState(-1);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [discount, setDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<"sale" | "history">("sale");
  const [sales, setSales] = useState<any[]>([]);
  const [lastInvoice, setLastInvoice] = useState<any>(null);
  const [scannedItem, setScannedItem] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const isProcessingRef = useRef(false); // ✅ ADD THIS

  // New State for Phase 3
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedRetailer, setSelectedRetailer] = useState<any>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [retailerSearch, setRetailerSearch] = useState("");
  const [retailers, setRetailers] = useState<any[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [remarks, setRemarks] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "card" | "bank_transfer"
  >("cash");
  const [parkedSales, setParkedSales] = useState<any[]>([]);
  const [showParkedModal, setShowParkedModal] = useState(false);

  // History State

  // Phase 7 States: Print Options & Editing
  const [stores, setStores] = useState<any[]>([]);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedPrintStore, setSelectedPrintStore] = useState<any>(null);
  const [isChallan, setIsChallan] = useState(false);
  const [printFormat, setPrintFormat] = useState<"thermal" | "a4">("thermal");
  const [printingSale, setPrintingSale] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSale, setEditingSale] = useState<any>(null);
  const [allStoresSearch, setAllStoresSearch] = useState(false);
  const [printWithPrice, setPrintWithPrice] = useState(true);
  const [editFormData, setEditFormData] = useState<any>({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    referenceNo: "",
    remarks: "",
    saleDate: "",
  });

  const [userRole, setUserRole] = useState<string>("");

  // Reference to the barcode/search input for focus and keyboard handling
  const barcodeRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [allStoresSearch]);

  useEffect(() => {
    const parked = localStorage.getItem("parkedSales");
    if (parked) {
      try {
        setParkedSales(JSON.parse(parked));
      } catch (e) {}
    }
    fetchSales();
    fetchStores();
    fetchRetailers();
    barcodeRef.current?.focus();

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const u = JSON.parse(storedUser);
      setUserRole(u.role || "salesman");
    }
  }, []);

  // Read `mode` query param (e.g. ?mode=history) to set active view
  const searchParams = useSearchParams();
  const modeParam = searchParams ? searchParams.get("mode") : null;

  useEffect(() => {
    if (modeParam === "history") {
      setActiveMode("history");
    } else if (modeParam === "sale") {
      setActiveMode("sale");
    }
  }, [modeParam]);

  const fetchStores = async () => {
    try {
      const res = await api.get("/stores");
      setStores(res.data);
      // Pre-select current store from local storage
      const storeStored = localStorage.getItem("selectedStore");
      if (storeStored) {
        const s = JSON.parse(storeStored);
        setSelectedPrintStore(s);
      }
    } catch (error) {
      console.error("Failed to fetch stores", error);
    }
  };

  const fetchSales = async () => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      const res = await api.get(`/sales?${params.toString()}`);
      setSales(res.data);
    } catch (error) {
      console.error("Failed to fetch sales", error);
    }
  };

  const handleConvert = async (saleId: string) => {
    // Feature removed as per user request to simplify and remove quotations
  };

  const fetchCustomers = async (search: string = "") => {
    try {
      const query = search ? `/phone/${search}` : "";
      const res = await api.get(`/customers${query}`);
      setCustomers(Array.isArray(res.data) ? res.data : [res.data]);
    } catch (error) {
      console.error("Failed to fetch customers", error);
      setCustomers([]);
    }
  };

  const fetchRetailers = async (search: string = "") => {
    try {
      const res = await api.get("/retailers");
      const allRetailers = res.data || [];
      if (search) {
        const filtered = allRetailers.filter(
          (r: any) =>
            r.name.toLowerCase().includes(search.toLowerCase()) ||
            r.contact.toLowerCase().includes(search.toLowerCase()),
        );
        setRetailers(filtered);
      } else {
        setRetailers([]);
      }
    } catch (error) {
      console.error("Failed to fetch retailers", error);
      setRetailers([]);
    }
  };

  const handleCustomerSelection = (customer: any) => {
    setSelectedCustomer(customer);
    setSelectedRetailer(null); // Clear retailer when customer is selected
    setCustomerName(customer.name || "");
    setCustomerPhone(customer.phone || "");
    setCustomerAddress(customer.address || "");
    setCustomerSearch("");
    setRetailerSearch("");
    setCustomers([]); // clear search results
    setRetailers([]);
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get(`/products?allStores=${allStoresSearch}`);
      setProducts(res.data);
    } catch (error) {
      console.error("Failed to fetch products", error);
    }
  };

  const addToCart = (product: any) => {
    const isOutOfStock = product.totalStock <= 0;
    if (isOutOfStock) {
      alert(`⚠️ ${product.name} is out of stock!`);
      return;
    }

    const existing = cart.find(
      (item) => item._id === product._id && item.unitType === "box",
    );
    if (existing) {
      const unitsPerQuantity =
        existing.unitType === "box" && product.hasPieces
          ? product.piecesPerBox || 1
          : 1;
      if ((existing.quantity + 1) * unitsPerQuantity > product.totalStock) {
        alert(
          `⚠️ Cannot add more. Only ${product.totalStock} pieces available.`,
        );
        return;
      }
      setCart(
        cart.map((item) =>
          item._id === product._id && item.unitType === "box"
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
    } else {
      setCart([...cart, { ...product, quantity: 1, unitType: "box" }]);
    }
    setScannedItem(product._id);
    setTimeout(() => setScannedItem(null), 1000);
    setSearchTerm("");
  };

  const toggleUnit = (id: string) => {
    setCart(
      cart.map((item) => {
        if (item._id === id) {
          const newUnit = item.unitType === "box" ? "piece" : "box";
          const newPrice =
            newUnit === "box"
              ? item.salePrice
              : item.pieceSalePrice || item.salePrice;

          // Calculate needed units
          const unitsNeeded =
            newUnit === "box"
              ? item.quantity * (item.piecesPerBox || 1)
              : item.quantity;

          if (unitsNeeded > item.totalStock) {
            alert(
              `⚠️ Not enough stock to switch to ${newUnit}. Available: ${item.totalStock} pieces.`,
            );
            return item;
          }

          return { ...item, unitType: newUnit, currentPrice: newPrice };
        }
        return item;
      }),
    );
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item._id !== id));
  };

  const updateQuantity = (id: string, q: number) => {
    if (q <= 0) return;
    const item = cart.find((i) => i._id === id);
    if (!item) return;

    const unitsPerQuantity =
      item.unitType === "box" && item.hasPieces ? item.piecesPerBox || 1 : 1;
    if (q * unitsPerQuantity > item.totalStock) {
      alert(
        `⚠️ Only ${item.totalStock} pieces in stock. That would require ${
          q * unitsPerQuantity
        } pieces.`,
      );
      return;
    }
    setCart(cart.map((i) => (i._id === id ? { ...i, quantity: q } : i)));
  };

  const subtotal = cart.reduce((sum, item) => {
    const price =
      item.unitType === "box"
        ? item.salePrice
        : item.pieceSalePrice || item.salePrice;
    return sum + price * item.quantity;
  }, 0);
  const total = subtotal - discount;

  const handleBarcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    setShowSearchDropdown(val.length > 0);
    setSelectedSearchIndex(-1);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      const filteredProducts = products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.barcode &&
            p.barcode.toLowerCase().includes(searchTerm.toLowerCase())),
      );
      e.preventDefault();
      setSelectedSearchIndex((prev) =>
        prev < filteredProducts.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSearchIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();

      // Use ref-based lock to prevent rapid fire triggers
      if (isProcessingRef.current) return;

      const currentVal = e.currentTarget.value.trim();
      if (!currentVal) return;

      // LOCK and CLEAR DOM synchronously to prevent duplicate events from seeing the value
      isProcessingRef.current = true;
      e.currentTarget.value = "";
      setSearchTerm("");
      setShowSearchDropdown(false);

      // Re-calculate filtered list based on the actual value captured from DOM
      const filtered = products.filter(
        (p) =>
          p.name.toLowerCase().includes(currentVal.toLowerCase()) ||
          (p.barcode &&
            p.barcode.toLowerCase().includes(currentVal.toLowerCase())),
      );

      const productToAdd =
        selectedSearchIndex >= 0 ? filtered[selectedSearchIndex] : filtered[0];

      if (productToAdd) {
        addToCart(productToAdd);
        setSelectedSearchIndex(-1);
      }

      // Release lock after a short delay
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 300);
    } else if (e.key === "Escape") {
      setShowSearchDropdown(false);
      setSelectedSearchIndex(-1);
    }
  };

  const handleSelectProduct = (product: any) => {
    addToCart(product);
    setSearchTerm("");
    setShowSearchDropdown(false);
    setSelectedSearchIndex(-1);
    barcodeRef.current?.focus();
  };

  const handleHoldBill = () => {
    if (cart.length === 0) return;
    const newParked = [
      ...parkedSales,
      {
        id: Date.now().toString(),
        time: new Date().toISOString(),
        cart,
        discount,
        selectedCustomer,
        selectedRetailer,
        customerName,
        customerPhone,
        customerAddress,
        referenceNo,
        remarks,
      },
    ];
    setParkedSales(newParked);
    localStorage.setItem("parkedSales", JSON.stringify(newParked));

    // Clear current
    setCart([]);
    setDiscount(0);
    setPaidAmount(0);
    setSelectedCustomer(null);
    setSelectedRetailer(null);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
    setRetailerSearch("");
    setRemarks("");
    setReferenceNo("");
  };

  const handleResumeBill = (parked: any) => {
    setCart(parked.cart || []);
    setDiscount(parked.discount || 0);
    setSelectedCustomer(parked.selectedCustomer || null);
    setSelectedRetailer(parked.selectedRetailer || null);
    setCustomerName(parked.customerName || "");
    setCustomerPhone(parked.customerPhone || "");
    setCustomerAddress(parked.customerAddress || "");
    setReferenceNo(parked.referenceNo || "");
    setRemarks(parked.remarks || "");

    const newParked = parkedSales.filter((p) => p.id !== parked.id);
    setParkedSales(newParked);
    localStorage.setItem("parkedSales", JSON.stringify(newParked));
    setShowParkedModal(false);
  };

  const handleVoid = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to void this sale? Stock will be reverted.",
      )
    )
      return;
    try {
      await api.delete(`/sales/${id}`);
      fetchSales();
      fetchProducts();
    } catch (error) {
      console.error("Void failed", error);
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    const userStored = localStorage.getItem("user");
    const user = userStored ? JSON.parse(userStored) : {};
    const storeStored = localStorage.getItem("selectedStore");
    const storeObj = storeStored ? JSON.parse(storeStored) : null;

    const saleData = {
      store: storeObj?._id || user.store,
      salesman: user._id,
      items: cart.map((item) => {
        const price =
          item.unitType === "box"
            ? item.salePrice
            : item.pieceSalePrice || item.salePrice;
        return {
          product: item._id,
          quantity: item.quantity,
          unitType: item.unitType || "box",
          price: price,
          total: price * item.quantity,
          store: item.store?._id || item.store,
        };
      }),
      subtotal,
      invoiceDiscount: discount,
      totalAmount: total,
      paidAmount: selectedRetailer ? paidAmount || 0 : paidAmount || total,
      // New Fields
      type: "invoice",
      customer: selectedCustomer?._id,
      retailer: selectedRetailer?._id,
      customerName:
        customerName || selectedCustomer?.name || selectedRetailer?.name || "",
      customerPhone:
        customerPhone ||
        selectedCustomer?.phone ||
        selectedRetailer?.contact ||
        "",
      customerAddress:
        customerAddress ||
        selectedCustomer?.address ||
        selectedRetailer?.address ||
        "",
      referenceNo,
      remarks,
      paymentMethod,
      // saleDate will be auto-detected on backend if not provided
    };

    try {
      const res = await api.post("/sales", saleData);
      setLastInvoice(res.data);
      setCart([]);
      setDiscount(0);
      setPaidAmount(0);
      // Reset new fields
      setSelectedCustomer(null);
      setSelectedRetailer(null);
      setCustomerName("");
      setCustomerPhone("");
      setCustomerAddress("");
      setRetailerSearch("");
      setRemarks("");
      setReferenceNo("");
      // Don't reset transactionType, user likely wants to continue in same mode
      fetchSales();
      fetchProducts();
    } catch (error: any) {
      console.error("Checkout failed", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to create sale. Please check console for details.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditMetadata = (sale: any) => {
    setEditingSale(sale);
    const saleDateValue = sale.saleDate || sale.createdAt;
    setEditFormData({
      customerName: sale.customerName || "",
      customerPhone: sale.customerPhone || "",
      customerAddress: sale.customerAddress || "",
      referenceNo: sale.referenceNo || "",
      remarks: sale.remarks || "",
      saleDate: saleDateValue
        ? new Date(saleDateValue).toISOString().slice(0, 16)
        : "",
    });
    setShowEditModal(true);
  };

  const saveMetadata = async () => {
    try {
      setLoading(true);
      await api.put(`/sales/${editingSale._id}`, editFormData);
      setShowEditModal(false);
      fetchSales();
    } catch (error) {
      console.error("Failed to update sale", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (sale: any) => {
    setPrintingSale(sale);
    setShowPrintModal(true);
  };

  // Print A4 Format Invoice/Estimate
  const printA4Format = (
    sale: any,
    options: { isChallan: boolean; customStore?: any },
  ) => {
    const { isChallan, customStore } = options;
    const displayStore = customStore || sale.store;

    const storeName = displayStore?.name || "Store";
    // Fixed store address as requested
    const location = "Street 10, Block C, Sector 4, APHS Rawalpindi";
    const contact =
      displayStore?.contactNumber === "876543234567"
        ? "03091009866"
        : displayStore?.contactNumber || "03091009866";

    const WindowPrt = window.open("", "_blank", "width=900,height=900");
    if (!WindowPrt) {
      alert("Please allow pop-ups to print the invoice");
      return;
    }

    const documentTitle = "ESTIMATE / QUOTATION";

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${documentTitle} - ${sale.invoiceId}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 15mm; }
          .invoice { max-width: 210mm; margin: 0 auto; }
          .header { border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 15px; display: flex; align-items: center; gap: 20px; }
          .logo-section { flex-shrink: 0; }
          .logo-img { height: 110px; width: auto; }
          .header-text { flex: 1; text-align: center; }
          .company-name { font-size: 26px; font-weight: bold; text-transform: uppercase; margin: 0 0 6px 0; line-height: 1.2; letter-spacing: 0.5px; }
          .company-details { font-size: 11px; margin: 3px 0; color: #000; }
          .doc-title { font-size: 15px; font-weight: bold; text-align: center; text-decoration: underline; margin-top: 10px; }
          .info-section { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 15px 0; padding-bottom: 10px; border-bottom: 1px solid #000; }
          .info-left, .info-right { font-size: 11px; }
          .info-row { display: flex; margin-bottom: 3px; }
          .info-label { font-weight: bold; min-width: 60px; }
          .info-value { flex: 1; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 11px; }
          th { background: #fff; padding: 6px; text-align: left; border: 1px solid #000; font-weight: bold; }
          td { padding: 6px; border: 1px solid #000; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .summary-section { margin-top: 15px; }
          .summary-table { width: 100%; font-size: 11px; }
          .summary-table td { border: none; padding: 4px 8px; }
          .summary-label { font-weight: bold; text-align: right; }
          .summary-value { text-align: right; width: 120px; }
          .total-row { border-top: 2px solid #000; font-weight: bold; font-size: 12px; }
          @media print { 
            body { padding: 0; margin: 0; } 
            .invoice { padding: 10mm; }
            @page { 
              margin: 10mm; 
              size: A4 portrait;
              marks: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice">
          <div class="header">
            <div class="company-name">${storeName}</div>
            <div class="company-details">${location} | T: ${contact}</div>
          </div>
          <div class="info-section">
            <div class="info-left">
              <div class="info-row">
                <span class="info-label">Customer:</span>
                <span class="info-value" style="font-weight: bold; font-size: 14px;">${
                  sale.customerName || "COUNTER SALE"
                }</span>
              </div>
              <div class="info-row">
                <span class="info-label">Phone:</span>
                <span class="info-value">${sale.customerPhone || "N/A"}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Address:</span>
                <span class="info-value">${sale.customerAddress || "N/A"}</span>
              </div>
            </div>
            <div class="info-right" style="text-align: right;">
              <div class="info-row" style="justify-content: flex-end;">
                <span class="info-label">Ref No:</span>
                <span class="info-value" style="text-align: right; min-width: 80px; font-weight: bold;">${
                  sale.referenceNo || "—"
                }</span>
              </div>
              <div class="info-row" style="justify-content: flex-end;">
                <span class="info-label">Date:</span>
                <span class="info-value" style="text-align: right; min-width: 80px;">${new Date(
                  sale.createdAt,
                ).toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <!-- Remarks removed from printed receipt -->
          
          <table>
            <thead>
              <tr>
                <th style="width: 50px;">Code</th>
                <th>Products</th>
                <th class="text-center" style="width: 70px;">Quantity</th>
                ${
                  !isChallan
                    ? '<th class="text-right" style="width: 80px;">Rate</th>'
                    : ""
                }
                ${
                  !isChallan
                    ? '<th class="text-right" style="width: 60px;">Disc</th>'
                    : ""
                }
                ${
                  !isChallan
                    ? '<th class="text-right" style="width: 100px;">Net Amount</th>'
                    : ""
                }
              </tr>
            </thead>
            <tbody>
              ${sale.items
                ?.map(
                  (item: any, idx: number) => `
                <tr>
                  <td>${item.product?.barcode || idx + 1}</td>
                  <td>${item.product?.name || "Item"}</td>
                  <td class="text-center">${item.quantity}</td>
                  ${
                    !isChallan
                      ? `<td class="text-right">${item.price.toLocaleString()}</td>`
                      : ""
                  }
                  ${!isChallan ? `<td class="text-right">0.00</td>` : ""}
                  ${
                    !isChallan
                      ? `<td class="text-right">${(
                          item.quantity * item.price
                        ).toLocaleString()}</td>`
                      : ""
                  }
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
          
          ${
            !isChallan
              ? `
          <div class="summary-section">
            <table class="summary-table">
              <tr>
                <td style="width: 60px;"><strong>Total</strong></td>
                <td style="width: 50px; text-align: center;">${
                  sale.items?.length || 0
                }</td>
                <td style="flex: 1;"></td>
                <td class="summary-label">Current Bill:</td>
                <td class="summary-value">${sale.totalAmount.toLocaleString()}</td>
              </tr>
              <tr>
                <td colspan="3"></td>
                <td class="summary-label">Previous</td>
                <td class="summary-value">0</td>
              </tr>
              <tr>
                <td colspan="3"></td>
                <td class="summary-label">Total Amount:</td>
                <td class="summary-value">${sale.totalAmount.toLocaleString()}</td>
              </tr>
              <tr>
                <td colspan="3"></td>
                <td class="summary-label">Received</td>
                <td class="summary-value">${sale.paidAmount.toLocaleString()}</td>
              </tr>
              <tr class="total-row">
                <td colspan="3"></td>
                <td class="summary-label">Net Balance:</td>
                <td class="summary-value">${(
                  sale.totalAmount - sale.paidAmount
                ).toLocaleString()}</td>
              </tr>
            </table>
          </div>
          `
              : `
          <div class="summary-section" style="margin-top: 20px; padding: 15px; border-top: 1px dashed #000;">
            <p style="font-size: 12px; text-align: center; color: #666; font-style: italic;">
              This is a quotation document. Final pricing will be provided upon confirmation.
            </p>
          </div>
          `
          }
          <div style="text-align:center;font-size:10px;margin-top:8px;color:#444;">Powered by iwiz solution | Contact: 03145372506</div>
          <div style="height:6mm"></div>
        </div>
        <script>
              window.onload = function() {
                setTimeout(function() {
                  // Auto-configure print settings for A4
                  window.focus();
                  window.print();
                  setTimeout(function(){ window.close(); }, 800);
                }, 300);
              };
        </script>
      </body>
      </html>
    `;

    WindowPrt.document.write(html);
    WindowPrt.document.close();
  };

  const triggerPrint = (
    sale: any,
    options: { isChallan: boolean; customStore?: any; hidePrice?: boolean },
  ) => {
    const WindowPrt = window.open("", "_blank", "width=900,height=900");
    if (!WindowPrt) {
      alert("Please allow pop-ups to print the receipt");
      return;
    }

    const { isChallan, customStore, hidePrice } = options;
    const displayStore = customStore || sale.store;
    const resolvedContact =
      displayStore?.contactNumber === "876543234567"
        ? "03091009866"
        : displayStore?.contactNumber || "03091009866";
    const actuallyHidePrice = hidePrice ?? isChallan;

    const title = "ESTIMATE / QUOTATION";

    const customerHtml = sale.customerName
      ? `<div class="box-content">
                <strong>TO:</strong><br/>
                ${sale.customerName}<br/>
                ${sale.customerPhone || ""}<br/>
                ${sale.customerAddress || ""}
            </div>
            <!-- Remarks removed as requested -->
            `
      : "";

    const storeName = (displayStore?.name || "STORE NAME").toUpperCase();
    const contactLine = [
      displayStore?.location || "",
      `T: ${displayStore?.contactNumber || "Contact Office"}`,
    ]
      .filter(Boolean)
      .join(" | ");

    const html = `
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="utf-8">
                    <title>${title} - ${sale.invoiceId}</title>
                    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
                    <style>
                        * { box-sizing: border-box; margin: 0; padding: 0; }
                        body { 
                            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
                            margin: 0; 
                            padding: 20px; 
                            color: #1a1f36; 
                            background: #f8fafc; 
                            -webkit-print-color-adjust: exact; 
                            print-color-adjust: exact; 
                            line-height: 1.6;
                        }
                        .sheet { 
                            width: 80mm; 
                            margin: 0 auto; 
                            background: #ffffff; 
                            border-radius: 0; 
                            box-shadow: 0 8px 32px rgba(0,0,0,0.12); 
                            overflow: hidden; 
                            position: relative;
                        }
                        .strip { 
                            height: 3px; 

                            
                            background: #000;
                            position: relative;
                        }
                        .inner { 
                          padding: 4px 4px 4px; 
                          position: relative;
                        }
                        .top { 
                          text-align: center;
                          margin-bottom: 4px; 
                          padding-bottom: 4px; 
                          border-bottom: 1px dashed #000;
                        }
                        .store { position: relative; }
                        .store .title { 
                            font-size: 16px; 
                            font-weight: 800; 
                            color: #000; 
                            margin: 0 0 4px 0; 
                            line-height: 1.2;
                            text-transform: uppercase;
                        }
                        .store .details { 
                            font-size: 9px; 
                            color: #000; 
                            margin-top: 4px; 
                            line-height: 1.4;
                        }
                        .badge-block { 
                            text-align: center; 
                            margin-top: 6px;
                        }
                        .inv-badge { 
                            display: inline-block; 
                            background: #000;
                            color: #fff; 
                            padding: 4px 12px; 
                            font-size: 10px; 
                            font-weight: 800; 
                            margin-bottom: 6px; 
                            text-transform: uppercase;
                        }
                        .inv-meta { 
                            font-size: 8px; 
                            color: #000; 
                            font-weight: 500;
                            text-align: center;
                            line-height: 1.4;
                        }
                        .inv-meta p { 
                            margin: 2px 0; 
                        }
                        .inv-meta b { 
                            color: #000; 
                            font-weight: 700;
                        }
                        .blocks { 
                          display: block;
                          margin-bottom: 4px;
                          padding: 4px 0;
                          border-top: 1px dashed #000;
                          border-bottom: 1px dashed #000;
                        }
                        .block-label { 
                            font-size: 7px; 
                            font-weight: 700; 
                            color: #000; 
                            text-transform: uppercase;
                            margin-bottom: 2px;
                        }
                        .block-value { 
                            font-size: 9px; 
                            font-weight: 700; 
                            color: #000;
                            line-height: 1.3;
                            margin-bottom: 4px;
                        }
                        .block-note { 
                            font-size: 8px; 
                            color: #000; 
                            margin-top: 2px;
                        }
                        .inv-table { 
                            width: 100%; 
                            border-collapse: collapse;
                            margin-bottom: 8px; 
                            font-size: 8px;
                        }
                        .inv-table th { 
                            padding: 4px 2px; 
                            text-align: left; 
                            font-size: 7px; 
                            font-weight: 700; 
                            text-transform: uppercase;
                            color: #000;
                            border-bottom: 1px solid #000;
                        }
                        .inv-table th.num { text-align: right; }
                        .inv-table th.c { text-align: center; }
                        .inv-table td { 
                            padding: 4px 2px; 
                            font-size: 8px; 
                            border-bottom: 1px dashed #ccc; 
                            vertical-align: top;
                        }
                        .inv-table td.num { text-align: right; }
                        .inv-table td.c { text-align: center; }
                        .inv-table tbody tr:last-child td { border-bottom: 0; }
                        .prod-name { 
                            font-weight: 700; 
                            color: #000; 
                            font-size: 8px;
                            margin-bottom: 1px;
                        }
                        .prod-code { 
                          font-size: 11px; 
                          color: #666; 
                          margin-top: 1px;
                        }
                        .row-wrap { 
                          margin-bottom: 4px;
                        }
                        .notes-panel { 
                            padding: 6px 0;
                            border-top: 1px dashed #000;
                            margin-bottom: 6px;
                        }
                        .notes-panel .block-label { 
                            margin-bottom: 2px;
                            color: #000;
                        }
                        .notes-body { 
                            font-size: 7px; 
                            color: #000; 
                            line-height: 1.4;
                        }
                        .sum-panel { 
                          padding: 4px 0;
                          border-top: 1px solid #000;
                        }
                        .sum-row { 
                            display: flex; 
                            justify-content: space-between; 
                            padding: 3px 0; 
                            font-size: 11px; 
                            color: #333; 
                            margin-top: 2px;
                            font-weight: 700;
                          }
                          .barcode {
                            font-size: 12px;
                            font-weight: 700;
                            letter-spacing: 1px;
                            text-align: center;
                            margin-top: 4px;
                          }
                        .sum-row.grand { 
                            border-top: 2px solid #000; 
                            margin-top: 4px; 
                            padding-top: 4px; 
                            font-size: 11px; 
                            font-weight: 800; 
                            color: #000;
                        }
                        .sum-row.ok { 
                            font-weight: 700; 
                            font-size: 9px; 
                            color: #000; 
                            margin-top: 3px;
                            padding-top: 3px;
                            border-top: 1px dashed #000;
                        }
                        .sum-row.due { 
                            font-weight: 700; 
                            color: #000;
                            font-size: 9px;
                        }
                        .sign-row { 
                            display: flex; 
                            justify-content: space-between; 
                            gap: 12px; 
                            margin-bottom: 8px;
                            margin-top: 12px;
                        }
                        .sign-box { 
                            flex: 1;
                            border-top: 1px dashed #000; 
                            padding-top: 4px; 
                            font-size: 6px; 
                            font-weight: 700; 
                            color: #000; 
                            text-transform: uppercase;
                            min-height: 20px;
                            text-align: center;
                        }
                        .legal { 
                            text-align: center; 
                            font-size: 6px; 
                            color: #000; 
                            font-weight: 500; 
                            line-height: 1.4; 
                            padding-top: 6px; 
                            border-top: 1px dashed #000;
                            margin: 0 -6px -10px;
                            padding-left: 6px;
                            padding-right: 6px;
                            padding-bottom: 8px;
                        }
                        .legal strong {
                            color: #000;
                            font-weight: 700;
                        }
                        @media print { 
                            body { 
                                background: #fff; 
                                padding: 0;
                                margin: 0;
                                width: 80mm;
                            } 
                            .sheet { 
                                box-shadow: none; 
                                border-radius: 0;
                                width: 80mm;
                                margin: 0;
                                page-break-after: auto;
                            } 
                            .inner { 
                                padding: 2mm 3mm;
                            }
                        }
                        @page {
                          margin: 0;
                          /* increased height to extend thermal receipt length */
                          size: 80mm 250mm;
                          marks: none;
                        }
                        @page :first {
                            margin-top: 0;
                        }
                    </style>
                </head>
                <body>
                    <div class="sheet">
                        <div class="strip"></div>
                        <div class="inner">
                            <div class="top">
                                <div style="font-size: 14px; font-weight: 800; text-transform: uppercase;">${storeName}</div>
                                <div style="font-size: 11px; margin-top: 4px;">Phone: ${resolvedContact}</div>
                                <div style="font-size: 11px;">Address: Street 10, Block C, Sector 4, APHS Rawalpindi</div>
                                <div style="margin-top: 8px;">
                                    <span style="font-size: 11px; font-weight: 800; background: #000; color: #fff; padding: 2px 6px; display: inline-block;"> ${
                                      sale.referenceNo || "—"
                                    }</span>
                                </div>
                                <div style="font-size: 9px; margin-top: 4px;">Date: ${new Date(
                                  sale.createdAt,
                                ).toLocaleString()}</div>
                            </div>

                            <!-- Remarks removed as requested -->

                            <table class="inv-table">
                                <thead>
                                    <tr>
                                        <th style="width: 50px">#</th>
                                        <th>Article description</th>
                                        <th class="c" style="width: 90px">Qty</th>
                                        ${
                                          !isChallan
                                            ? '<th class="num" style="width: 120px">Unit valuation</th><th class="num" style="width: 130px">Net amount</th>'
                                            : ""
                                        }
                                    </tr>
                                </thead>
                                <tbody>
                                    ${sale.items
                                      ?.map(
                                        (item: any, index: number) => `
                                                <tr>
                                                    <td style="color: #94a3b8; font-weight: 700; font-size: 13px;">${String(
                                                      index + 1,
                                                    ).padStart(2, "0")}</td>
                                                    <td>
                                                        <div class="prod-name">${
                                                          item.product?.name ||
                                                          "Item"
                                                        }</div>
                                                        <div class="prod-code">Serial/Code: ${
                                                          item.product
                                                            ?.barcode || "—"
                                                        }</div>
                                                    </td>
                                                    <td class="c" style="font-weight: 700; font-size: 10px; color: #000;">${
                                                      item.quantity
                                                    } ${
                                          item.unitType === "piece"
                                            ? item.product?.pieceName || "Kg"
                                            : item.product?.unitName || "Bore"
                                        }</td>
                                                    ${
                                                      !isChallan
                                                        ? `<td class="num" style="color: #000; font-weight: 600; font-size: 8px;">Rs. ${item.price.toLocaleString()}</td><td class="num" style="font-weight: 800; color: #000; font-size: 10px;">Rs. ${(
                                                            item.quantity *
                                                            item.price
                                                          ).toLocaleString()}</td>`
                                                        : ""
                                                    }
                                                </tr>
                                            `,
                                      )
                                      .join("")}
                                </tbody>
                            </table>

                            <div class="row-wrap">
                              ${
                                !isChallan
                                  ? `
                                <div class="sum-panel">
                                  <div class="sum-row"><span>Gross subtotal</span><span style="font-weight: 600;">Rs. ${sale.subtotal.toLocaleString()}</span></div>
                                  <div class="sum-row"><span>Campaign discount</span><span style="font-weight: 600; color: #dc2626;">- Rs. ${(
                                    sale.invoiceDiscount || 0
                                  ).toLocaleString()}</span></div>
                                  <div class="sum-row grand"><span>Total</span><span>Rs. ${sale.totalAmount.toLocaleString()}</span></div>
                                  <div class="sum-row ok"><span>Received PKR</span><span>Rs. ${sale.paidAmount.toLocaleString()}</span></div>
                                  <div class="sum-row due"><span>Outstanding</span><span>Rs. ${Math.max(
                                    0,
                                    sale.totalAmount - sale.paidAmount,
                                  ).toLocaleString()}</span></div>
                                </div>
                                `
                                  : ""
                              }
                            </div>
                            <div style="text-align:center;font-size:10px;margin-top:6px;color:#444;">Powered by iwiz solution | Contact: 03145372506</div>
                            <div style="height:30mm;"></div>
                            
                            <div style="height:6mm"></div>
                          </div>
                        </div>
                </body>
            </html>
        `;

    // Inject auto-print script for thermal receipts so pop-up prints immediately
    const printingHtml = html.replace(
      "</body>",
      `\n          <script>\n            window.onload = function() {\n              setTimeout(function() {\n                window.focus();\n                window.print();\n              }, 300);\n            };\n          </script>\n        </body>`,
    );

    const finalHtml = printingHtml;

    WindowPrt.document.open();
    WindowPrt.document.write(finalHtml);
    WindowPrt.document.close();
    WindowPrt.focus();
  };

  if (lastInvoice) {
    return (
      <>
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 dark:bg-slate-950 md:p-8">
          <Card className="w-full max-w-sm border-slate-200 text-center dark:border-slate-800 dark:bg-slate-900">
            <CardContent className="pt-8">
              <CheckCircle className="mx-auto mb-4 h-14 w-14 text-emerald-500 dark:text-emerald-400" />
              <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
                Sale Completed!
              </h2>
              <p className="mb-6 font-mono text-slate-500 dark:text-slate-400">
                #{lastInvoice.invoiceId}
              </p>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => handlePrint(lastInvoice)}
                  className="h-12 gap-2 bg-blue-600 font-semibold text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                  size="lg"
                >
                  <Printer className="h-5 w-5" /> Print Bill / Challan
                </Button>
                <Button
                  onClick={() => setLastInvoice(null)}
                  variant="outline"
                  className="h-12 border-slate-200 dark:border-slate-700"
                  size="lg"
                >
                  Return to POS
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        {renderModals()}
      </>
    );
  }

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden bg-slate-50/30 dark:bg-slate-950 w-full">
      {/* Top Navigation for POS */}
      <div className="bg-white dark:bg-slate-900 border-b px-6 py-3 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center",
              activeMode === "sale"
                ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600 border border-slate-200 dark:border-slate-600"
                : "text-slate-500 hover:text-slate-700",
            )}
            onClick={() => setActiveMode("sale")}
          >
            <ShoppingCart className="mr-2 h-4 w-4" /> NEW SALE
          </button>
          <button
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center",
              activeMode === "history"
                ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600 border border-slate-200 dark:border-slate-600"
                : "text-slate-500 hover:text-slate-700",
            )}
            onClick={() => setActiveMode("history")}
          >
            <History className="mr-2 h-4 w-4" /> SALES HISTORY
          </button>
        </div>

        {activeMode === "sale" && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-2">
                Search
              </span>
              <button
                onClick={() => setAllStoresSearch(false)}
                className={cn(
                  "px-3 py-1 rounded-md text-[11px] font-bold transition-all",
                  !allStoresSearch
                    ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600"
                    : "text-slate-500",
                )}
              >
                THIS STORE
              </button>
              <button
                onClick={() => setAllStoresSearch(true)}
                className={cn(
                  "px-3 py-1 rounded-md text-[11px] font-bold transition-all",
                  allStoresSearch
                    ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600"
                    : "text-slate-500",
                )}
              >
                ALL STORES
              </button>
            </div>
          </div>
        )}

        {activeMode === "history" && (
          <div className="flex items-center gap-2">
            <Input
              type="date"
              className="h-9 w-36"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              type="date"
              className="h-9 w-36"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <Button size="sm" onClick={fetchSales} className="h-9 px-4">
              Filter
            </Button>
            {(startDate || endDate) && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  fetchSales();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {activeMode === "sale" ? (
        <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden w-full">
          {/* Left side: Product Selection — 100% of available screen */}
          <div className="flex-1 min-w-0 min-h-0 flex flex-col p-4 md:p-6">
            <div className="relative group w-full shrink-0 mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none z-10" />
              <Input
                ref={barcodeRef}
                placeholder="Search by name or code, press Enter to add..."
                className="w-full pl-12 h-14 text-base rounded-2xl border border-slate-200 focus:border-blue-500/50 bg-slate-100/80 dark:bg-slate-800/80 dark:border-slate-700 dark:focus:border-blue-500/50"
                value={searchTerm}
                onChange={handleBarcodeChange}
                onKeyDown={handleSearchKeyDown}
                onBlur={() =>
                  setTimeout(() => setShowSearchDropdown(false), 200)
                }
                onFocus={() =>
                  searchTerm.length > 0 && setShowSearchDropdown(true)
                }
              />

              {/* Search Dropdown */}
              {showSearchDropdown && searchTerm && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-96 overflow-y-auto z-50">
                  {products
                    .filter(
                      (p) =>
                        p.name
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        (p.barcode &&
                          p.barcode
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())),
                    )
                    .slice(0, 10)
                    .map((product, index) => (
                      <button
                        key={product._id}
                        onClick={() => handleSelectProduct(product)}
                        className={cn(
                          "w-full px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700 last:border-0",
                          selectedSearchIndex === index &&
                            "bg-blue-50 dark:bg-slate-700",
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-slate-900 dark:text-white truncate">
                            {product.name}
                          </div>
                          {product.barcode && (
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              Code: {product.barcode}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                            Rs. {product.salePrice.toLocaleString()}
                          </div>
                          <div
                            className={cn(
                              "text-xs px-2 py-1 rounded",
                              product.totalStock > 10
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : product.totalStock > 0
                                ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                            )}
                          >
                            Stock:{" "}
                            {product.hasPieces
                              ? `${Math.floor(
                                  product.totalStock /
                                    (product.piecesPerBox || 1),
                                )} ${product.unitName || "Box"}${
                                  Math.floor(
                                    product.totalStock /
                                      (product.piecesPerBox || 1),
                                  ) !== 0
                                    ? "s"
                                    : ""
                                }${
                                  product.totalStock %
                                    (product.piecesPerBox || 1) >
                                  0
                                    ? `, ${
                                        product.totalStock %
                                        (product.piecesPerBox || 1)
                                      } ${product.pieceName || "Piece"}`
                                    : ""
                                }`
                              : product.totalStock}
                          </div>
                        </div>
                      </button>
                    ))}
                  {products.filter(
                    (p) =>
                      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (p.barcode &&
                        p.barcode
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase())),
                  ).length === 0 && (
                    <div className="px-4 py-6 text-center text-slate-500 dark:text-slate-400">
                      No products found
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto w-full">
              <div
                className="grid w-full auto-rows-fr gap-3 sm:gap-4"
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                }}
              >
                {products
                  .filter(
                    (p) =>
                      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (p.barcode &&
                        p.barcode
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase())),
                  )
                  .map((p) => (
                    <button
                      key={p._id}
                      type="button"
                      disabled={p.totalStock <= 0}
                      onClick={() => addToCart(p)}
                      className={cn(
                        "overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-sm transition-all duration-200 hover:border-blue-400 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-2 relative h-full flex flex-col",
                        p.totalStock <= 0 &&
                          "opacity-60 grayscale cursor-not-allowed hover:scale-100",
                      )}
                    >
                      {p.totalStock <= 0 && (
                        <div className="absolute top-2 right-2 z-10 bg-red-600 text-[10px] font-bold text-white px-2 py-0.5 rounded-full shadow-lg">
                          OUT OF STOCK
                        </div>
                      )}
                      {p.image ? (
                        <img
                          src={`http://localhost:5000${p.image}`}
                          alt={p.name}
                          className="h-36 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-36 w-full items-center justify-center border-b border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                          <Package className="h-14 w-14 text-slate-300 dark:text-slate-600" />
                        </div>
                      )}
                      <div className="p-3 flex-1 flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">
                              {p.name}
                            </h3>
                            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                              {p.category || p.description || "—"}
                            </p>
                            {p.store && (
                              <p className="text-[10px] font-bold text-blue-500 uppercase mt-1">
                                {p.store.name}
                              </p>
                            )}
                          </div>
                          <span className="shrink-0 rounded-full bg-blue-500 px-2.5 py-0.5 text-xs font-bold text-white min-w-[1.75rem] text-center">
                            {p.hasPieces
                              ? `${Math.floor(
                                  p.totalStock / (p.piecesPerBox || 1),
                                )} ${p.unitName || "Box"}${
                                  Math.floor(
                                    p.totalStock / (p.piecesPerBox || 1),
                                  ) !== 0
                                    ? "s"
                                    : ""
                                }${
                                  p.totalStock % (p.piecesPerBox || 1) > 0
                                    ? ` & ${
                                        p.totalStock % (p.piecesPerBox || 1)
                                      } ${p.pieceName || "Piece"}`
                                    : ""
                                }`
                              : p.totalStock}
                          </span>
                        </div>
                        <div className="mt-2 flex items-baseline justify-between gap-2">
                          <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                            Rs. {Number(p.salePrice).toLocaleString()}
                          </span>
                          <span className="text-xs text-slate-400 line-through dark:text-slate-500">
                            Rs. {Number(p.costPrice).toLocaleString()}
                          </span>
                        </div>
                        <p className="mt-1.5 truncate text-xs text-slate-500 dark:text-slate-400">
                          Barcode: {p.barcode || "N/A"}
                        </p>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {/* Right side: Cart & Checkout — same card/label style as other pages */}
          <div className="flex w-full flex-col shrink-0 overflow-hidden border-l border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 lg:w-[420px]">
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 md:p-6">
              {/* Transaction details card */}
              <Card className="shrink-0 border-slate-200 dark:border-slate-800 dark:bg-slate-900">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                    <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Transaction
                  </CardTitle>
                  <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Customer/Retailer and reference
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="retailer-search"
                      className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                    >
                      Retailer (for wholesale sales)
                    </Label>
                    {selectedRetailer ? (
                      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-purple-50/50 px-3 py-2 dark:border-slate-700 dark:bg-purple-900/20">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                              {selectedRetailer.name}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {selectedRetailer.contact}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={() => {
                            setSelectedRetailer(null);
                            setRetailerSearch("");
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="relative">
                        <Input
                          id="retailer-search"
                          placeholder="Search retailer by name or contact..."
                          className="h-10 dark:bg-slate-800/50 dark:border-slate-700"
                          value={retailerSearch}
                          onChange={(e) => {
                            setRetailerSearch(e.target.value);
                            if (e.target.value.length > 2)
                              fetchRetailers(e.target.value);
                          }}
                        />
                        {retailers.length > 0 && (
                          <div className="absolute top-full left-0 z-50 mt-1 max-h-40 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
                            {retailers.map((r) => (
                              <button
                                key={r._id}
                                type="button"
                                className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700"
                                onClick={() => {
                                  setSelectedRetailer(r);
                                  setSelectedCustomer(null); // Clear customer when retailer is selected
                                  setCustomerName(r.name || "");
                                  setCustomerPhone(r.contact || "");
                                  setCustomerAddress(r.address || "");
                                  setRetailerSearch("");
                                  setCustomerSearch("");
                                  setRetailers([]);
                                  setCustomers([]);
                                }}
                              >
                                <p className="font-medium text-slate-900 dark:text-white">
                                  {r.name}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {r.contact}{" "}
                                  {r.bankName ? `• ${r.bankName}` : ""}
                                </p>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="customer-search"
                      className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                    >
                      Customer (optional)
                    </Label>
                    {selectedCustomer ? (
                      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-blue-50/50 px-3 py-2 dark:border-slate-700 dark:bg-blue-900/20">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                              {selectedCustomer.name}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {selectedCustomer.phone}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={() => setSelectedCustomer(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="relative">
                        <Input
                          id="customer-search"
                          placeholder="Search by phone..."
                          className="h-10 dark:bg-slate-800/50 dark:border-slate-700"
                          value={customerSearch}
                          onChange={(e) => {
                            setCustomerSearch(e.target.value);
                            if (e.target.value.length > 2)
                              fetchCustomers(e.target.value);
                          }}
                        />
                        {customers.length > 0 && (
                          <div className="absolute top-full left-0 z-50 mt-1 max-h-40 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
                            {customers.map((c) => (
                              <button
                                key={c._id}
                                type="button"
                                className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700"
                                onClick={() => handleCustomerSelection(c)}
                              >
                                <p className="font-medium text-slate-900 dark:text-white">
                                  {c.name}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {c.phone}
                                </p>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="customerName"
                      className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                    >
                      Customer Name
                    </Label>
                    <Input
                      id="customerName"
                      placeholder="Enter customer name"
                      className="h-9 dark:bg-slate-800/50 dark:border-slate-700"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label
                        htmlFor="customerPhone"
                        className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                      >
                        Phone Number
                      </Label>
                      <Input
                        id="customerPhone"
                        placeholder="Enter phone number"
                        className="h-9 dark:bg-slate-800/50 dark:border-slate-700"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="customerAddress"
                        className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                      >
                        Address
                      </Label>
                      <Input
                        id="customerAddress"
                        placeholder="Enter address"
                        className="h-9 dark:bg-slate-800/50 dark:border-slate-700"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label
                        htmlFor="referenceNo"
                        className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                      >
                        Reference No.
                      </Label>
                      <Input
                        id="referenceNo"
                        placeholder="Optional"
                        className="h-9 dark:bg-slate-800/50 dark:border-slate-700"
                        value={referenceNo}
                        onChange={(e) => setReferenceNo(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="remarks"
                        className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                      >
                        Remarks
                      </Label>
                      <Input
                        id="remarks"
                        placeholder="Optional"
                        className="h-9 dark:bg-slate-800/50 dark:border-slate-700"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                      />
                    </div>
                  </div>
                  {(selectedCustomer ||
                    selectedRetailer ||
                    customerName ||
                    customerPhone ||
                    customerAddress) && (
                    <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {selectedRetailer
                          ? "Retailer Details Preview"
                          : "Customer Details Preview"}
                      </Label>
                      <div className="space-y-1 text-sm">
                        {(customerName ||
                          selectedCustomer?.name ||
                          selectedRetailer?.name) && (
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {customerName ||
                              selectedCustomer?.name ||
                              selectedRetailer?.name}
                          </p>
                        )}
                        {(customerPhone ||
                          selectedCustomer?.phone ||
                          selectedRetailer?.contact) && (
                          <p className="text-slate-600 dark:text-slate-400">
                            📞{" "}
                            {customerPhone ||
                              selectedCustomer?.phone ||
                              selectedRetailer?.contact}
                          </p>
                        )}
                        {(customerAddress ||
                          selectedCustomer?.address ||
                          selectedRetailer?.address) && (
                          <p className="text-slate-600 dark:text-slate-400">
                            📍{" "}
                            {customerAddress ||
                              selectedCustomer?.address ||
                              selectedRetailer?.address}
                          </p>
                        )}
                        {selectedRetailer && (
                          <>
                            {selectedRetailer.bankName && (
                              <p className="text-slate-600 dark:text-slate-400">
                                🏦 Bank: {selectedRetailer.bankName}
                              </p>
                            )}
                            {selectedRetailer.bankAccount && (
                              <p className="text-slate-600 dark:text-slate-400">
                                💳 Account: {selectedRetailer.bankAccount}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Cart card */}
              <Card className="flex min-h-0 flex-1 flex-col overflow-hidden border-slate-200 dark:border-slate-800 dark:bg-slate-900">
                <CardHeader className="shrink-0 pb-3">
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                    Cart
                  </CardTitle>
                  <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {cart.length === 0
                      ? "Add products from the catalog"
                      : `${cart.length} item(s)`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="min-h-0 flex-1 overflow-y-auto p-0">
                  {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 py-12 dark:border-slate-700">
                      <ShoppingCart className="mb-3 h-12 w-12 text-slate-300 dark:text-slate-600" />
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        No items yet.
                      </p>
                      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                        Tap a product to add to cart.
                      </p>
                    </div>
                  ) : (
                    <ul className="space-y-3 p-4 pt-0">
                      {cart.map((item) => (
                        <li
                          key={item._id}
                          className={cn(
                            "flex gap-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800/50 transition-all duration-300",
                            scannedItem === item._id &&
                              "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.02]",
                          )}
                        >
                          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                            {item.image ? (
                              <img
                                src={`http://localhost:5000${item.image}`}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Package className="h-6 w-6 text-slate-300 dark:text-slate-600" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                                {item.name}
                              </p>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 shrink-0 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                                onClick={() => removeFromCart(item._id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Rs.{" "}
                                {(item.unitType === "box"
                                  ? item.salePrice
                                  : item.pieceSalePrice || item.salePrice
                                ).toLocaleString()}{" "}
                                /
                                {item.unitType === "box"
                                  ? ` ${item.unitName || "box"}`
                                  : ` ${item.pieceName || "piece"}`}
                              </p>
                              {item.hasPieces && (
                                <div className="flex flex-col gap-1">
                                  <button
                                    onClick={() => toggleUnit(item._id)}
                                    className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-300 uppercase w-fit"
                                  >
                                    Switch to{" "}
                                    {item.unitType === "box"
                                      ? item.pieceName || "Piece"
                                      : item.unitName || "Box"}
                                  </button>
                                  <p className="text-[9px] text-slate-400 dark:text-slate-500 italic">
                                    (1 {item.unitName || "Box"} ={" "}
                                    {item.piecesPerBox}{" "}
                                    {item.pieceName || "Kg/Piece"})
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7"
                                  onClick={() =>
                                    updateQuantity(item._id, item.quantity - 1)
                                  }
                                >
                                  −
                                </Button>
                                <input
                                  type="number"
                                  step="any"
                                  className="w-16 bg-transparent text-center text-xs font-bold outline-none border-b border-transparent focus:border-blue-500"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    updateQuantity(
                                      item._id,
                                      parseFloat(e.target.value) || 0,
                                    )
                                  }
                                />
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7"
                                  onClick={() =>
                                    updateQuantity(item._id, item.quantity + 1)
                                  }
                                >
                                  +
                                </Button>
                              </div>
                              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                Rs.{" "}
                                {(
                                  (item.unitType === "box"
                                    ? item.salePrice
                                    : item.pieceSalePrice || item.salePrice) *
                                  item.quantity
                                ).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              {/* Summary card */}
              <Card className="shrink-0 border-slate-200 dark:border-slate-800 dark:bg-slate-900">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                    Payment summary
                  </CardTitle>
                  <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Subtotal, discount and amount received
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Subtotal
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      Rs. {subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="discount"
                      className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                    >
                      Discount (Rs.)
                    </Label>
                    <Input
                      id="discount"
                      type="number"
                      className="h-10 dark:bg-slate-800/50 dark:border-slate-700"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                    />
                  </div>
                  <div className="flex items-baseline justify-between border-t border-slate-200 pt-4 dark:border-slate-700">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Grand total
                    </span>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      Rs. {total.toLocaleString()}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="paid"
                      className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                    >
                      {selectedRetailer
                        ? "Initial Payment (PKR)"
                        : "Amount received (PKR)"}
                    </Label>
                    <Input
                      id="paid"
                      type="number"
                      placeholder={total.toString()}
                      className="h-12 text-lg font-semibold dark:bg-slate-800/50 dark:border-slate-700"
                      value={paidAmount || ""}
                      onChange={(e) => setPaidAmount(Number(e.target.value))}
                    />
                    {selectedRetailer && (
                      <div className="mt-2 rounded-lg border border-slate-200 bg-purple-50/50 p-3 dark:border-slate-700 dark:bg-purple-900/20">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Remaining Debit:
                          </span>
                          <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                            Rs. {(total - (paidAmount || 0)).toLocaleString()}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Sale: Rs. {total.toLocaleString()} - Initial Payment:
                          Rs. {(paidAmount || 0).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Payment Method
                    </Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-100"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 font-semibold text-orange-600 border-orange-200 hover:bg-orange-50 dark:border-orange-900/50 dark:text-orange-400 dark:hover:bg-orange-900/20"
                      onClick={handleHoldBill}
                      disabled={cart.length === 0}
                    >
                      Hold Bill
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 font-semibold text-blue-600 border-blue-200 hover:bg-blue-50 dark:border-blue-900/50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                      onClick={() => setShowParkedModal(true)}
                    >
                      Resume ({parkedSales.length})
                    </Button>
                  </div>

                  <Button
                    className="w-full gap-2 bg-blue-600 font-semibold text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 mt-2"
                    size="lg"
                    disabled={cart.length === 0 || loading}
                    onClick={handleCheckout}
                  >
                    {loading ? "Processing..." : "Complete sale & print"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto bg-slate-50 p-6 dark:bg-slate-950 md:p-8">
          <div className="mx-auto max-w-6xl space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white">
                  <History className="h-8 w-8 text-blue-600 dark:text-blue-400" />{" "}
                  Sales History
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  View and print past invoices.
                </p>
              </div>
            </div>

            <Card className="overflow-hidden border-slate-200 dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white">
                  Historical Sales Data
                </CardTitle>
                <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Invoice ID, customer and amount
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase text-xs font-bold">
                      <tr>
                        <th className="rounded-l-lg px-4 py-3">ID</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Customer</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="rounded-r-lg px-4 py-3 text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {sales.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-4 py-8 text-center italic text-slate-400"
                          >
                            No sales found.
                          </td>
                        </tr>
                      ) : (
                        sales.map((sale) => (
                          <tr
                            key={sale._id}
                            className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                          >
                            <td className="px-4 py-3 font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
                              {sale.invoiceId}
                              {sale.referenceNo && (
                                <span className="block text-[10px] font-normal text-slate-400">
                                  Ref: {sale.referenceNo}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                              {formatDateTimeSafe(sale.createdAt)}
                            </td>
                            <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                              {sale.customerName ||
                                sale.customer?.name ||
                                "Walk-in"}
                            </td>
                            <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                              Rs. {sale.totalAmount.toLocaleString()}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={cn(
                                  "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase",
                                  sale.paymentStatus === "paid"
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                    : sale.paymentStatus === "partial"
                                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                                )}
                              >
                                {sale.paymentStatus}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-2">
                                {userRole === "admin" && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    title="Edit Details"
                                    className="h-9 w-9 text-slate-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
                                    onClick={() => handleEditMetadata(sale)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 text-blue-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
                                  onClick={() => handlePrint(sale)}
                                >
                                  <Printer className="h-4 w-4" />
                                </Button>
                                {userRole === "admin" && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                                    onClick={() => handleVoid(sale._id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
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
        </div>
      )}
      {renderModals()}
    </div>
  );

  function renderModals() {
    return (
      <>
        {/* Print Options Modal — Advanced Print Controller */}
        {showPrintModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-y-auto">
            <Card className="w-full max-w-2xl my-8 shadow-xl border border-slate-200 dark:border-slate-800 rounded-xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              <CardHeader className="border-b border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-3 text-lg font-bold text-slate-900 dark:text-white">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40">
                        <Settings2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      Advanced Print Controller
                    </CardTitle>
                    <CardDescription className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">
                      Configure store header and document type before printing
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPrintModal(false)}
                    className="h-9 w-9 shrink-0 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 md:p-8 bg-slate-50/50 dark:bg-slate-900/30 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* 1. Store Branding */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-0.5 rounded-full bg-blue-600" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        1. Store Branding
                      </span>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/50 space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Load Header Preset
                        </Label>
                        <select
                          className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                          onChange={(e) => {
                            const s = stores.find(
                              (st) => st._id === e.target.value,
                            );
                            if (s) setSelectedPrintStore({ ...s });
                          }}
                          value={selectedPrintStore?._id || ""}
                        >
                          {stores.map((s) => (
                            <option key={s._id} value={s._id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Edit Business Identity
                        </Label>
                        <Input
                          value={selectedPrintStore?.name || ""}
                          onChange={(e) =>
                            setSelectedPrintStore({
                              ...selectedPrintStore,
                              name: e.target.value,
                            })
                          }
                          className="h-10 rounded-lg border-slate-200 dark:bg-slate-800 dark:border-slate-600"
                          placeholder="Store name"
                        />
                        <Input
                          value={selectedPrintStore?.contactNumber || ""}
                          onChange={(e) =>
                            setSelectedPrintStore({
                              ...selectedPrintStore,
                              contactNumber: e.target.value,
                            })
                          }
                          className="h-10 rounded-lg border-slate-200 dark:bg-slate-800 dark:border-slate-600"
                          placeholder="Contact number"
                        />
                        <Input
                          value={selectedPrintStore?.location || ""}
                          onChange={(e) =>
                            setSelectedPrintStore({
                              ...selectedPrintStore,
                              location: e.target.value,
                            })
                          }
                          className="h-10 rounded-lg border-slate-200 dark:bg-slate-800 dark:border-slate-600"
                          placeholder="Business location"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. Document Mode */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-0.5 rounded-full bg-blue-600" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        2. Document Mode
                      </span>
                    </div>
                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={() => setIsChallan(false)}
                        className={cn(
                          "w-full rounded-xl border-2 p-4 text-left transition-all flex items-center justify-between gap-4",
                          !isChallan
                            ? "border-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:border-blue-600"
                            : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600",
                        )}
                      >
                        <div>
                          <p
                            className={cn(
                              "font-semibold text-sm",
                              !isChallan
                                ? "text-blue-700 dark:text-blue-300"
                                : "text-slate-900 dark:text-white",
                            )}
                          >
                            INVOICE WITH PRICE
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Include full pricing & financial totals
                          </p>
                        </div>
                        {!isChallan && (
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600">
                            <CheckCircle className="h-3.5 w-3.5 text-white" />
                          </div>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsChallan(true)}
                        className={cn(
                          "w-full rounded-xl border-2 p-4 text-left transition-all flex items-center justify-between gap-4",
                          isChallan
                            ? "border-orange-600 bg-orange-50 dark:bg-orange-950/40 dark:border-orange-600"
                            : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600",
                        )}
                      >
                        <div>
                          <p
                            className={cn(
                              "font-semibold text-sm",
                              isChallan
                                ? "text-orange-700 dark:text-orange-300"
                                : "text-slate-900 dark:text-white",
                            )}
                          >
                            QUOTATION WITHOUT PRICE
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Document without financial data
                          </p>
                        </div>
                        {isChallan && (
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-600">
                            <CheckCircle className="h-3.5 w-3.5 text-white" />
                          </div>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* 3. Print Format */}
                  <div className="space-y-4 md:col-span-2">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-0.5 rounded-full bg-blue-600" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        3. Print Format
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPrintFormat("thermal")}
                        className={cn(
                          "w-full rounded-xl border-2 p-4 text-left transition-all flex items-center justify-between gap-4",
                          printFormat === "thermal"
                            ? "border-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:border-blue-600"
                            : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600",
                        )}
                      >
                        <div>
                          <p
                            className={cn(
                              "font-semibold text-sm",
                              printFormat === "thermal"
                                ? "text-blue-700 dark:text-blue-300"
                                : "text-slate-900 dark:text-white",
                            )}
                          >
                            80MM THERMAL RECEIPT
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Compact format for thermal printers
                          </p>
                        </div>
                        {printFormat === "thermal" && (
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600">
                            <CheckCircle className="h-3.5 w-3.5 text-white" />
                          </div>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setPrintFormat("a4")}
                        className={cn(
                          "w-full rounded-xl border-2 p-4 text-left transition-all flex items-center justify-between gap-4",
                          printFormat === "a4"
                            ? "border-green-600 bg-green-50 dark:bg-green-950/40 dark:border-green-600"
                            : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600",
                        )}
                      >
                        <div>
                          <p
                            className={cn(
                              "font-semibold text-sm",
                              printFormat === "a4"
                                ? "text-green-700 dark:text-green-300"
                                : "text-slate-900 dark:text-white",
                            )}
                          >
                            A4 INVOICE/ESTIMATE
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Professional format for A4 paper
                          </p>
                        </div>
                        {printFormat === "a4" && (
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-600">
                            <CheckCircle className="h-3.5 w-3.5 text-white" />
                          </div>
                        )}
                      </button>
                    </div>

                    <div className="rounded-lg bg-slate-800 px-4 py-3 dark:bg-slate-800">
                      <p className="text-xs text-slate-300 dark:text-slate-400 leading-relaxed">
                        Note: Header overrides are session-based. For permanent
                        changes to store info, visit the Store Management
                        console.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center gap-4 border-t border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900 shrink-0">
                <Button
                  variant="ghost"
                  onClick={() => setShowPrintModal(false)}
                  className="font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (printFormat === "thermal") {
                      triggerPrint(printingSale, {
                        isChallan,
                        customStore: selectedPrintStore,
                        hidePrice: !printWithPrice,
                      });
                    } else {
                      printA4Format(printingSale, {
                        isChallan,
                        customStore: selectedPrintStore,
                      });
                    }
                    setShowPrintModal(false);
                  }}
                  className={cn(
                    "gap-2 px-6 h-11 font-semibold rounded-lg shadow-sm",
                    printFormat === "a4"
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : isChallan
                      ? "bg-orange-600 hover:bg-orange-700 text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white",
                  )}
                >
                  <Printer className="h-5 w-5" />
                  {printFormat === "a4"
                    ? "Print A4"
                    : isChallan
                    ? "Print Challan"
                    : "Print Invoice"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* Edit Details Modal */}
        {/* Parked Sales Modal */}
        {showParkedModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <Card className="w-full max-w-lg shadow-2xl border-none overflow-hidden rounded-3xl">
              <CardHeader className="bg-slate-900 text-white p-6 flex flex-row items-center justify-between">
                <CardTitle className="font-bold">Resume Parked Bill</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowParkedModal(false)}
                  className="text-white hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </Button>
              </CardHeader>
              <CardContent className="p-6 max-h-[60vh] overflow-y-auto">
                {parkedSales.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">
                    No parked bills.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {parkedSales.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-4 border rounded-xl hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50 cursor-pointer"
                        onClick={() => handleResumeBill(p)}
                      >
                        <div>
                          <p className="font-bold text-sm">
                            {p.customerName ||
                              p.selectedCustomer?.name ||
                              "Walk-in Customer"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(p.time).toLocaleTimeString()} -{" "}
                            {p.cart.length} items
                          </p>
                        </div>
                        <Button size="sm" variant="outline">
                          Resume
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {showEditModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <Card className="w-full max-w-lg shadow-2xl border-none overflow-hidden rounded-3xl">
              <CardHeader className="bg-slate-900 text-white p-6">
                <CardTitle className="flex items-center gap-2 font-black tracking-tighter uppercase italic">
                  <Pencil className="h-5 w-5 text-blue-400" />
                  Synchronize Metadata
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      Client Identity / Name
                    </Label>
                    <Input
                      value={editFormData.customerName}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          customerName: e.target.value,
                        })
                      }
                      className="h-12 font-black border-2 focus:border-blue-500 rounded-xl"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-400">
                        Communication (Phone)
                      </Label>
                      <Input
                        value={editFormData.customerPhone}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            customerPhone: e.target.value,
                          })
                        }
                        className="h-12 font-bold border-2 focus:border-blue-500 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-400">
                        Control Reference
                      </Label>
                      <Input
                        value={editFormData.referenceNo}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            referenceNo: e.target.value,
                          })
                        }
                        className="h-12 font-mono border-2 focus:border-blue-500 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400">
                      Logistics (Address)
                    </Label>
                    <Input
                      value={editFormData.customerAddress}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          customerAddress: e.target.value,
                        })
                      }
                      className="h-12 border-2 focus:border-blue-500 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400">
                      Sale Date & Time
                    </Label>
                    <Input
                      type="datetime-local"
                      value={editFormData.saleDate}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          saleDate: e.target.value,
                        })
                      }
                      className="h-12 border-2 focus:border-blue-500 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400">
                      Transaction Remarks
                    </Label>
                    <Input
                      value={editFormData.remarks}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          remarks: e.target.value,
                        })
                      }
                      className="h-12 italic border-2 focus:border-blue-500 rounded-xl"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-3 px-8 pb-8">
                <Button
                  variant="ghost"
                  onClick={() => setShowEditModal(false)}
                  className="font-bold"
                >
                  Discard
                </Button>
                <Button
                  onClick={saveMetadata}
                  disabled={loading}
                  className="bg-slate-900 hover:bg-black text-white px-10 h-12 font-black uppercase tracking-widest shadow-xl rounded-xl"
                >
                  {loading ? "Updating..." : "Commit Changes"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </>
    );
  }
}
