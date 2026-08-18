using BusinessPlanSimulator.Application.DTOs.Financial;

namespace BusinessPlanSimulator.Application.Interfaces;

public interface IFinancialCalculatorService
{
    SimulationResultDto RunSimulation(FinancialInputDto input);
}