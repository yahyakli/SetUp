package SetUp.Billing.Service.dto;


import SetUp.Billing.Service.model.BillingCycle;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlanDto {
    private String id;

    @NotBlank(message = "Plan name is required")
    private String name;

    private String description;

    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    private BigDecimal price;

    @NotNull(message = "Billing cycle is required")
    private BillingCycle billingCycle;

    private String features;

    @NotNull(message = "Auto-renew setting is required")
    private Boolean autoRenew;
}