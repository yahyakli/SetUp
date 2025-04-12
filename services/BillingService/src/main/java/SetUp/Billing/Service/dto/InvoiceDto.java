package SetUp.Billing.Service.dto;

import SetUp.Billing.Service.model.InvoiceStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceDto {
    private String id;

    @NotBlank(message = "User ID is required")
    private String userId;

    @NotNull(message = "Subscription ID is required")
    private String subscriptionId;

    private SubscriptionDto subscription;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;

    @NotNull(message = "Invoice status is required")
    private InvoiceStatus status;

    @NotNull(message = "Due date is required")
    private Date dueDate;

    private Date paidAt;
}
