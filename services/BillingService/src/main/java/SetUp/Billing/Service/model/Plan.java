package SetUp.Billing.Service.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UuidGenerator;

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
    @UuidGenerator
    private String id;
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;
    
    @Column(columnDefinition = "JSON")
    private String features;

    private Boolean isPublic;
    
    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL)
    private List<Subscription> subscriptions = new ArrayList<>();
} 