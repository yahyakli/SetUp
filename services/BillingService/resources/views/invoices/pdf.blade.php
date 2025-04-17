<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice #{{ $invoice->invoice_number }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 14px;
            line-height: 1.5;
            color: #333;
        }
        .invoice-box {
            max-width: 800px;
            margin: auto;
            padding: 30px;
            border: 1px solid #eee;
            box-shadow: 0 0 10px rgba(0, 0, 0, .15);
        }
        .invoice-box table {
            width: 100%;
            line-height: inherit;
            text-align: left;
            border-collapse: collapse;
        }
        .invoice-box table td {
            padding: 5px;
            vertical-align: top;
        }
        .invoice-box table tr.top table td {
            padding-bottom: 20px;
        }
        .invoice-box table tr.top table td.title {
            font-size: 45px;
            line-height: 45px;
            color: #333;
        }
        .invoice-box table tr.information table td {
            padding-bottom: 40px;
        }
        .invoice-box table tr.heading td {
            background: #eee;
            border-bottom: 1px solid #ddd;
            font-weight: bold;
        }
        .invoice-box table tr.details td {
            padding-bottom: 20px;
        }
        .invoice-box table tr.item td {
            border-bottom: 1px solid #eee;
        }
        .invoice-box table tr.item.last td {
            border-bottom: none;
        }
        .invoice-box table tr.total td:nth-child(2) {
            border-top: 2px solid #eee;
            font-weight: bold;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        .mt-3 {
            margin-top: 1rem;
        }
        .mt-5 {
            margin-top: 3rem;
        }
    </style>
</head>
<body>
    <div class="invoice-box">
        <table>
            <tr class="top">
                <td colspan="2">
                    <table>
                        <tr>
                            <td class="title">
                                {{ $company['name'] }}
                            </td>
                            <td class="text-right">
                                Invoice #: {{ $invoice->invoice_number }}<br>
                                Created: {{ $invoice->created_at->format('F d, Y') }}<br>
                                Due: {{ $invoice->due_date ? $invoice->due_date->format('F d, Y') : 'Paid' }}
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            
            <tr class="information">
                <td colspan="2">
                    <table>
                        <tr>
                            <td>
                                {{ $company['name'] }}<br>
                                {{ $company['address'] }}<br>
                                {{ $company['city'] }}, {{ $company['state'] }} {{ $company['zip'] }}
                            </td>
                            <td class="text-right">
                                Customer ID: {{ $invoice->subscription->user_id }}<br>
                                Subscription ID: {{ $invoice->subscription->id }}
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            
            <tr class="heading">
                <td>Payment Method</td>
                <td class="text-right">Status</td>
            </tr>
            
            <tr class="details">
                <td>Credit Card</td>
                <td class="text-right">{{ ucfirst($invoice->status) }}</td>
            </tr>
            
            <tr class="heading">
                <td>Item</td>
                <td class="text-right">Price</td>
            </tr>
            
            <tr class="item">
                <td>{{ $invoice->subscription->plan->name }} Subscription</td>
                <td class="text-right">${{ number_format($invoice->amount, 2) }}</td>
            </tr>
            
            <tr class="total">
                <td></td>
                <td class="text-right">Total: ${{ number_format($invoice->amount, 2) }}</td>
            </tr>
        </table>
        
        <div class="mt-5 text-center">
            <p>Thank you for your business!</p>
            <p class="mt-3">
                If you have any questions about this invoice, please contact us:<br>
                {{ $company['phone'] }} | {{ $company['email'] }}
            </p>
        </div>
    </div>
</body>
</html> 