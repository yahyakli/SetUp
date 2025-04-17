"use client";

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  CreditCard,
  Download,
  FileText,
  Filter,
  Search,
  SortAsc,
  SortDesc,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import axios from 'axios';

import AppLayout from '@/app/AppLayout';
import ClientSideWrapper from '@/components/ClientSideWrapper';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

import { RootState } from '@/lib/store';
import { Invoice } from '@/types';
import { BILLING_SERVICE_URL } from '@/constants/API_URLS';
import { useAppContext } from '@/context/AppContext';

function BillingHistoryContent() {
  const router = useRouter();
  const { user, token } = useSelector((state: RootState) => state.user);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { userPermissions } = useAppContext();

  // Get current subscription from the most recent invoice
  const currentSubscription = invoices.length > 0 ? invoices[0]?.subscription : null;

  useEffect(() => {
    if (user?.id) {
      fetchInvoices();
    }
  }, [user?.id]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BILLING_SERVICE_URL}/api/invoices/paid/${user?.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 200){
        setInvoices(response.data);
      }
      
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to load billing history');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (invoiceId: number) => {
    try {
      toast.promise(
        new Promise(async (resolve, reject) => {
          try {
            const response = await axios.get(`${BILLING_SERVICE_URL}/api/invoices/${invoiceId}/download`, {
              headers: {
                'Authorization': `Bearer ${token}`
              },
              responseType: 'blob'
            });

            if (response.status === 200){
              const blob = new Blob([response.data]);
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `invoice-${invoiceId}.pdf`;
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              resolve('Invoice downloaded successfully');
            }
          } catch (error) {
            reject(error);
          }
        }),
        {
          loading: 'Downloading invoice...',
          success: 'Invoice downloaded successfully',
          error: 'Failed to download invoice',
        }
      );
    } catch (error) {
      console.error('Error downloading invoice:', error);
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDialogOpen(true);
  };

  const formatDate = (dateString: string | Date) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredInvoices = invoices
    .filter((invoice) => {
      // Apply status filter
      if (statusFilter !== 'all' && invoice.status.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
      
      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          invoice.invoice_number.toLowerCase().includes(searchLower) ||
          invoice.status.toLowerCase().includes(searchLower) ||
          formatCurrency(invoice.amount).toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort by date
      const dateA = new Date(a.due_date).getTime();
      const dateB = new Date(b.due_date).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    });

  return (
    <div className="p-6 space-y-8 dark:bg-gray-900 bg-gray-50">
      <section>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold dark:text-white">Billing History</h1>
            <p className="text-muted-foreground mt-1">
              View and manage your billing information and payment history
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => router.push('/billing/subscription')}
            >
              <CreditCard className="h-4 w-4" />
              Manage Subscription
            </Button>
          </div>
        </div>

        <Tabs defaultValue="invoices" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
          </TabsList>
          
          <TabsContent value="invoices">
            <Card>
              <CardHeader>
                <CardTitle>Invoice History</CardTitle>
                <CardDescription>
                  View and download your past invoices
                </CardDescription>
                
                <div className="flex flex-col md:flex-row gap-4 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search invoices..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-[130px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                      title={`Sort by date ${sortDirection === 'asc' ? 'descending' : 'ascending'}`}
                    >
                      {sortDirection === 'asc' ? (
                        <SortAsc className="h-4 w-4" />
                      ) : (
                        <SortDesc className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={fetchInvoices}
                      title="Refresh"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center justify-between p-4 border rounded-md">
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-20" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-24" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                        <Skeleton className="h-9 w-24" />
                      </div>
                    ))}
                  </div>
                ) : filteredInvoices.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Invoices Found</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      {searchTerm || statusFilter !== 'all'
                        ? "No invoices match your current filters. Try adjusting your search criteria."
                        : "You don't have any invoices yet. They will appear here once you make a payment."}
                    </p>
                    {(searchTerm || statusFilter !== 'all') && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchTerm('');
                          setStatusFilter('all');
                        }}
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Invoice Number</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInvoices.map((invoice) => (
                          <TableRow key={invoice.id}>
                            <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                            <TableCell>{formatDate(invoice.due_date)}</TableCell>
                            <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(invoice.status)}
                                <Badge variant={getStatusBadgeVariant(invoice.status)}>
                                  {invoice.status}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewInvoice(invoice)}
                                >
                                  View
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDownloadInvoice(invoice.id)}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {filteredInvoices.length} of {invoices.length} invoices
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="subscription">
            <Card>
              <CardHeader>
                <CardTitle>Current Subscription</CardTitle>
                <CardDescription>
                  Details about your current subscription plan
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-48 mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-24 w-full" />
                    </div>
                  </div>
                ) : !currentSubscription ? (
                  <div className="text-center py-12">
                    <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Active Subscription</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      You don&apos;t have an active subscription plan. Subscribe to a plan to access premium features.
                    </p>
                    <Button onClick={() => router.push('/billing/plans')}>
                      View Plans
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="bg-secondary/30 p-4 rounded-lg flex-1">
                        <h3 className="font-medium text-lg mb-2">Plan Details</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Plan:</span>
                            <span className="font-medium">{currentSubscription.plan?.name || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge variant={currentSubscription.status === 'active' ? 'default' : 'secondary'}>
                              {currentSubscription.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Price:</span>
                            <span className="font-medium">
                              {currentSubscription.plan ? formatCurrency(currentSubscription.plan.price) : 'N/A'} / {currentSubscription.plan?.billing_cycle || 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Auto-renew:</span>
                            <span>{currentSubscription.auto_renew ? 'Yes' : 'No'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-secondary/30 p-4 rounded-lg flex-1">
                        <h3 className="font-medium text-lg mb-2">Subscription Period</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Start Date:</span>
                            <span>{formatDate(currentSubscription.start_date)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">End Date:</span>
                            <span>{formatDate(currentSubscription.end_date)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Renewal:</span>
                            <span>
                              {currentSubscription.auto_renew 
                                ? `Renews on ${formatDate(currentSubscription.end_date)}` 
                                : 'Manual renewal required'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-secondary/30 p-4 rounded-lg">
                      <h3 className="font-medium text-lg mb-2">Plan Features</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="py-1">
                            Projects: {userPermissions?.projects === -1 ? 'Unlimited' : userPermissions?.projects}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="py-1">
                            Teams: {userPermissions?.teams === -1 ? 'Unlimited' : userPermissions?.teams}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={userPermissions?.chat ? 'secondary' : 'outline'} className="py-1">
                            Chat {userPermissions?.chat ? '✓' : '✗'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={userPermissions?.priority ? 'secondary' : 'outline'} className="py-1">
                            Priority Support {userPermissions?.priority ? '✓' : '✗'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={userPermissions?.analytics ? 'secondary' : 'outline'} className="py-1">
                            Analytics {userPermissions?.analytics ? '✓' : '✗'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={userPermissions?.security ? 'secondary' : 'outline'} className="py-1">
                            Advanced Security {userPermissions?.security ? '✓' : '✗'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2 justify-end">
                      <Button variant="outline" onClick={() => router.push('/billing/plans')}>
                        Change Plan
                      </Button>
                      <Button 
                        variant={currentSubscription.auto_renew ? "destructive" : "default"}
                        onClick={() => {
                          // Toggle auto-renew logic would go here
                          toast.success(`Auto-renewal ${currentSubscription.auto_renew ? 'disabled' : 'enabled'}`);
                        }}
                      >
                        {currentSubscription.auto_renew ? 'Cancel Auto-Renewal' : 'Enable Auto-Renewal'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      {/* Invoice Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>
              Invoice #{selectedInvoice?.invoice_number}
            </DialogDescription>
          </DialogHeader>
          
          {selectedInvoice && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Invoice Number</h3>
                  <p className="font-medium">{selectedInvoice.invoice_number}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedInvoice.status)}
                    <Badge variant={getStatusBadgeVariant(selectedInvoice.status)}>
                      {selectedInvoice.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Issue Date</h3>
                  <p>{formatDate(selectedInvoice.due_date)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Payment Date</h3>
                  <p>{selectedInvoice.paid_at ? formatDate(selectedInvoice.paid_at) : 'Not paid yet'}</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Payment Details</h3>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span>Subscription</span>
                    <span>{currentSubscription?.plan?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Billing Period</span>
                    <span>{currentSubscription?.plan?.billing_cycle || 'N/A'}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Total Amount</span>
                    <span>{formatCurrency(selectedInvoice.amount)}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Payment Method</h3>
                <div className="flex items-center gap-2 bg-secondary/30 p-4 rounded-lg">
                  <CreditCard className="h-5 w-5" />
                  <span>Payment processed via Stripe</span>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
            <Button 
              onClick={() => selectedInvoice && handleDownloadInvoice(selectedInvoice.id)}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function BillingHistoryPage() {
  return (
    <AppLayout>
      <ClientSideWrapper>
        <BillingHistoryContent />
      </ClientSideWrapper>
    </AppLayout>
  );
}

// Disable static generation for this page
export const dynamic = 'force-dynamic'; 