package SetUp.Billing.Service.config;

import SetUp.Billing.Service.service.InvoiceService;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

@Configuration
@EnableScheduling
public class SchedulingConfig {

    private final InvoiceService invoiceService;

    public SchedulingConfig(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    // Run everyday at midnight
    @Scheduled(cron = "0 0 0 * * ?")
    public void generateRecurringInvoices() {
        invoiceService.generateRecurringInvoices();
    }
}