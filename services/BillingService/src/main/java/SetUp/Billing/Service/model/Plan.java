package SetUp.Billing.Service.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;

@Entity
@Table(name = "plans")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Plan {
    @UuidGenerator
    private String id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private BillingCycle billingCycle;

    @Column(columnDefinition = "json")
    private String features;

    @Column(nullable = false)
    private Boolean autoRenew;

    @Column(name = "created_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private java.sql.Timestamp createdAt;
}