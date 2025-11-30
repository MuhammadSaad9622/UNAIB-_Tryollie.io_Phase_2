import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import APIService from "../lib/api";
import { FileText, Eye, Download, ArrowLeft, Calendar, DollarSign, CreditCard } from "lucide-react";
import { Button } from "../components/ui/Button";

interface Invoice {
  _id: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: string;
  dueDate: string;
  paidDate?: string;
  createdAt: string;
  items: Array<{
    description: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  notes?: string;
}

const InvoicesPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoices();
    
    // Check for payment success/cancel from URL params
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("success") === "true") {
      const invoiceId = urlParams.get("invoiceId");
      showToast("Payment successful! Your invoice has been paid.", "success");
      // Clean URL
      window.history.replaceState({}, "", "/invoices");
      if (invoiceId) {
        fetchInvoices(); // Refresh to show updated status
      }
    }
    if (urlParams.get("canceled") === "true") {
      showToast("Payment was canceled.", "warning");
      window.history.replaceState({}, "", "/invoices");
    }
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await APIService.getInvoices();
      setInvoices(response.data || []);
    } catch (error: any) {
      console.error("Error fetching invoices:", error);
      showToast("Failed to load invoices", "error");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "sent":
      case "unpaid":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200";
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "cancelled":
        return "bg-gray-100 text-gray-600 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    if (filter === "all") return true;
    return invoice.status === filter;
  });

  const handlePayInvoice = async (invoice: Invoice) => {
    if (!confirm(`Pay invoice ${invoice.invoiceNumber} for $${invoice.amount.toFixed(2)}?`)) {
      return;
    }

    try {
      setProcessingPayment(invoice._id);
      const response = await APIService.payInvoice(invoice._id);
      
      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error("No payment URL received");
      }
    } catch (error: any) {
      console.error("Error initiating payment:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to initiate payment";
      showToast(errorMessage, "error");
      setProcessingPayment(null);
    }
  };

  const handleDownload = (invoice: Invoice) => {
    // Create a simple text invoice for download
    const invoiceText = `
INVOICE
${invoice.invoiceNumber}

Date: ${new Date(invoice.createdAt).toLocaleDateString()}
Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}
Status: ${invoice.status.toUpperCase()}

Items:
${invoice.items.map((item) => 
  `${item.description} - Qty: ${item.quantity} x $${item.price.toFixed(2)} = $${item.total.toFixed(2)}`
).join("\n")}

Total: $${invoice.amount.toFixed(2)} ${invoice.currency.toUpperCase()}
${invoice.paidDate ? `Paid Date: ${new Date(invoice.paidDate).toLocaleDateString()}` : ""}
${invoice.notes ? `Notes: ${invoice.notes}` : ""}
    `.trim();

    const blob = new Blob([invoiceText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${invoice.invoiceNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold text-gray-900">My Invoices</h1>
              <p className="mt-2 text-gray-600">
                View and manage all your invoices
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => navigate("/billing")}
            >
              Manage Subscription
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex space-x-2 border-b border-gray-200">
            {["all", "paid", "unpaid", "overdue", "sent", "draft"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                  filter === status
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Invoices List */}
        {filteredInvoices.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No invoices found</h3>
            <p className="text-gray-600 mb-6">
              {filter === "all"
                ? "You don't have any invoices yet."
                : `No ${filter} invoices found.`}
            </p>
            <Button
              variant="primary"
              onClick={() => navigate("/billing")}
            >
              View Subscription Plans
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInvoices.map((invoice) => (
              <div
                key={invoice._id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {invoice.invoiceNumber}
                      </h3>
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                          invoice.status
                        )}`}
                      >
                        {invoice.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="h-4 w-4 mr-2" />
                        <span className="font-medium text-gray-900">
                          ${invoice.amount.toFixed(2)} {invoice.currency.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>
                          Due: {new Date(invoice.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                      {invoice.paidDate && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>
                            Paid: {new Date(invoice.paidDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>
                          Created: {new Date(invoice.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {invoice.status !== "paid" && invoice.status !== "cancelled" && (
                      <button
                        onClick={() => handlePayInvoice(invoice)}
                        disabled={processingPayment === invoice._id}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center space-x-2 ${
                          processingPayment === invoice._id
                            ? "bg-gray-400 text-white cursor-wait"
                            : "bg-green-600 text-white hover:bg-green-700"
                        }`}
                        title="Pay Invoice"
                      >
                        <CreditCard className="h-4 w-4" />
                        <span>{processingPayment === invoice._id ? "Processing..." : "Pay"}</span>
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedInvoice(invoice)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDownload(invoice)}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      title="Download Invoice"
                    >
                      <Download className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Invoice Details Modal */}
        {selectedInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Invoice Details</h2>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Invoice Number</p>
                    <p className="text-lg font-semibold">{selectedInvoice.invoiceNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(
                        selectedInvoice.status
                      )}`}
                    >
                      {selectedInvoice.status}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Amount</p>
                    <p className="text-lg font-semibold">
                      ${selectedInvoice.amount.toFixed(2)} {selectedInvoice.currency.toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Due Date</p>
                    <p className="text-lg">
                      {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {selectedInvoice.paidDate && (
                  <div>
                    <p className="text-sm text-gray-600">Paid Date</p>
                    <p className="text-lg">
                      {new Date(selectedInvoice.paidDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600 mb-2">Items</p>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                            Description
                          </th>
                          <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">
                            Qty
                          </th>
                          <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">
                            Price
                          </th>
                          <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedInvoice.items.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm">{item.description}</td>
                            <td className="px-4 py-2 text-sm text-center">{item.quantity}</td>
                            <td className="px-4 py-2 text-sm text-right">
                              ${item.price.toFixed(2)}
                            </td>
                            <td className="px-4 py-2 text-sm text-right font-medium">
                              ${item.total.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan={3} className="px-4 py-2 text-sm font-medium text-right">
                            Total:
                          </td>
                          <td className="px-4 py-2 text-sm font-bold text-right">
                            ${selectedInvoice.amount.toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
                {selectedInvoice.notes && (
                  <div>
                    <p className="text-sm text-gray-600">Notes</p>
                    <p className="text-gray-900">{selectedInvoice.notes}</p>
                  </div>
                )}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  {selectedInvoice.status !== "paid" && selectedInvoice.status !== "cancelled" && (
                    <button
                      onClick={() => {
                        setSelectedInvoice(null);
                        handlePayInvoice(selectedInvoice);
                      }}
                      disabled={processingPayment === selectedInvoice._id}
                      className={`px-4 py-2 rounded-lg font-medium flex items-center ${
                        processingPayment === selectedInvoice._id
                          ? "bg-gray-400 text-white cursor-wait"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      {processingPayment === selectedInvoice._id ? "Processing..." : "Pay Invoice"}
                    </button>
                  )}
                  <button
                    onClick={() => handleDownload(selectedInvoice)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Invoice
                  </button>
                  <button
                    onClick={() => setSelectedInvoice(null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoicesPage;

