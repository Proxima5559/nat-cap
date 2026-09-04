// src/services/cycle.service.ts

import { asc, eq } from "drizzle-orm";

import { db } from "../config/database";
import { cycles } from "../database/schema";
import { ErrorsUtil } from "../utils";
import {
  createCycleDto,
  cycleResponseDto,
  type CreateCycleInput,
  type CycleResponse,
} from "../dtos";

export class CycleService {
  async getAllCycles(): Promise<CycleResponse[]> {
    const result = await db
      .select()
      .from(cycles)
      .orderBy(asc(cycles.createdAt));

    return result.map((cycle) => cycleResponseDto.parse(cycle));
  }

  async getCycleById(id: number): Promise<CycleResponse | null> {
    const result = await db
      .select()
      .from(cycles)
      .where(eq(cycles.id, id))
      .limit(1);

    const cycle = result[0];

    if (!cycle) {
      return null;
    }

    return cycleResponseDto.parse(cycle);
  }

  async createCycle(input: CreateCycleInput): Promise<CycleResponse> {
    const validatedInput = createCycleDto.parse(input);

    const result = await db
      .insert(cycles)
      .values({
        seed: validatedInput.seed,
        status: "created",
        createdAt: new Date(),
        completedAt: null,
      })
      .returning();

    const cycle = result[0];

    if (!cycle) {
      throw new ErrorsUtil.CreationFailedError("Failed to create cycle", 400);
    }

    return cycleResponseDto.parse(cycle);
  }

  async startCycle(id: number): Promise<CycleResponse | null> {
    const result = await db
      .update(cycles)
      .set({
        status: "running",
      })
      .where(eq(cycles.id, id))
      .returning();

    const cycle = result[0];

    if (!cycle) {
      return null;
    }

    return cycleResponseDto.parse(cycle);
  }

  async completeCycle(id: number): Promise<CycleResponse | null> {
    const result = await db
      .update(cycles)
      .set({
        status: "completed",
        completedAt: new Date(),
      })
      .where(eq(cycles.id, id))
      .returning();

    const cycle = result[0];

    if (!cycle) {
      return null;
    }

    return cycleResponseDto.parse(cycle);
  }

  async failCycle(id: number): Promise<CycleResponse | null> {
    const result = await db
      .update(cycles)
      .set({
        status: "failed",
      })
      .where(eq(cycles.id, id))
      .returning();

    const cycle = result[0];

    if (!cycle) {
      return null;
    }

    return cycleResponseDto.parse(cycle);
  }
}

export const cycleService = new CycleService();