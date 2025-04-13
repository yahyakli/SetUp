package SetUp.Billing.Service.service;

import SetUp.Billing.Service.dto.PlanDto;
import SetUp.Billing.Service.exception.ResourceNotFoundException;
import SetUp.Billing.Service.model.Plan;
import SetUp.Billing.Service.repository.PlanRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlanService {

    private final PlanRepository planRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<PlanDto> getAllPlans() {
        return planRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<PlanDto> getAllPublicPlans() {
        return planRepository.findByIsPublicTrue().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public PlanDto getPlanById(String id) {
        Plan plan = planRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found with id: " + id));
        return convertToDto(plan);
    }

    public PlanDto getPublicPlanById(String id) {
        Plan plan = planRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found with id: " + id));

        if (plan.getIsPublic() == null || !plan.getIsPublic()) {
            throw new ResourceNotFoundException("Public plan not found with id: " + id);
        }

        return convertToDto(plan);
    }

    @Transactional
    public PlanDto createPlan(PlanDto planDto) {
        Plan plan = convertToEntity(planDto);
        Plan savedPlan = planRepository.save(plan);
        return convertToDto(savedPlan);
    }

    @Transactional
    public PlanDto updatePlan(String id, PlanDto planDto) {
        Plan existingPlan = planRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found with id: " + id));

        existingPlan.setName(planDto.getName());
        existingPlan.setDescription(planDto.getDescription());
        existingPlan.setPrice(planDto.getPrice());
        existingPlan.setIsPublic(planDto.getIsPublic());

        try {
            existingPlan.setFeatures(objectMapper.writeValueAsString(planDto.getFeatures()));
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize features", e);
        }

        Plan updatedPlan = planRepository.save(existingPlan);
        return convertToDto(updatedPlan);
    }

    @Transactional
    public void deletePlan(String id) {
        if (!planRepository.existsById(id)) {
            throw new ResourceNotFoundException("Plan not found with id: " + id);
        }
        planRepository.deleteById(id);
    }

    private PlanDto convertToDto(Plan plan) {
        List<String> featuresList;
        try {
            featuresList = objectMapper.readValue(
                    plan.getFeatures() != null ? plan.getFeatures() : "[]",
                    new TypeReference<List<String>>() {});
        } catch (Exception e) {
            featuresList = Collections.emptyList(); // fallback
        }

        return PlanDto.builder()
                .id(plan.getId())
                .name(plan.getName())
                .description(plan.getDescription())
                .price(plan.getPrice())
                .features(featuresList)
                .isPublic(plan.getIsPublic())
                .build();
    }

    private Plan convertToEntity(PlanDto planDto) {
        String featuresJson = "[]";
        try {
            featuresJson = objectMapper.writeValueAsString(planDto.getFeatures());
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize features", e);
        }

        return Plan.builder()
                .id(planDto.getId())
                .name(planDto.getName())
                .description(planDto.getDescription())
                .price(planDto.getPrice())
                .features(featuresJson)
                .isPublic(planDto.getIsPublic())
                .build();
    }
}
