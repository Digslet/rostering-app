import { clerkClient } from '@clerk/tanstack-react-start/server';
import { AppError } from '../lib/errors'; 

export async function syncEmployeeClerkMetadata(db: any, employeeId: string) {
  const employee = await db.employee.findUniqueOrThrow({
    where: { id: employeeId },
    include: {
      affiliations: { where: { archivedAt: null } },
      managementRoles: { where: { archivedAt: null } }
    }
  });

  if (!employee.userId) return; 

  const readLocs = employee.affiliations.map((a: any) => a.locationId);
  const manageDepts = employee.managementRoles.filter((r: any) => r.level === 'DEPT').map((r: any) => r.targetId);
  const manageLocs = employee.managementRoles.filter((r: any) => r.level === 'LOCATION').map((r: any) => r.targetId);

  const payload = {
    manage: { departments: manageDepts, locations: manageLocs },
    read: { departments: [], locations: readLocs }
  };

  try {
    const client = clerkClient();
    
    await client.organizations.updateOrganizationMembershipMetadata({
      organizationId: employee.organizationId,
      userId: employee.userId,
      publicMetadata: payload
    });
  } catch (error) {
    console.error("Clerk Sync Failed:", error);
    throw new AppError("DB updated, but token sync delayed.", "INTERNAL_ERROR", 500);
  }
}