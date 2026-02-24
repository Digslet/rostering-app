import { AppError } from "../lib/errors";
import { Prisma } from "../db";

export async function safeServerAction<T>(action: () => Promise<T>) {
  try {
    const data = await action();
    return { success: true as const, data };
  } catch (error: any) {
    if (error instanceof AppError) {
      return {
        success: false as const,
        error: {
          type: error.code,
          message: error.message,
          statusCode: error.statusCode
        }
      };
    }

    // 2. Handle Prisma specific errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          return { success: false as const, error: { type: 'CONFLICT', message: "This time slot is already taken." } };
        case 'P2025':
          return { success: false as const, error: { type: 'NOT_FOUND', message: "The record you are trying to change no longer exists." } };
      }
    }

   // Fallback
    console.error("🚨 CRITICAL BUG:", error); 
    return {
      success: false as const,
      error: { 
        type: 'INTERNAL_ERROR', 
        message: "A system error occurred. Hospital IT has been notified." 
      }
    };
  }
}