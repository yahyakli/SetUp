package SetUp.Billing.Service.dto;

import SetUp.Billing.Service.model.SubscriptionStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionDto {
    private String id;

    @NotNull(message = "User ID is required")
    private String userId;

    @NotNull(message = "Plan ID is required")
    private String planId;

    private PlanDto plan;

    private SubscriptionStatus status;

    @NotNull(message = "Start date is required")
    private Date startDate;

    @NotNull(message = "End date is required")
    private Date endDate;
}