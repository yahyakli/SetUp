package SetUp.Billing.Service.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "plans")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Plan {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BillingCycle billingCycle;
    
    @Column(columnDefinition = "JSON")
    private String features;
    
    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL)
    private List<Subscription> subscriptions = new ArrayList<>();
    
    public enum BillingCycle {
        MONTHLY, ANNUALLY
    }
} 