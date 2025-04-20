import DataTable from '../../components/dashboard/DataTable';
import { ArrowDownTrayIcon as DocumentDownloadIcon } from '@heroicons/react/24/outline';
import { ArrowPathIcon } from '@heroicons/react/24/solid';
import { useApp } from '../../context/AppContext';
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import axios from 'axios';
import { BILLING_SERVICE_URL } from '../../../constants';
import { useAuth } from '../../context/AuthContext';

const Invoices = () => {
  const { invoices, getUserById, loadingInvoices } = useApp();
  const { token } = useAuth();
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState(null);
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  const handleDownloadInvoice = async (invoiceId) => {
    try {
      // Show loading state for this specific invoice
      setDownloadingInvoiceId(invoiceId);
      
      // Make API request to download the PDF with responseType blob
      const response = await axios.get(`${BILLING_SERVICE_URL}/api/invoices/admin/download/${invoiceId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        responseType: 'blob', // Important: tells axios to handle the response as binary data
      });
      
      // With axios, we can directly use the response.data as the blob
      const blob = new Blob([response.data]);
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoiceId}.pdf`);
      
      // Append to the document, click it, and remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL object
      window.URL.revokeObjectURL(url);
      
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice');
    } finally {
      setDownloadingInvoiceId(null);
    }
  }

  const columns = [
    { key: 'invoice_number', label: 'Invoice ID' },
    { label: 'Customer', render: (invoice) => {
      const customer = getUserById(invoice.subscription.user_id);
      return customer.firstName + ' ' + customer.lastName;
    } },
    { key: 'amount', label: 'Amount', render: (invoice) => {
      return invoice.amount;
    } },
    { 
      key: 'status', 
      label: 'Status',
      render: (invoice) => {
        let statusClass = '';
        switch(invoice.status) {
          case 'Paid':
            statusClass = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            break;
          case 'Pending':
            statusClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            break;
          case 'Overdue':
            statusClass = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            break;
          default:
            statusClass = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${statusClass}`}>
            {invoice.status}
          </span>
        );
      }
    },
    { key: 'paid_at', label: 'Paid At', render: (invoice) => {
      return formatDate(invoice.paid_at);
    } },
    {
      key: 'actions',
      label: 'Actions',
      render: (invoice) => (
        <div className="flex space-x-2">
          {invoice.status === 'paid' && (
            <button 
              className="text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400 relative"
              aria-label={`Download invoice ${invoice.id}`}
              onClick={() => handleDownloadInvoice(invoice.id)}
              disabled={downloadingInvoiceId === invoice.id}
            >
              {downloadingInvoiceId === invoice.id ? (
                <div className="relative">
                  <ArrowPathIcon className="h-5 w-5 animate-spin text-primary-500" />
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                  </span>
                </div>
              ) : (
                <DocumentDownloadIcon className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Invoices</h1>
      </div>
      
      <DataTable 
        columns={columns} 
        data={invoices} 
        title="All Invoices" 
        pagination={true}
        itemsPerPage={8}
        loading={loadingInvoices}
      />
    </div>
  );
};

export default Invoices; 