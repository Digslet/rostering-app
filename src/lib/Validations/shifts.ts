import { z } from 'zod'
import {
    dateSchema,
    idSchema, 
    safeString, 
} from './common'

// --- CREATE SHIFT ---
export const createShiftSchema = z.object({
  wardId: idSchema,
  employeeId: idSchema.optional(), // Can be null (Open Shift)
  
  date: dateSchema,
  
  // LOGIC CHECK: Start vs End
  startTime: dateSchema,
  endTime: dateSchema,
  
  // Must link to a valid definition OR allow custom override
  shiftDefinitionId: idSchema.optional(), 
  
  notes: safeString.optional(),
}).refine((data) => data.endTime > data.startTime, {
  message: "End time must be after start time",
  path: ["endTime"], // Highlights the specific field in the UI form
})

// --- UPDATE SHIFT (Manager Action) ---
export const updateShiftSchema = z.object({
  shiftId: idSchema,
  
  // Managers can change time, status, or assign a person
  employeeId: idSchema.nullable().optional(), 
  startTime: dateSchema.optional(),
  endTime: dateSchema.optional(),
  
  // Status is strictly typed (matches your DB)
  status: z.enum(["PUBLISHED", "VOID", "SICK", "COMPLETED"]).optional(),
  
  // If marking as Sick, they MUST provide a Leave Category
  leaveCategoryId: idSchema.optional(),
  
}).refine((data) => {
  // LOGIC: If status is SICK, leaveCategoryId is required
  if (data.status === 'SICK' && !data.leaveCategoryId) {
    return false
  }
  return true
}, {
  message: "Leave Category is required when marking as Sick",
  path: ["leaveCategoryId"],
})