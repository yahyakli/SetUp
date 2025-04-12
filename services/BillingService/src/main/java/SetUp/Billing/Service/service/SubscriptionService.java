package SetUp.Billing.Service.service;

import SetUp.Billing.Service.dto.SubscriptionDto;
import SetUp.Billing.Service.exception.ResourceNotFoundException;
import SetUp.Billing.Service.model.BillingCycle;
import SetUp.Billing.Service.model.Plan;
import SetUp.Billing.Service.model.Subscription;
import SetUp.Billing.Service.model.SubscriptionStatus;
import SetUp.Billing.Service.repository.PlanRepository;
import SetUp.Billing.Service.repository.SubscriptionRepository;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final PlanRepository planRepository;
    private final ModelMapper modelMapper;
    private final InvoiceService invoiceService;

    public SubscriptionService(SubscriptionRepository subscriptionRepository, PlanRepository planRepository,
                               ModelMapper modelMapper, InvoiceService invoiceService) {
        this.subscriptionRepository = subscriptionRepository;
        this.planRepository = planRepository;
        this.modelMapper = modelMapper;
        this.invoiceService = invoiceService;
    }

    public List<SubscriptionDto> getAllSubscriptions() {
        return subscriptionRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<SubscriptionDto> getSubscriptionsByUserId(String userId) {
        return subscriptionRepository.findByUserId(userId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public SubscriptionDto getSubscriptionById(String id) {
        Subscription subscription = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found with id: " + id));
        return convertToDto(subscription);
    }

    public SubscriptionDto createSubscription(SubscriptionDto subscriptionDto) {
        Plan plan = planRepository.findById(subscriptionDto.getPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found with id: " + subscriptionDto.getPlanId()));

        Subscription subscription = new Subscription();
        subscription.setUserId(subscriptionDto.getUserId());
        subscription.setPlan(plan);
        subscription.setStatus(SubscriptionStatus.ACTIVE);
        subscription.setStartDate(subscriptionDto.getStartDate() != null ? subscriptionDto.getStartDate() : new Date());

        // Calculate end date based on billing cycle
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(subscription.getStartDate());
        if (plan.getBillingCycle() == BillingCycle.MONTHLY) {
            calendar.add(Calendar.MONTH, 1);
        } else if (plan.getBillingCycle() == BillingCycle.ANNUALLY) {
            calendar.add(Calendar.YEAR, 1);
        }
        subscription.setEndDate(calendar.getTime());

        Subscription savedSubscription = subscriptionRepository.save(subscription);

        // Create initial invoice for the subscription
        invoiceService.createInvoiceForSubscription(savedSubscription);

        return convertToDto(savedSubscription);
    }

    public SubscriptionDto updateSubscription(String id, SubscriptionDto subscriptionDto) {
        Subscription subscription = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found with id: " + id));

        if (subscriptionDto.getPlanId() != null &&
                !subscription.getPlan().getId().equals(subscriptionDto.getPlanId())) {
            Plan plan = planRepository.findById(subscriptionDto.getPlanId())
                    .orElseThrow(() -> new ResourceNotFoundException("Plan not found with id: " + subscriptionDto.getPlanId()));
            subscription.setPlan(plan);
        }

        if (subscriptionDto.getStatus() != null) {
            subscription.setStatus(subscriptionDto.getStatus());
        }

        if (subscriptionDto.getStartDate() != null) {
            subscription.setStartDate(subscriptionDto.getStartDate());
        }

        if (subscriptionDto.getEndDate() != null) {
            subscription.setEndDate(subscriptionDto.getEndDate());
        }

        Subscription updatedSubscription = subscriptionRepository.save(subscription);
        return convertToDto(updatedSubscription);
    }

    public SubscriptionDto cancelSubscription(String id) {
        Subscription subscription = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found with id: " + id));

        subscription.setStatus(SubscriptionStatus.CANCELED);
        Subscription updatedSubscription = subscriptionRepository.save(subscription);

        // Cancel any unpaid invoices
        invoiceService.cancelUnpaidInvoicesForSubscription(id);

        return convertToDto(updatedSubscription);
    }

    private SubscriptionDto convertToDto(Subscription subscription) {
        SubscriptionDto dto = modelMapper.map(subscription, SubscriptionDto.class);
        dto.setPlanId(subscription.getPlan().getId());
        return dto;
    }
}