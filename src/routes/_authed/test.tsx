import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { auth } from '@clerk/tanstack-react-start/server';
import { useState } from 'react';
import { requireTenantAuth } from '../../middleware/auth';
import { globalPrisma } from '../../db';
import { syncEmployeeClerkMetadata } from '../../utils/clerkSync';

// ==========================================
// 1. SECURE SERVER FUNCTIONS
// ==========================================

// This function proves our zero-trust architecture works.
// Notice how we don't pass an orgId in the query. The middleware injects it.
const fetchSecureDashboardData = createServerFn({ method: 'GET' })
  .middleware([requireTenantAuth])
  .handler(async ({ context }) => {
    
    // Attempting to fetch locations. If the middleware fails, it will leak all 3 Orgs.
    // If it works, it will only return Org 1's locations!
    const locations = await context.db.location.findMany({
      include: { department: true }
    });
    
    const shiftCount = await context.db.shiftInstance.count();

    return {
      success: true,
      activeTenantId: context.orgId,
      locationsFound: locations.length,
      totalShiftsFound: shiftCount,
      locations: locations.map(l => l.name)
    };
  });

// This is a one-off utility just for development to push our seeded DB roles into the Clerk JWT cache.
const forceDevSync = createServerFn({ method: 'POST' })
  .handler(async () => {
    const session = await auth();
    if (!session.userId) throw new Error("Not logged in");

    const employee = await globalPrisma.employee.findFirst({
      where: { userId: session.userId, archivedAt: null }
    });

    if (!employee) throw new Error("No employee record found for your Clerk ID. Did you update the seed script?");

    await syncEmployeeClerkMetadata(globalPrisma, employee.id);
    return "Permissions successfully synced to Clerk!";
  });

// ==========================================
// 2. FRONTEND UI
// ==========================================

export const Route = createFileRoute('/_authed/test')({
  component: TestSandbox,
});

function TestSandbox() {
  const [dbResult, setDbResult] = useState<any>(null);
  const [syncMessage, setSyncMessage] = useState<string>('');

  const handleSync = async () => {
    try {
      setSyncMessage('Syncing...');
      const res = await forceDevSync();
      setSyncMessage(res);
    } catch (e: any) {
      setSyncMessage(e.message);
    }
  };

  const handleTestDb = async () => {
    try {
      const res = await fetchSecureDashboardData();
      setDbResult(res);
    } catch (e: any) {
      setDbResult({ error: e.message });
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Backend Architecture Sandbox</h1>
      <p className="text-gray-500">Test the middleware, tenant isolation, and Clerk integrations.</p>

      {/* Step A: Sync Metadata */}
      <div className="p-6 border rounded-xl bg-slate-50">
        <h2 className="text-xl font-bold mb-2">Step A: Initialize Clerk JWT</h2>
        <p className="text-sm mb-4">Because we seeded the database manually, Clerk doesn't know you are an Org Admin yet. Click this to trigger the backend sync utility.</p>
        <button 
          onClick={handleSync}
          className="bg-purple-600 text-white px-4 py-2 rounded shadow hover:bg-purple-700"
        >
          Push Database Roles to Clerk
        </button>
        {syncMessage && <p className="mt-4 font-mono text-sm text-purple-700">{syncMessage}</p>}
      </div>

      {/* Step B: Test the Middleware */}
      <div className="p-6 border rounded-xl bg-slate-50">
        <h2 className="text-xl font-bold mb-2">Step B: Test Zero-Trust Database Query</h2>
        <p className="text-sm mb-4">This calls a Server Function protected by `requireTenantAuth`. It should strictly return only the data belonging to Organization 1.</p>
        <button 
          onClick={handleTestDb}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
        >
          Execute Secure DB Call
        </button>
        
        {dbResult && (
          <div className="mt-4 p-4 bg-gray-900 text-green-400 font-mono text-sm rounded overflow-auto">
            <pre>{JSON.stringify(dbResult, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}