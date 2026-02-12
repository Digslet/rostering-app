import { z } from 'zod'
import {
  hexColorSchema, 
  idSchema, 
  safeString, 
} from './common'

export const createShiftDefinitionSchema = z.object({
  // Scope: Must have ONE parent
  departmentId: idSchema.optional(),
  wardId: idSchema.optional(),
  
  name: safeString,
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:MM format"), // "07:00"
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:MM format"),
  
  colorCode: hexColorSchema.optional(),
}).refine((data) => !!data.departmentId !== !!data.wardId, {
  message: "Must be assigned to EITHER a Department OR a Ward (not both, not neither)",
  path: ["wardId"],
})

export const createMatrixRequirementSchema = z.object({
  wardId: idSchema,
  shiftDefinitionId: idSchema,
  roleId: idSchema,
  
  // LOGIC: Targets must make sense
  minCount: z.number().int().min(0),
  targetCount: z.number().int().min(1),
}).refine((data) => data.targetCount >= data.minCount, {
  message: "Target count cannot be less than Minimum count",
  path: ["targetCount"],
})