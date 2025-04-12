package SetUp.Billing.Service.repository;

import SetUp.Billing.Service.model.Invoice;
import SetUp.Billing.Service.model.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Integer> {
    List<Invoice> findByUserId(String userId);
    List<Invoice> findBySubscription(Subscription subscription);
    List<Invoice> findByStatus(Invoice.InvoiceStatus status);
    List<Invoice> findByDueDateBeforeAndStatus(LocalDate date, Invoice.InvoiceStatus status);
} 