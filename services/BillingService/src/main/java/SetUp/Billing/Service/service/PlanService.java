package SetUp.Billing.Service.service;

import SetUp.Billing.Service.dto.PlanDto;
import SetUp.Billing.Service.exception.ResourceNotFoundException;
import SetUp.Billing.Service.model.Plan;
import SetUp.Billing.Service.repository.PlanRepository;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PlanService {

    private final PlanRepository planRepository;
    private final ModelMapper modelMapper;

    public PlanService(PlanRepository planRepository, ModelMapper modelMapper) {
        this.planRepository = planRepository;
        this.modelMapper = modelMapper;
    }

    public List<PlanDto> getAllPlans() {
        return planRepository.findAll().stream()
                .map(plan -> modelMapper.map(plan, PlanDto.class))
                .collect(Collectors.toList());
    }

    public PlanDto getPlanById(String id) {
        Plan plan = planRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found with id: " + id));
        return modelMapper.map(plan, PlanDto.class);
    }

    public PlanDto createPlan(PlanDto planDto) {
        Plan plan = modelMapper.map(planDto, Plan.class);
        Plan savedPlan = planRepository.save(plan);
        return modelMapper.map(savedPlan, PlanDto.class);
    }

    public PlanDto updatePlan(String id, PlanDto planDto) {
        if (!planRepository.existsById(id)) {
            throw new ResourceNotFoundException("Plan not found with id: " + id);
        }

        Plan plan = modelMapper.map(planDto, Plan.class);
        plan.setId(id);
        Plan updatedPlan = planRepository.save(plan);
        return modelMapper.map(updatedPlan, PlanDto.class);
    }

    public void deletePlan(String id) {
        if (!planRepository.existsById(id)) {
            throw new ResourceNotFoundException("Plan not found with id: " + id);
        }
        planRepository.deleteById(id);
    }
}