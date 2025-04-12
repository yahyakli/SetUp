package SetUp.Billing.Service.repository;

import SetUp.Billing.Service.model.Subscription;
import SetUp.Billing.Service.model.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, String> {
    List<Subscription> findByUserId(String userId);
    List<Subscription> findByUserIdAndStatus(String userId, SubscriptionStatus status);
}