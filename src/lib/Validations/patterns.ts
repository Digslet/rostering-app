import { z } from 'zod'
import {
    dateSchema, 
    idSchema, 
    safeString 
} from './common'

// --- ASSIGN PATTERN (The Timeline) ---
export const assignPatternSchema = z.object({
  employeeId: idSchema,
  patternId: idSchema,
  
  anchorDate: dateSchema,
  
  startDate: dateSchema,
  endDate: dateSchema.nullable().optional(),
  
}).refine((data) => {
  if (data.endDate && data.endDate <= data.startDate) {
    return false
  }
  return true
}, {
  message: "End date must be after start date",
  path: ["endDate"],
})

// --- CREATE PATTERN BLUEPRINT ---
export const createPatternSchema = z.object({
  wardId: idSchema,
  name: safeString,
  
  cycleLength: z.number().int().min(1).max(365),
  
  items: z.array(z.object({
    dayOffset: z.number().int().min(0), // 0 = Day 1
    shiftDefinitionId: idSchema,
  }))
}).refine((data) => {
  // You can't have a shift on Day 15 if cycle is 14 days.
  return data.items.every(item => item.dayOffset < data.cycleLength)
}, {
  message: "Shift offset cannot exceed cycle length",
  path: ["items"],
})