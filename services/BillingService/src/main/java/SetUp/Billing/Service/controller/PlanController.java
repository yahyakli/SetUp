package SetUp.Billing.Service.controller;

import SetUp.Billing.Service.dto.PlanDto;
import SetUp.Billing.Service.model.Plan;
import SetUp.Billing.Service.service.PlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/plans")
@RequiredArgsConstructor
public class PlanController {

    private final PlanService planService;

    @GetMapping("/public")
    public ResponseEntity<List<PlanDto>> getAllPublicPlans() {
        return ResponseEntity.ok(planService.getAllPlans());
    }

    @GetMapping("/public/{id}")
    public ResponseEntity<PlanDto> getPublicPlanById(@PathVariable Integer id) {
        return ResponseEntity.ok(planService.getPlanById(id));
    }

    @GetMapping("/public/billing-cycle/{cycle}")
    public ResponseEntity<List<PlanDto>> getPublicPlansByBillingCycle(@PathVariable String cycle) {
        Plan.BillingCycle billingCycle = Plan.BillingCycle.valueOf(cycle.toUpperCase());
        return ResponseEntity.ok(planService.getPlansByBillingCycle(billingCycle));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PlanDto>> getAllPlans() {
        return ResponseEntity.ok(planService.getAllPlans());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PlanDto> getPlanById(@PathVariable Integer id) {
        return ResponseEntity.ok(planService.getPlanById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PlanDto> createPlan(@Valid @RequestBody PlanDto planDto) {
        return new ResponseEntity<>(planService.createPlan(planDto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PlanDto> updatePlan(@PathVariable Integer id, @Valid @RequestBody PlanDto planDto) {
        return ResponseEntity.ok(planService.updatePlan(id, planDto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePlan(@PathVariable Integer id) {
        planService.deletePlan(id);
        return ResponseEntity.noContent().build();
    }
} 