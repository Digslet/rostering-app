import { prisma, Prisma } from '../src/db'

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
    // 0. SAFE WIPE (Reverse Dependency Order)
    // ==========================================
    console.info('🧹 Wiping database...')
    await prisma.$transaction([
      prisma.auditLog.deleteMany(),
      prisma.shiftClaim.deleteMany(),
      prisma.shiftAdvertisement.deleteMany(),
      prisma.leaveRequest.deleteMany(),
      prisma.employeeAvailability.deleteMany(),
      prisma.shiftInstance.deleteMany(),
      prisma.assignedPattern.deleteMany(),
      prisma.patternItem.deleteMany(),
      prisma.rosterPattern.deleteMany(),
      prisma.staffingRequirement.deleteMany(),
      prisma.shiftDefinition.deleteMany(),
      prisma.employee.deleteMany(),
      prisma.employeeRole.deleteMany(),
      prisma.ward.deleteMany(),
      prisma.department.deleteMany(),
      prisma.leaveCategory.deleteMany(),
      prisma.organization.deleteMany(),
    ])

    // ==========================================
    // 1. ORGANIZATIONS LOOP (3 Orgs)
    // ==========================================
    for (let o = 1; o <= 3; o++) {
      console.info(`\n🏢 Building Organization ${o}...`)
      const org = await prisma.organization.create({
        data: { name: `Healthcare Org ${o}`, settings: { tz: 'Pacific/Auckland' } }
      })

      // Standard Configs for this Org
      const leaveAnnual = await prisma.leaveCategory.create({ data: { organizationId: org.id, name: 'Annual Leave', isPaid: true } })
      const leaveSick = await prisma.leaveCategory.create({ data: { organizationId: org.id, name: 'Sick Leave', isPaid: true } })
      
      const roleAdmin = await prisma.employeeRole.create({ data: { organizationId: org.id, name: 'Org Admin' } })
      const roleMgr = await prisma.employeeRole.create({ data: { organizationId: org.id, name: 'Manager' } })
      const roleRN = await prisma.employeeRole.create({ data: { organizationId: org.id, name: 'Registered Nurse' } })
      const roleHCA = await prisma.employeeRole.create({ data: { organizationId: org.id, name: 'Health Care Assistant' } })

      // Create Org Admins (Predictable IDs for Clerk bypassing)
      await prisma.employee.create({
        data: {
          organizationId: org.id, firstName: 'System', lastName: 'Admin', email: `admin.org${o}@hospital.local`,
          userId: `test_admin_org${o}`, accessLevel: 'ORG_ADMIN', roleId: roleAdmin.id,
          managedOrganizations: { connect: [{ id: org.id }] }
        }
      })

      // ==========================================
      // 2. DEPARTMENTS LOOP (4 Depts per Org)
      // ==========================================
      for (let d = 1; d <= 4; d++) {
        const dept = await prisma.department.create({
          data: { organizationId: org.id, name: `Department ${d} (Org ${o})` }
        })

        const deptManager = await prisma.employee.create({
          data: {
            organizationId: org.id, firstName: 'Dept', lastName: `Manager ${d}`, email: `dept${d}.mgr.org${o}@hospital.local`,
            userId: `test_deptmgr_org${o}_dept${d}`, accessLevel: 'DEPT_MANAGER', roleId: roleMgr.id,
            homeDepartmentId: dept.id, managedDepartments: { connect: [{ id: dept.id }] }
          }
        })

        // ==========================================
        // 3. WARDS LOOP (3 Wards per Dept)
        // ==========================================
        for (let w = 1; w <= 3; w++) {
          const ward = await prisma.ward.create({
            data: { departmentId: dept.id, name: `Ward ${w} (Dept ${d})` }
          })

          // Shift Definitions
          const shiftAM = await prisma.shiftDefinition.create({ data: { wardId: ward.id, name: 'AM', startTime: '07:00', endTime: '15:30', colorCode: '#3b82f6' } })
          const shiftPM = await prisma.shiftDefinition.create({ data: { wardId: ward.id, name: 'PM', startTime: '15:00', endTime: '23:30', colorCode: '#f59e0b' } })

          // Matrix
          await prisma.staffingRequirement.create({ data: { wardId: ward.id, shiftDefinitionId: shiftAM.id, roleId: roleRN.id, minCount: 2, targetCount: 3 } })

          // Patterns
          const pattern = await prisma.rosterPattern.create({
            data: {
              wardId: ward.id, name: 'Standard 4-2', cycleLength: 6,
              items: { create: [ { dayOffset: 0, shiftDefinitionId: shiftAM.id }, { dayOffset: 1, shiftDefinitionId: shiftAM.id } ] }
            }
          })

          // Ward Manager
          const wardManager = await prisma.employee.create({
            data: {
              organizationId: org.id, firstName: 'Ward', lastName: `Manager ${w}`, email: `ward${w}.mgr.org${o}@hospital.local`,
              userId: `test_wardmgr_org${o}_dept${d}_ward${w}`, accessLevel: 'WARD_MANAGER', roleId: roleMgr.id,
              homeDepartmentId: dept.id, homeWardId: ward.id, managedWards: { connect: [{ id: ward.id }] }
            }
          })

          // ==========================================
          // 4. STAFFING LOOP (12 Staff per Ward)
          // ==========================================
          const staffMembers = []
          for (let s = 1; s <= 12; s++) {
            const isCasual = s >= 11 // 10 Pattern Staff, 2 Casual Pool
            const { f, l } = getRandomName()
            const role = s % 4 === 0 ? roleHCA : roleRN // Mix of RNs and HCAs

            const employee = await prisma.employee.create({
              data: {
                organizationId: org.id, firstName: f, lastName: `${l}-${s}`, email: `staff${s}.w${w}.d${d}.o${o}@hospital.local`.toLowerCase(),
                userId: `test_staff${s}_org${o}_dept${d}_ward${w}`, accessLevel: 'EMPLOYEE', roleId: role.id,
                homeDepartmentId: dept.id, homeWardId: ward.id
              }
            })
            staffMembers.push(employee)

            if (!isCasual) {
              await prisma.assignedPattern.create({
                data: { employeeId: employee.id, patternId: pattern.id, anchorDate: addDays(today, 0), startDate: addDays(today, 0) }
              })
            } else {
              // Casuals add availability instead of patterns
              await prisma.employeeAvailability.create({
                data: { employeeId: employee.id, date: addDays(today, 2), preference: 'AVAILABLE', preferredWards: { connect: [{ id: ward.id }] } }
              })
            }
          }

          // ==========================================
          // 5. LIVE ROSTER & EDGE CASES
          // ==========================================
          for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
            const shiftDate = addDays(today, dayOffset)

            // RULE INTERCEPTION: Skip automated roster generation on the last Sunday of the month
            if (isLastSunday(shiftDate)) {
               continue; 
            }

            // Standard Published Shift
            await prisma.shiftInstance.create({
              data: {
                organizationId: org.id, wardId: ward.id, date: shiftDate, shiftDefinitionId: shiftAM.id,
                startTime: shiftDate, endTime: shiftDate, employeeId: staffMembers[0].id, status: 'PUBLISHED'
              }
            })

            // Open Shift Marketplace Logic
            if (dayOffset === 2 || dayOffset === 4) {
              const openShift = await prisma.shiftInstance.create({
                data: {
                  organizationId: org.id, wardId: ward.id, date: shiftDate, shiftDefinitionId: shiftPM.id,
                  startTime: shiftDate, endTime: shiftDate, employeeId: null, status: 'OPEN'
                }
              })

              const ad = await prisma.shiftAdvertisement.create({
                data: {
                  organizationId: org.id, wardId: ward.id, shiftInstanceId: openShift.id, date: shiftDate,
                  shiftDefinitionId: shiftPM.id, allowedRoles: { connect: [{ id: roleRN.id }] }
                }
              })

              // Casual staff claims the open shift
              await prisma.shiftClaim.create({
                data: { shiftAdvertisementId: ad.id, employeeId: staffMembers[10].id, status: 'PENDING', targetManagerId: wardManager.id }
              })
            }
          }

          // Leave Edge Cases (Approved Leave + Voided Shift)
          const leaveDate = addDays(today, 5)
          await prisma.leaveRequest.create({
            data: { employeeId: staffMembers[2].id, categoryId: leaveAnnual.id, startDate: leaveDate, endDate: leaveDate, status: 'APPROVED' }
          })
          
          await prisma.shiftInstance.create({
            data: {
              organizationId: org.id, wardId: ward.id, date: leaveDate, shiftDefinitionId: shiftAM.id,
              startTime: leaveDate, endTime: leaveDate, employeeId: staffMembers[2].id, status: 'VOID' // Voided due to leave
            }
          })

        } // End Ward Loop
      } // End Dept Loop

      // Audit Log for the Org
      await prisma.auditLog.create({
        data: { organizationId: org.id, actorId: (await prisma.employee.findFirst({ where: { organizationId: org.id, accessLevel: 'ORG_ADMIN' } }))!.id, action: 'SEED_COMPLETE', targetId: org.id, details: { status: 'Success' } }
      })

    } // End Org Loop

    console.info('✅ Database Seeded Successfully. You can now log in using the `test_*` userIds.')

  } catch (error: unknown) {
    console.error('❌ FATAL SEED ERROR:')
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error(`Database Error Code: ${error.code} | Details: ${error.message}`)
    } else if (error instanceof Error) {
      console.error(error.stack)
    } else {
      console.error('An unknown failure occurred during seeding.')
    }
    process.exit(1)
  }
}

main().finally(async () => { await prisma.$disconnect() })