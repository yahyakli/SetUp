<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        $invoices = Invoice::where('user_id', $request->user_id)->get();
        return response()->json(['invoices' => $invoices]);
    }

    public function show($id, Request $request)
    {
        $invoice = Invoice::where('id', $id)
            ->where('user_id', $request->user_id)
            ->firstOrFail();
        return response()->json(['invoice' => $invoice]);
    }

    public function downloadPdf($id, Request $request)
    {
        $invoice = Invoice::where('id', $id)
            ->where('user_id', $request->user_id)
            ->firstOrFail();
            
        // Generate PDF logic here
        // ...
        
        return response()->download($pdfPath, "invoice-{$invoice->invoice_number}.pdf");
    }
}
