package SetUp.Billing.Service.service;

import SetUp.Billing.Service.dto.InvoiceDto;
import SetUp.Billing.Service.exception.ResourceNotFoundException;
import SetUp.Billing.Service.model.Invoice;
import SetUp.Billing.Service.model.InvoiceStatus;
import SetUp.Billing.Service.model.Subscription;
import SetUp.Billing.Service.repository.InvoiceRepository;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final ModelMapper modelMapper;

    public InvoiceService(InvoiceRepository invoiceRepository, ModelMapper modelMapper) {
        this.invoiceRepository = invoiceRepository;
        this.modelMapper = modelMapper;
    }

    public List<InvoiceDto> getAllInvoices() {
        return invoiceRepository.findAll().stream()
                .map(invoice -> modelMapper.map(invoice, InvoiceDto.class))
                .collect(Collectors.toList());
    }

    public List<InvoiceDto> getInvoicesByUserId(String userId) {
        return invoiceRepository.findByUserId(userId).stream()
                .map(invoice -> modelMapper.map(invoice, InvoiceDto.class))
                .collect(Collectors.toList());
    }

    public InvoiceDto getInvoiceById(String id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));
        return modelMapper.map(invoice, InvoiceDto.class);
    }

    public void createInvoiceForSubscription(Subscription subscription) {
        Invoice invoice = new Invoice();
        invoice.setUserId(subscription.getUserId().toString());
        invoice.setSubscription(subscription);
        invoice.setAmount(subscription.getPlan().getPrice());
        invoice.setStatus(InvoiceStatus.UNPAID);

        // Set due date (usually same as start date for initial invoice)
        invoice.setDueDate(subscription.getStartDate());

        invoiceRepository.save(invoice);
    }

    public InvoiceDto payInvoice(String id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));

        invoice.setStatus(InvoiceStatus.PAID);
        invoice.setPaidAt(new Date());

        Invoice updatedInvoice = invoiceRepository.save(invoice);
        return modelMapper.map(updatedInvoice, InvoiceDto.class);
    }

    public InvoiceDto cancelInvoice(String id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));

        invoice.setStatus(InvoiceStatus.CANCELED);

        Invoice updatedInvoice = invoiceRepository.save(invoice);
        return modelMapper.map(updatedInvoice, InvoiceDto.class);
    }

    public void cancelUnpaidInvoicesForSubscription(String subscriptionId) {
        List<Invoice> invoices = invoiceRepository.findBySubscriptionId(subscriptionId);
        for (Invoice invoice : invoices) {
            if (invoice.getStatus() == InvoiceStatus.UNPAID) {
                invoice.setStatus(InvoiceStatus.CANCELED);
                invoiceRepository.save(invoice);
            }
        }
    }
}