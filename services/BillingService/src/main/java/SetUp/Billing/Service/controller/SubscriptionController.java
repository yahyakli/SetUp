package SetUp.Billing.Service.controller;

import SetUp.Billing.Service.dto.InvoiceDto;
import SetUp.Billing.Service.dto.SubscriptionDto;
import SetUp.Billing.Service.security.JwtTokenProvider;
import SetUp.Billing.Service.service.SubscriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;
    private final JwtTokenProvider jwtTokenProvider;

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<SubscriptionDto>> getAllSubscriptions() {
        return ResponseEntity.ok(subscriptionService.getAllSubscriptions());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'USER')")
    public ResponseEntity<SubscriptionDto> getSubscriptionById(@PathVariable String id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();
        
        SubscriptionDto subscription = subscriptionService.getSubscriptionById(id);
        
        // Check if the user is requesting their own subscription or is an admin
        if (!subscription.getUserId().equals(userId) && !authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        return ResponseEntity.ok(subscription);
    }

    @GetMapping("/user/current/{userId}")
    public ResponseEntity<List<SubscriptionDto>> getCurrentUserSubscriptions(@PathVariable String userId) {
        return ResponseEntity.ok(subscriptionService.getSubscriptionsByUserId(userId));
    }

    @GetMapping("/user/{userId}/active")
    public ResponseEntity<SubscriptionDto> getCurrentUserActiveSubscription(@PathVariable String userId) {
        return ResponseEntity.ok(subscriptionService.getActiveSubscriptionByUserId(userId));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<SubscriptionDto>> getUserSubscriptions(@PathVariable String userId) {
        return ResponseEntity.ok(subscriptionService.getSubscriptionsByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<InvoiceDto> createSubscription(@Valid @RequestBody SubscriptionDto subscriptionDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return new ResponseEntity<>(subscriptionService.createSubscription(subscriptionDto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<SubscriptionDto> updateSubscription(@PathVariable String id, @Valid @RequestBody SubscriptionDto subscriptionDto) {
        return ResponseEntity.ok(subscriptionService.updateSubscription(id, subscriptionDto));
    }

    @PutMapping("/{id}/{userId}/cancel")
    public ResponseEntity<SubscriptionDto> cancelSubscription(@PathVariable String id, @PathVariable String userId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        SubscriptionDto subscription = subscriptionService.getSubscriptionById(id);

        
        return ResponseEntity.ok(subscriptionService.cancelSubscription(id));
    }

    @PostMapping("/process-renewals")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> processRenewals() {
        subscriptionService.processRenewals();
        return ResponseEntity.ok().build();
    }
} 