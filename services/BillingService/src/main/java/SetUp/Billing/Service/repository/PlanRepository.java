package SetUp.Billing.Service.repository;

import SetUp.Billing.Service.model.Plan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlanRepository extends JpaRepository<Plan, String> {
    List<Plan> findByIsPublicTrue();
}