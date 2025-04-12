package SetUp.Billing.Service.controller;

import SetUp.Billing.Service.dto.ApiResponse;
import SetUp.Billing.Service.dto.PlanDto;
import SetUp.Billing.Service.security.CurrentUser;
import SetUp.Billing.Service.service.PlanService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/plans")
public class PlanController {

    private final PlanService planService;
    private final CurrentUser currentUser;

    public PlanController(PlanService planService, CurrentUser currentUser) {
        this.planService = planService;
        this.currentUser = currentUser;
    }

    @GetMapping("/public")
    public ResponseEntity<ApiResponse<List<PlanDto>>> getPublicPlans() {
        List<PlanDto> plans = planService.getAllPlans();
        return ResponseEntity.ok(ApiResponse.success("Plans retrieved successfully", plans));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PlanDto>>> getAllPlans() {
        List<PlanDto> plans = planService.getAllPlans();
        return ResponseEntity.ok(ApiResponse.success("Plans retrieved successfully", plans));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PlanDto>> getPlanById(@PathVariable String id) {
        PlanDto plan = planService.getPlanById(id);
        return ResponseEntity.ok(ApiResponse.success("Plan retrieved successfully", plan));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PlanDto>> createPlan(@Valid @RequestBody PlanDto planDto) {
        if (!currentUser.hasRole("ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Only administrators can create plans"));
        }
        PlanDto createdPlan = planService.createPlan(planDto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Plan created successfully", createdPlan));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PlanDto>> updatePlan(@PathVariable String id, @Valid @RequestBody PlanDto planDto) {
        if (!currentUser.hasRole("ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Only administrators can update plans"));
        }
        PlanDto updatedPlan = planService.updatePlan(id, planDto);
        return ResponseEntity.ok(ApiResponse.success("Plan updated successfully", updatedPlan));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePlan(@PathVariable String id) {
        if (!currentUser.hasRole("ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Only administrators can delete plans"));
        }
        planService.deletePlan(id);
        return ResponseEntity.ok(ApiResponse.success("Plan deleted successfully", null));
    }
}