package SetUp.Billing.Service.controller;

import SetUp.Billing.Service.dto.ApiResponse;
import SetUp.Billing.Service.dto.InvoiceDto;
import SetUp.Billing.Service.security.CurrentUser;
import SetUp.Billing.Service.service.InvoiceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final CurrentUser currentUser;

    public InvoiceController(InvoiceService invoiceService, CurrentUser currentUser) {
        this.invoiceService = invoiceService;
        this.currentUser = currentUser;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<InvoiceDto>>> getAllInvoices() {
        if (currentUser.hasRole("ADMIN")) {
            List<InvoiceDto> invoices = invoiceService.getAllInvoices();
            return ResponseEntity.ok(ApiResponse.success("Invoices retrieved successfully", invoices));
        } else {
            String userId = currentUser.getCurrentUserId();
            List<InvoiceDto> invoices = invoiceService.getInvoicesByUserId(userId);
            return ResponseEntity.ok(ApiResponse.success("Invoices retrieved successfully", invoices));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<InvoiceDto>> getInvoiceById(@PathVariable String id) {
        InvoiceDto invoice = invoiceService.getInvoiceById(id);

        // Check if user has permission to view this invoice
        if (!currentUser.hasRole("ADMIN") && !invoice.getUserId().equals(currentUser.getCurrentUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("You do not have permission to view this invoice"));
        }

        return ResponseEntity.ok(ApiResponse.success("Invoice retrieved successfully", invoice));
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<ApiResponse<InvoiceDto>> payInvoice(@PathVariable String id) {
        InvoiceDto invoice = invoiceService.getInvoiceById(id);

        // Check if user has permission to pay this invoice
        if (!currentUser.hasRole("ADMIN") && !invoice.getUserId().equals(currentUser.getCurrentUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("You do not have permission to pay this invoice"));
        }

        InvoiceDto paidInvoice = invoiceService.payInvoice(id);
        return ResponseEntity.ok(ApiResponse.success("Invoice paid successfully", paidInvoice));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<InvoiceDto>> cancelInvoice(@PathVariable String id) {
        InvoiceDto invoice = invoiceService.getInvoiceById(id);

        // Only admins can cancel invoices
        if (!currentUser.hasRole("ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Only administrators can cancel invoices"));
        }

        InvoiceDto canceledInvoice = invoiceService.cancelInvoice(id);
        return ResponseEntity.ok(ApiResponse.success("Invoice canceled successfully", canceledInvoice));
    }
}