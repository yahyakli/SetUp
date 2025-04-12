package SetUp.Billing.Service.controller;

import SetUp.Billing.Service.dto.ApiResponse;
import SetUp.Billing.Service.dto.SubscriptionDto;
import SetUp.Billing.Service.model.UserDetails;
import SetUp.Billing.Service.security.CurrentUser;
import SetUp.Billing.Service.service.SubscriptionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;
    private final CurrentUser currentUser;

    public SubscriptionController(SubscriptionService subscriptionService, CurrentUser currentUser) {
        this.subscriptionService = subscriptionService;
        this.currentUser = currentUser;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SubscriptionDto>>> getAllSubscriptions() {
        if (currentUser.hasRole("ADMIN")) {
            List<SubscriptionDto> subscriptions = subscriptionService.getAllSubscriptions();
            return ResponseEntity.ok(ApiResponse.success("Subscriptions retrieved successfully", subscriptions));
        } else {
            UserDetails user = currentUser.getCurrentUser();
            List<SubscriptionDto> subscriptions = subscriptionService.getSubscriptionsByUserId(user.getUserId());
            return ResponseEntity.ok(ApiResponse.success("Subscriptions retrieved successfully", subscriptions));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SubscriptionDto>> getSubscriptionById(@PathVariable String id) {
        SubscriptionDto subscription = subscriptionService.getSubscriptionById(id);

        // Check if the user has permission to view this subscription
        if (!currentUser.hasRole("ADMIN") &&
                !subscription.getUserId().equals(currentUser.getCurrentUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("You do not have permission to view this subscription"));
        }

        return ResponseEntity.ok(ApiResponse.success("Subscription retrieved successfully", subscription));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SubscriptionDto>> createSubscription(@Valid @RequestBody SubscriptionDto subscriptionDto) {
        // Ensure regular users can only create subscriptions for themselves
        if (!currentUser.hasRole("ADMIN") &&
                !subscriptionDto.getUserId().equals(currentUser.getCurrentUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("You can only create subscriptions for yourself"));
        }

        SubscriptionDto createdSubscription = subscriptionService.createSubscription(subscriptionDto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Subscription created successfully", createdSubscription));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SubscriptionDto>> updateSubscription(@PathVariable String id,
                                                                           @Valid @RequestBody SubscriptionDto subscriptionDto) {
        SubscriptionDto existingSubscription = subscriptionService.getSubscriptionById(id);

        // Check if the user has permission to update this subscription
        if (!currentUser.hasRole("ADMIN") &&
                !existingSubscription.getUserId().equals(currentUser.getCurrentUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("You do not have permission to update this subscription"));
        }

        SubscriptionDto updatedSubscription = subscriptionService.updateSubscription(id, subscriptionDto);
        return ResponseEntity.ok(ApiResponse.success("Subscription updated successfully", updatedSubscription));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<SubscriptionDto>> cancelSubscription(@PathVariable String id) {
        SubscriptionDto existingSubscription = subscriptionService.getSubscriptionById(id);

        // Check if the user has permission to cancel this subscription
        if (!currentUser.hasRole("ADMIN") &&
                !existingSubscription.getUserId().equals(currentUser.getCurrentUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("You do not have permission to cancel this subscription"));
        }

        SubscriptionDto canceledSubscription = subscriptionService.cancelSubscription(id);
        return ResponseEntity.ok(ApiResponse.success("Subscription canceled successfully", canceledSubscription));
    }
}