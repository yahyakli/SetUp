package SetUp.Billing.Service.repository;

import SetUp.Billing.Service.model.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Integer> {
    List<Subscription> findByUserId(String userId);
    List<Subscription> findByStatus(Subscription.SubscriptionStatus status);
    List<Subscription> findByEndDateBefore(LocalDate date);
    Optional<Subscription> findByUserIdAndStatus(String userId, Subscription.SubscriptionStatus status);
} 