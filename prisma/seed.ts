// prisma/seed.ts
import { globalPrisma } from '../src/db'

// --- Utilities ---
const today = new Date()
today.setUTCHours(0, 0, 0, 0)
const addDays = (date: Date, days: number) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000)

// Helper to determine if a date is the last Sunday of the month (Manual Rostering Rule)
const isLastSunday = (date: Date) => {
  if (date.getDay() !== 0) return false
  const nextWeek = new Date(date)
  nextWeek.setDate(date.getDate() + 7)
  return nextWeek.getMonth() !== date.getMonth()
}

const names = {
  first: ['Alice', 'Ben', 'Charlie', 'Diana', 'Ethan', 'Fiona', 'George', 'Hannah', 'Ian', 'Julia', 'Kevin', 'Lucy', 'Mark', 'Nina', 'Oliver', 'Penny'],
  last: ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas']
}
const getRandomName = () => ({
  f: names.first[Math.floor(Math.random() * names.first.length)],
  l: names.last[Math.floor(Math.random() * names.last.length)]
})

async function main() {
  console.info('🚀 Launching Deep Multi-Tenant Roster Seed...')

  try {
    // ==========================================
    // 0. SAFE WIPE (Strict Reverse Dependency Order)
    // ==========================================
    console.info('🧹 Wiping database...')
    await globalPrisma.$transaction([
      globalPrisma.auditLog.deleteMany(),
      globalPrisma.shiftClaim.deleteMany(),
      globalPrisma.shiftAdvertisement.deleteMany(),
      globalPrisma.leaveRequest.deleteMany(),
      globalPrisma.employeeAvailability.deleteMany(),
      globalPrisma.shiftInstance.deleteMany(),
      globalPrisma.assignedPattern.deleteMany(),
      globalPrisma.patternItem.deleteMany(),
      globalPrisma.rosterPattern.deleteMany(),
      globalPrisma.staffingRequirement.deleteMany(),
      globalPrisma.shiftDefinition.deleteMany(),
      globalPrisma.managementRole.deleteMany(), 
      globalPrisma.employeeLocationAffiliation.deleteMany(), 
      globalPrisma.employee.deleteMany(),
      globalPrisma.employeeRole.deleteMany(),
      globalPrisma.location.deleteMany(), 
      globalPrisma.department.deleteMany(),
      globalPrisma.leaveCategory.deleteMany(),
      globalPrisma.organization.deleteMany(),
      globalPrisma.user.deleteMany(), 
    ])

    // ==========================================
    // 1. ORGANIZATIONS LOOP (3 Orgs)
    // ==========================================
    for (let o = 1; o <= 3; o++) {
      console.info(`\n🏢 Building Organization ${o}...`)
      const org = await globalPrisma.organization.create({
        data: { name: `Healthcare Org ${o}`, settings: { tz: 'Pacific/Auckland' } }
      })

      // Standard Configs for this Org
      const leaveAnnual = await globalPrisma.leaveCategory.create({ data: { organizationId: org.id, name: 'Annual Leave', isPaid: true } })
      
      const roleAdmin = await globalPrisma.employeeRole.create({ data: { organizationId: org.id, name: 'Org Admin' } })
      const roleMgr = await globalPrisma.employeeRole.create({ data: { organizationId: org.id, name: 'Manager' } })
      const roleRN = await globalPrisma.employeeRole.create({ data: { organizationId: org.id, name: 'Registered Nurse' } })
      const roleHCA = await globalPrisma.employeeRole.create({ data: { organizationId: org.id, name: 'Health Care Assistant' } })

      // Create Org Admin (Layer 0 User + Layer 2 Employee + ManagementRole)
      const adminUserId = `clerk_admin_org${o}`
      await globalPrisma.user.create({
        data: { id: adminUserId, email: `admin.org${o}@hospital.local`, firstName: 'System', lastName: 'Admin' }
      })
      const orgAdmin = await globalPrisma.employee.create({
        data: { organizationId: org.id, userId: adminUserId, firstName: 'System', lastName: 'Admin', email: `admin.org${o}@hospital.local`, roleId: roleAdmin.id }
      })
      await globalPrisma.managementRole.create({
        data: { employeeId: orgAdmin.id, organizationId: org.id, level: 'ORG' }
      })

      // ==========================================
      // 2. DEPARTMENTS LOOP (2 Depts per Org)
      // ==========================================
      for (let d = 1; d <= 2; d++) {
        const dept = await globalPrisma.department.create({
          data: { organizationId: org.id, name: `Department ${d} (Org ${o})` }
        })

        const deptMgrUserId = `clerk_deptmgr_org${o}_dept${d}`
        await globalPrisma.user.create({
          data: { id: deptMgrUserId, email: `dept${d}.mgr.org${o}@hospital.local`, firstName: 'Dept', lastName: `Manager ${d}` }
        })
        const deptManager = await globalPrisma.employee.create({
          data: { organizationId: org.id, userId: deptMgrUserId, firstName: 'Dept', lastName: `Manager ${d}`, email: `dept${d}.mgr.org${o}@hospital.local`, roleId: roleMgr.id }
        })
        await globalPrisma.managementRole.create({
          data: { employeeId: deptManager.id, organizationId: org.id, departmentId: dept.id, level: 'DEPT' }
        })

        // ==========================================
        // 3. LOCATIONS LOOP (2 Locations per Dept)
        // ==========================================
        for (let w = 1; w <= 2; w++) {
          const location = await globalPrisma.location.create({
            data: { organizationId: org.id, departmentId: dept.id, name: `Location ${w} (Dept ${d})`, timezone: 'Pacific/Auckland' }
          })

          // Shift Definitions (Timezone safe integers: 420 = 7:00 AM)
          const shiftAM = await globalPrisma.shiftDefinition.create({ data: { organizationId: org.id, locationId: location.id, name: 'AM', startTimeMinutes: 420, durationMinutes: 510, colorCode: '#3b82f6' } })
          const shiftPM = await globalPrisma.shiftDefinition.create({ data: { organizationId: org.id, locationId: location.id, name: 'PM', startTimeMinutes: 900, durationMinutes: 510, colorCode: '#f59e0b' } })

          // Matrix
          await globalPrisma.staffingRequirement.create({ data: { organizationId: org.id, locationId: location.id, shiftDefinitionId: shiftAM.id, roleId: roleRN.id, minCount: 2, targetCount: 3 } })

          // Patterns
          const pattern = await globalPrisma.rosterPattern.create({
            data: {
              organizationId: org.id, locationId: location.id, name: 'Standard 4-2', cycleLength: 6,
              items: { create: [ { organizationId: org.id, dayOffset: 0, shiftDefinitionId: shiftAM.id }, { organizationId: org.id, dayOffset: 1, shiftDefinitionId: shiftAM.id } ] }
            }
          })

          // Location Manager
          const locMgrUserId = `clerk_locmgr_org${o}_dept${d}_loc${w}`
          await globalPrisma.user.create({
            data: { id: locMgrUserId, email: `loc${w}.dept${d}.mgr.org${o}@hospital.local`, firstName: 'Location', lastName: `Manager ${w}` }
          })
          const locManager = await globalPrisma.employee.create({
            data: { organizationId: org.id, userId: locMgrUserId, firstName: 'Location', lastName: `Manager ${w}`, email: `loc${w}.dept${d}.mgr.org${o}@hospital.local`, roleId: roleMgr.id }
          })
          
          // Link Manager to Location
          await globalPrisma.managementRole.create({ data: { employeeId: locManager.id, organizationId: org.id, locationId: location.id, level: 'LOCATION' } })
          await globalPrisma.employeeLocationAffiliation.create({ data: { organizationId: org.id, employeeId: locManager.id, locationId: location.id, isPrimary: true } })

          // ==========================================
          // 4. STAFFING LOOP (10 Staff per Location)
          // ==========================================
          const staffMembers = []
          for (let s = 1; s <= 10; s++) {
            const { f, l } = getRandomName()
            const role = s % 4 === 0 ? roleHCA : roleRN 
            const staffUserId = `clerk_staff${s}_org${o}_dept${d}_loc${w}`

            await globalPrisma.user.create({ data: { id: staffUserId, email: `staff${s}.l${w}.d${d}.o${o}@hospital.local`.toLowerCase(), firstName: f, lastName: `${l}-${s}` } })
            
            const employee = await globalPrisma.employee.create({
              data: { organizationId: org.id, userId: staffUserId, firstName: f, lastName: `${l}-${s}`, email: `staff${s}.l${w}.d${d}.o${o}@hospital.local`.toLowerCase(), roleId: role.id }
            })
            
            // Link Staff to Location via Affiliation Table
            await globalPrisma.employeeLocationAffiliation.create({ data: { organizationId: org.id, employeeId: employee.id, locationId: location.id, isPrimary: true } })
            
            staffMembers.push(employee)

            // Assign Pattern
            await globalPrisma.assignedPattern.create({
              data: { organizationId: org.id, employeeId: employee.id, patternId: pattern.id, anchorDate: addDays(today, 0), startDate: addDays(today, 0) }
            })
          }

          // ==========================================
          // 5. LIVE ROSTER 
          // ==========================================
          for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
            const shiftDate = addDays(today, dayOffset)
            if (isLastSunday(shiftDate)) continue; 

            // Calculate exact datetimes to satisfy PostgreSQL btree_gist constraints
            const amStart = new Date(shiftDate); amStart.setHours(7, 0, 0, 0);
            const amEnd = new Date(shiftDate); amEnd.setHours(15, 30, 0, 0);

            await globalPrisma.shiftInstance.create({
              data: {
                organizationId: org.id, locationId: location.id, shiftDefinitionId: shiftAM.id,
                startTime: amStart, endTime: amEnd, employeeId: staffMembers[0].id, status: 'PUBLISHED'
              }
            })
          }

        } // End Location Loop
      } // End Dept Loop

      // Decoupled Audit Log
      await globalPrisma.auditLog.create({
        data: { organizationId: org.id, actorId: adminUserId, action: 'SEED_COMPLETE', targetId: org.id, details: { status: 'Success' } }
      })

    } // End Org Loop

    console.info('✅ Database Seeded Successfully.')
    console.info('   Note: The test users have fake Clerk IDs (e.g. `clerk_admin_org1`).')
    console.info('   To log in locally, you must either update a test user with your real Clerk ID, or register via the UI.')

  } catch (error: unknown) {
    console.error('❌ FATAL SEED ERROR:')
    console.error(error)
    process.exit(1)
  }
}

main().finally(async () => { await globalPrisma.$disconnect() })