package SetUp.Billing.Service.repository;

import SetUp.Billing.Service.model.Invoice;
import SetUp.Billing.Service.model.InvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, String> {
    List<Invoice> findByUserId(String userId);
    List<Invoice> findBySubscriptionId(String subscriptionId);
    List<Invoice> findByUserIdAndStatus(String userId, InvoiceStatus status);
}