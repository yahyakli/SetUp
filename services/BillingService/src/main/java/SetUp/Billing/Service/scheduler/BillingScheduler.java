package SetUp.Billing.Service.scheduler;

import SetUp.Billing.Service.service.InvoiceService;
import SetUp.Billing.Service.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class BillingScheduler {

    private final SubscriptionService subscriptionService;
    private final InvoiceService invoiceService;

    // Run every day at midnight
    @Scheduled(cron = "0 0 0 * * ?")
    public void processSubscriptionRenewals() {
        log.info("Starting scheduled subscription renewal processing");
        try {
            subscriptionService.processRenewals();
            log.info("Subscription renewal processing completed successfully");
        } catch (Exception e) {
            log.error("Error processing subscription renewals: {}", e.getMessage(), e);
        }
    }

    // Run every day at 1 AM
    @Scheduled(cron = "0 0 1 * * ?")
    public void processOverdueInvoices() {
        log.info("Starting scheduled overdue invoice processing");
        try {
            invoiceService.processOverdueInvoices();
            log.info("Overdue invoice processing completed successfully");
        } catch (Exception e) {
            log.error("Error processing overdue invoices: {}", e.getMessage(), e);
        }
    }
} 