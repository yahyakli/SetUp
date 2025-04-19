import DataTable from '../../components/dashboard/DataTable';
import { EyeIcon, ArrowDownTrayIcon as DocumentDownloadIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useApp } from '../../context/AppContext';
import axios from 'axios';
import { BILLING_SERVICE_URL } from '../../../constants';

const Invoices = () => {
  const { invoices, getUserById, loadingInvoices } = useApp();
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  const handleDownloadInvoice = async (invoiceId) => {
    try {
      const response = await axios.get(`${BILLING_SERVICE_URL}/api/invoices/admin/download/${invoiceId}`);
      console.log(response);
    } catch (error) {
      console.error('Error downloading invoice:', error);
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
          <button 
            className="text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400"
            aria-label={`Download invoice ${invoice.id}`}
            onClick={() => handleDownloadInvoice(invoice.id)}
          >
            <DocumentDownloadIcon className="h-5 w-5" />
          </button>
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