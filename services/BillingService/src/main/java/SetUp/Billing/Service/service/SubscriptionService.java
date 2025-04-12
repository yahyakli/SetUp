package SetUp.Billing.Service.service;

import SetUp.Billing.Service.dto.PlanDto;
import SetUp.Billing.Service.dto.SubscriptionDto;
import SetUp.Billing.Service.exception.ResourceNotFoundException;
import SetUp.Billing.Service.model.Plan;
import SetUp.Billing.Service.model.Subscription;
import SetUp.Billing.Service.repository.PlanRepository;
import SetUp.Billing.Service.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final PlanRepository planRepository;
    private final PlanService planService;
    private final InvoiceService invoiceService;

    public List<SubscriptionDto> getAllSubscriptions() {
        return subscriptionRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public SubscriptionDto getSubscriptionById(Integer id) {
        Subscription subscription = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found with id: " + id));
        return convertToDto(subscription);
    }

    public List<SubscriptionDto> getSubscriptionsByUserId(String userId) {
        return subscriptionRepository.findByUserId(userId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public SubscriptionDto getActiveSubscriptionByUserId(String userId) {
        Subscription subscription = subscriptionRepository.findByUserIdAndStatus(userId, Subscription.SubscriptionStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("No active subscription found for user: " + userId));
        return convertToDto(subscription);
    }

    @Transactional
    public SubscriptionDto createSubscription(SubscriptionDto subscriptionDto, String userId) {
        Plan plan = planRepository.findById(subscriptionDto.getPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found with id: " + subscriptionDto.getPlanId()));
        
        LocalDate startDate = subscriptionDto.getStartDate() != null ? 
                subscriptionDto.getStartDate() : LocalDate.now();
        
        LocalDate endDate;
        if (plan.getBillingCycle() == Plan.BillingCycle.MONTHLY) {
            endDate = startDate.plusMonths(1);
        } else {
            endDate = startDate.plusYears(1);
        }
        
        Subscription subscription = Subscription.builder()
                .userId(userId)
                .plan(plan)
                .status(Subscription.SubscriptionStatus.ACTIVE)
                .startDate(startDate)
                .endDate(endDate)
                .autoRenew(subscriptionDto.getAutoRenew())
                .build();
        
        Subscription savedSubscription = subscriptionRepository.save(subscription);
        
        // Create initial invoice
        invoiceService.createInvoiceForSubscription(savedSubscription);
        
        return convertToDto(savedSubscription);
    }

    @Transactional
    public SubscriptionDto updateSubscription(Integer id, SubscriptionDto subscriptionDto) {
        Subscription existingSubscription = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found with id: " + id));
        
        if (subscriptionDto.getPlanId() != null && 
                !existingSubscription.getPlan().getId().equals(subscriptionDto.getPlanId())) {
            Plan newPlan = planRepository.findById(subscriptionDto.getPlanId())
                    .orElseThrow(() -> new ResourceNotFoundException("Plan not found with id: " + subscriptionDto.getPlanId()));
            existingSubscription.setPlan(newPlan);
        }
        
        if (subscriptionDto.getStatus() != null) {
            existingSubscription.setStatus(subscriptionDto.getStatus());
        }
        
        if (subscriptionDto.getStartDate() != null) {
            existingSubscription.setStartDate(subscriptionDto.getStartDate());
        }
        
        if (subscriptionDto.getEndDate() != null) {
            existingSubscription.setEndDate(subscriptionDto.getEndDate());
        }
        
        if (subscriptionDto.getAutoRenew() != null) {
            existingSubscription.setAutoRenew(subscriptionDto.getAutoRenew());
        }
        
        Subscription updatedSubscription = subscriptionRepository.save(existingSubscription);
        return convertToDto(updatedSubscription);
    }

    @Transactional
    public SubscriptionDto cancelSubscription(Integer id) {
        Subscription subscription = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found with id: " + id));
        
        subscription.setStatus(Subscription.SubscriptionStatus.CANCELED);
        subscription.setAutoRenew(false);
        
        Subscription canceledSubscription = subscriptionRepository.save(subscription);
        return convertToDto(canceledSubscription);
    }

    @Transactional
    public void processRenewals() {
        LocalDate today = LocalDate.now();
        List<Subscription> expiringSubscriptions = subscriptionRepository.findByEndDateBefore(today.plusDays(1));
        
        for (Subscription subscription : expiringSubscriptions) {
            if (subscription.getStatus() == Subscription.SubscriptionStatus.ACTIVE && 
                    subscription.getAutoRenew()) {
                
                LocalDate newEndDate;
                if (subscription.getPlan().getBillingCycle() == Plan.BillingCycle.MONTHLY) {
                    newEndDate = subscription.getEndDate().plusMonths(1);
                } else {
                    newEndDate = subscription.getEndDate().plusYears(1);
                }
                
                subscription.setEndDate(newEndDate);
                subscriptionRepository.save(subscription);
                
                // Create new invoice for the renewal
                invoiceService.createInvoiceForSubscription(subscription);
            } else if (subscription.getStatus() == Subscription.SubscriptionStatus.ACTIVE && 
                    !subscription.getAutoRenew() && 
                    subscription.getEndDate().isBefore(today)) {
                
                subscription.setStatus(Subscription.SubscriptionStatus.PAST_DUE);
                subscriptionRepository.save(subscription);
            }
        }
    }

    private SubscriptionDto convertToDto(Subscription subscription) {
        PlanDto planDto = planService.getPlanById(subscription.getPlan().getId());
        
        return SubscriptionDto.builder()
                .id(subscription.getId())
                .userId(subscription.getUserId())
                .planId(subscription.getPlan().getId())
                .plan(planDto)
                .status(subscription.getStatus())
                .startDate(subscription.getStartDate())
                .endDate(subscription.getEndDate())
                .autoRenew(subscription.getAutoRenew())
                .build();
    }
} 