import { cycleService } from "../../services";
import { type CreateCycleInput } from "../../dtos";

export const cycleResolvers = {
  Query: {
    cycles: () => cycleService.getAllCycles(),

    cycle: (
      _: unknown,
      args: { id: number },
    ) => cycleService.getCycleById(args.id),
  },

  Mutation: {
    createCycle: (
      _: unknown,
      args: {
        input: CreateCycleInput 
      },
    ) => cycleService.createCycle(args.input),

    startCycle: (
      _: unknown,
      args: { id: number },
    ) => cycleService.startCycle(args.id),

    completeCycle: (
      _: unknown,
      args: { id: number },
    ) => cycleService.completeCycle(args.id),

    failCycle: (
      _: unknown,
      args: { id: number },
    ) => cycleService.failCycle(args.id),
  },
};