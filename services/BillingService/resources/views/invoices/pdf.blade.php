<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice #{{ $invoice->invoice_number }}</title>
    <style>
        :root {
            --primary: #6366f1;
            --primary-light: #818cf8;
            --secondary: #f3f4f6;
            --accent: #4f46e5;
            --success: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
            --gray-50: #f9fafb;
            --gray-100: #f3f4f6;
            --gray-200: #e5e7eb;
            --gray-300: #d1d5db;
            --gray-400: #9ca3af;
            --gray-500: #6b7280;
            --gray-600: #4b5563;
            --gray-700: #374151;
            --gray-800: #1f2937;
            --gray-900: #111827;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: var(--gray-700);
            background-color: var(--gray-50);
            margin: 0;
            padding: 0;
        }
        
        .invoice-box {
            max-width: 800px;
            margin: auto;
            padding: 25px;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
        }
        
        .invoice-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid var(--gray-200);
        }
        
        .company-logo {
            font-size: 24px;
            font-weight: 700;
            color: var(--primary);
        }
        
        .invoice-info {
            text-align: right;
        }
        
        .invoice-number {
            font-size: 16px;
            font-weight: 600;
            color: var(--gray-800);
            margin-bottom: 4px;
        }
        
        .invoice-date {
            color: var(--gray-600);
            margin-bottom: 2px;
        }
        
        .invoice-due {
            color: var(--gray-600);
        }
        
        .addresses {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
        }
        
        .company-details, .customer-details {
            width: 45%;
        }
        
        .address-title {
            font-weight: 600;
            color: var(--gray-500);
            text-transform: uppercase;
            font-size: 10px;
            letter-spacing: 1px;
            margin-bottom: 4px;
        }
        
        .address-content {
            color: var(--gray-800);
        }
        
        .customer-id {
            margin-top: 8px;
            color: var(--gray-600);
            font-size: 11px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
        }
        
        th {
            background-color: var(--primary);
            color: white;
            font-weight: 600;
            text-align: left;
            padding: 8px 10px;
            border-radius: 4px 4px 0 0;
            font-size: 12px;
        }
        
        th:last-child {
            text-align: right;
        }
        
        td {
            padding: 8px 10px;
            border-bottom: 1px solid var(--gray-200);
        }
        
        tr:last-child td {
            border-bottom: none;
        }
        
        .item-row td {
            color: var(--gray-700);
        }
        
        .total-row td {
            font-weight: 700;
            color: var(--gray-900);
            font-size: 14px;
            padding-top: 10px;
        }
        
        .payment-info {
            margin: 15px 0;
            padding: 10px;
            background-color: var(--gray-100);
            border-radius: 6px;
            display: flex;
            justify-content: space-between;
        }
        
        .payment-method, .payment-status {
            width: 48%;
        }
        
        .payment-label {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: var(--gray-500);
            margin-bottom: 3px;
        }
        
        .payment-value {
            font-weight: 600;
            color: var(--gray-800);
        }
        
        .status-paid {
            color: var(--success);
        }
        
        .status-pending {
            color: var(--warning);
        }
        
        .status-failed {
            color: var(--danger);
        }
        
        .footer {
            margin-top: 25px;
            text-align: center;
            color: var(--gray-600);
            padding-top: 15px;
            border-top: 1px solid var(--gray-200);
        }
        
        .thank-you {
            font-size: 14px;
            font-weight: 600;
            color: var(--primary);
            margin-bottom: 8px;
        }
        
        .contact-info {
            font-size: 11px;
            margin-top: 8px;
        }
        
        .text-right {
            text-align: right;
        }
    </style>
</head>
<body>
    <div class="invoice-box">
        <div class="invoice-header">
            <div class="company-logo">
                {{ $company['name'] }}
            </div>
            <div class="invoice-info">
                <div class="invoice-number">Invoice #{{ $invoice->invoice_number }}</div>
                <div class="invoice-date">Created: {{ $invoice->created_at->format('F d, Y') }}</div>
                <div class="invoice-due">Due: {{ $invoice->due_date ? $invoice->due_date->format('F d, Y') : 'Paid' }}</div>
            </div>
        </div>
        
        <div class="addresses">
            <div class="company-details">
                <div class="address-title">From</div>
                <div class="address-content">
                    {{ $company['name'] }}<br>
                    {{ $company['address'] }}<br>
                    {{ $company['city'] }}, {{ $company['state'] }} {{ $company['zip'] }}
                </div>
            </div>
            
            <div class="customer-details">
                <div class="address-title">To</div>
                <div class="address-content">
                    Customer
                </div>
                <div class="customer-id">
                    Customer ID: {{ $invoice->subscription->user_id }}<br>
                    Subscription ID: {{ $invoice->subscription->id }}
                </div>
            </div>
        </div>
        
        <div class="payment-info">
            <div class="payment-method">
                <div class="payment-label">Payment Method</div>
                <div class="payment-value">Credit Card</div>
            </div>
            <div class="payment-status">
                <div class="payment-label">Status</div>
                <div class="payment-value status-{{ strtolower($invoice->status) }}">
                    {{ ucfirst($invoice->status) }}
                </div>
            </div>
        </div>
        
        <table>
            <thead>
                <tr>
                    <th>Item</th>
                    <th class="text-right">Price</th>
                </tr>
            </thead>
            <tbody>
                <tr class="item-row">
                    <td>{{ $invoice->subscription->plan->name }} Subscription</td>
                    <td class="text-right">${{ number_format($invoice->amount, 2) }}</td>
                </tr>
                <tr class="total-row">
                    <td>Total</td>
                    <td class="text-right">${{ number_format($invoice->amount, 2) }}</td>
                </tr>
            </tbody>
        </table>
        
        <div class="footer">
            <div class="thank-you">Thank you for your business!</div>
            <div class="contact-info">
                If you have any questions about this invoice, please contact us: {{ $company['phone'] }} | {{ $company['email'] }}
            </div>
        </div>
    </div>
</body>
</html> 