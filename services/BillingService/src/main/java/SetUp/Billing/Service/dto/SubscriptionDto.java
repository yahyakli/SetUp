package SetUp.Billing.Service.dto;

import SetUp.Billing.Service.model.Plan;
import SetUp.Billing.Service.model.Subscription;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionDto {
    
    private String id;
    
    private String userId;
    
    @NotNull(message = "Plan ID is required")
    private String planId;
    
    private PlanDto plan;
    
    private Subscription.SubscriptionStatus status;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;

    @NotNull(message = "Billing cycle is required")
    private Subscription.BillingCycle billingCycle;
    
    @NotNull(message = "Auto-renew setting is required")
    private Boolean autoRenew;
} 