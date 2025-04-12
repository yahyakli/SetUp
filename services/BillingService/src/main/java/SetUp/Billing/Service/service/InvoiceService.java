package SetUp.Billing.Service.service;

import SetUp.Billing.Service.dto.InvoiceDto;
import SetUp.Billing.Service.exception.ResourceNotFoundException;
import SetUp.Billing.Service.model.Invoice;
import SetUp.Billing.Service.model.Subscription;
import SetUp.Billing.Service.repository.InvoiceRepository;
import SetUp.Billing.Service.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final SubscriptionRepository subscriptionRepository;

    public List<InvoiceDto> getAllInvoices() {
        return invoiceRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public InvoiceDto getInvoiceById(Integer id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));
        return convertToDto(invoice);
    }

    public List<InvoiceDto> getInvoicesByUserId(String userId) {
        return invoiceRepository.findByUserId(userId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<InvoiceDto> getInvoicesBySubscriptionId(Integer subscriptionId) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found with id: " + subscriptionId));
        
        return invoiceRepository.findBySubscription(subscription).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public InvoiceDto createInvoice(InvoiceDto invoiceDto) {
        Subscription subscription = null;
        if (invoiceDto.getSubscriptionId() != null) {
            subscription = subscriptionRepository.findById(invoiceDto.getSubscriptionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Subscription not found with id: " + invoiceDto.getSubscriptionId()));
        }
        
        Invoice invoice = Invoice.builder()
                .userId(invoiceDto.getUserId())
                .subscription(subscription)
                .amount(invoiceDto.getAmount())
                .status(invoiceDto.getStatus() != null ? invoiceDto.getStatus() : Invoice.InvoiceStatus.UNPAID)
                .dueDate(invoiceDto.getDueDate() != null ? invoiceDto.getDueDate() : LocalDate.now().plusDays(30))
                .build();
        
        Invoice savedInvoice = invoiceRepository.save(invoice);
        return convertToDto(savedInvoice);
    }

    @Transactional
    public InvoiceDto createInvoiceForSubscription(Subscription subscription) {
        Invoice invoice = Invoice.builder()
                .userId(subscription.getUserId())
                .subscription(subscription)
                .amount(subscription.getPlan().getPrice())
                .status(Invoice.InvoiceStatus.UNPAID)
                .dueDate(LocalDate.now().plusDays(7))
                .build();
        
        Invoice savedInvoice = invoiceRepository.save(invoice);
        return convertToDto(savedInvoice);
    }

    @Transactional
    public InvoiceDto updateInvoiceStatus(Integer id, Invoice.InvoiceStatus status) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));
        
        invoice.setStatus(status);
        
        if (status == Invoice.InvoiceStatus.PAID) {
            invoice.setPaidAt(LocalDateTime.now());
        }
        
        Invoice updatedInvoice = invoiceRepository.save(invoice);
        return convertToDto(updatedInvoice);
    }

    @Transactional
    public InvoiceDto markAsPaid(Integer id) {
        return updateInvoiceStatus(id, Invoice.InvoiceStatus.PAID);
    }

    @Transactional
    public InvoiceDto cancelInvoice(Integer id) {
        return updateInvoiceStatus(id, Invoice.InvoiceStatus.CANCELED);
    }

    @Transactional
    public void processOverdueInvoices() {
        LocalDate today = LocalDate.now();
        List<Invoice> overdueInvoices = invoiceRepository.findByDueDateBeforeAndStatus(today, Invoice.InvoiceStatus.UNPAID);
        
        for (Invoice invoice : overdueInvoices) {
            if (invoice.getSubscription() != null) {
                Subscription subscription = invoice.getSubscription();
                subscription.setStatus(Subscription.SubscriptionStatus.PAST_DUE);
                subscriptionRepository.save(subscription);
            }
        }
    }

    private InvoiceDto convertToDto(Invoice invoice) {
        return InvoiceDto.builder()
                .id(invoice.getId())
                .userId(invoice.getUserId())
                .subscriptionId(invoice.getSubscription() != null ? invoice.getSubscription().getId() : null)
                .amount(invoice.getAmount())
                .status(invoice.getStatus())
                .dueDate(invoice.getDueDate())
                .paidAt(invoice.getPaidAt())
                .createdAt(invoice.getCreatedAt())
                .build();
    }
} 