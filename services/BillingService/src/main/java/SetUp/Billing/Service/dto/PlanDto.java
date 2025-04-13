package SetUp.Billing.Service.dto;

import SetUp.Billing.Service.model.Plan;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlanDto {
    
    private String id;
    
    @NotBlank(message = "Plan name is required")
    private String name;
    
    private String description;
    
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Price must be greater or equal 0")
    private BigDecimal price;

    private String specialTitle;

    @NotNull(message = "Project Number is required")
    private int projects;

    @NotNull(message = "Teams Number is required")
    private int teamOwned;

    @NotNull(message = "Has Chat is required")
    private Boolean chat;

    @NotNull(message = "priority is required")
    private Boolean priority;

    @NotNull(message = "analytics is required")
    private Boolean analytics;

    @NotNull(message = "security is required")
    private Boolean security;

    @NotNull(message = "isPublic is required")
    private Boolean isPublic;
    
}