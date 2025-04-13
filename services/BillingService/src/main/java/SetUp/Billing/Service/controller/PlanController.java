package SetUp.Billing.Service.controller;

import SetUp.Billing.Service.dto.PlanDto;
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
        return ResponseEntity.ok(planService.getAllPublicPlans());
    }

    @GetMapping("/public/{id}")
    public ResponseEntity<PlanDto> getPublicPlanById(@PathVariable String id) {
        return ResponseEntity.ok(planService.getPublicPlanById(id));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<PlanDto>> getAllPlans() {
        return ResponseEntity.ok(planService.getAllPlans());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<PlanDto> getPlanById(@PathVariable String id) {
        return ResponseEntity.ok(planService.getPlanById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<PlanDto> createPlan(@Valid @RequestBody PlanDto planDto) {
        return new ResponseEntity<>(planService.createPlan(planDto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<PlanDto> updatePlan(@PathVariable String id, @Valid @RequestBody PlanDto planDto) {
        return ResponseEntity.ok(planService.updatePlan(id, planDto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deletePlan(@PathVariable String id) {
        planService.deletePlan(id);
        return ResponseEntity.noContent().build();
    }
}