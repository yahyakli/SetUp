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
        existingPlan.setSpecialTitle(planDto.getSpecialTitle());
        existingPlan.setProjects(planDto.getProjects());
        existingPlan.setTeamOwned(planDto.getTeamOwned());
        existingPlan.setChat(planDto.getChat());
        existingPlan.setPriority(planDto.getPriority());
        existingPlan.setAnalytics(planDto.getAnalytics());
        existingPlan.setSecurity(planDto.getSecurity());
        existingPlan.setIsPublic(planDto.getIsPublic());

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

    public PlanDto convertToDto(Plan plan) {
        return PlanDto.builder()
                .id(plan.getId())
                .name(plan.getName())
                .description(plan.getDescription())
                .price(plan.getPrice())
                .specialTitle(plan.getSpecialTitle())
                .isPublic(plan.getIsPublic())
                .projects(plan.getProjects())
                .teamOwned(plan.getTeamOwned())
                .chat(plan.getChat())
                .priority(plan.getPriority())
                .analytics(plan.getAnalytics())
                .security(plan.getSecurity())
                .build();
    }

    private Plan convertToEntity(PlanDto planDto) {
        return Plan.builder()
                .id(planDto.getId())
                .name(planDto.getName())
                .description(planDto.getDescription())
                .price(planDto.getPrice())
                .specialTitle(planDto.getSpecialTitle())
                .isPublic(planDto.getIsPublic())
                .projects(planDto.getProjects())
                .teamOwned(planDto.getTeamOwned())
                .chat(planDto.getChat())
                .priority(planDto.getPriority())
                .analytics(planDto.getAnalytics())
                .security(planDto.getSecurity())
                .build();
    }
}
