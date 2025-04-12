package SetUp.Billing.Service.controller;

import SetUp.Billing.Service.dto.InvoiceDto;
import SetUp.Billing.Service.model.Invoice;
import SetUp.Billing.Service.service.InvoiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<InvoiceDto>> getAllInvoices() {
        return ResponseEntity.ok(invoiceService.getAllInvoices());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceDto> getInvoiceById(@PathVariable Integer id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();
        
        InvoiceDto invoice = invoiceService.getInvoiceById(id);
        
        // Check if the user is requesting their own invoice or is an admin
        if (!invoice.getUserId().equals(userId) && !authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        return ResponseEntity.ok(invoice);
    }

    @GetMapping("/user")
    public ResponseEntity<List<InvoiceDto>> getCurrentUserInvoices() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();
        return ResponseEntity.ok(invoiceService.getInvoicesByUserId(userId));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<InvoiceDto>> getUserInvoices(@PathVariable String userId) {
        return ResponseEntity.ok(invoiceService.getInvoicesByUserId(userId));
    }

    @GetMapping("/subscription/{subscriptionId}")
    public ResponseEntity<List<InvoiceDto>> getInvoicesBySubscriptionId(@PathVariable Integer subscriptionId) {
        return ResponseEntity.ok(invoiceService.getInvoicesBySubscriptionId(subscriptionId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InvoiceDto> createInvoice(@Valid @RequestBody InvoiceDto invoiceDto) {
        return new ResponseEntity<>(invoiceService.createInvoice(invoiceDto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}/pay")
    public ResponseEntity<InvoiceDto> markInvoiceAsPaid(@PathVariable Integer id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();
        
        InvoiceDto invoice = invoiceService.getInvoiceById(id);
        
        // Check if the user is paying their own invoice or is an admin
        if (!invoice.getUserId().equals(userId) && !authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        return ResponseEntity.ok(invoiceService.markAsPaid(id));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InvoiceDto> cancelInvoice(@PathVariable Integer id) {
        return ResponseEntity.ok(invoiceService.cancelInvoice(id));
    }

    @PostMapping("/process-overdue")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> processOverdueInvoices() {
        invoiceService.processOverdueInvoices();
        return ResponseEntity.ok().build();
    }
} 