import type { ApiListResponse, AuditEntry } from '../../types';

const delay = () => new Promise<void>((r) => setTimeout(r, 150 + Math.random() * 150));

const _log: AuditEntry[] = [
  { id: 'AUD-001', timestamp: '2026-05-15 08:30', adminUsername: 'Funmi Adewale', actionType: 'LOAN_APPROVED',    affectedId: 'LN-2026-040', description: 'Approved Short-Term Loan ₦200,000 for Fatima Bello' },
  { id: 'AUD-002', timestamp: '2026-05-14 14:12', adminUsername: 'Funmi Adewale', actionType: 'LOAN_APPROVED',    affectedId: 'LN-2026-039', description: 'Approved Property Loan ₦1,200,000 for James Adeyemi' },
  { id: 'AUD-003', timestamp: '2026-05-14 11:55', adminUsername: 'Funmi Adewale', actionType: 'LOAN_REJECTED',    affectedId: 'LN-2026-038', description: 'Rejected Car Loan ₦800,000 for Chidinma Eze — Savings balance insufficient' },
  { id: 'AUD-004', timestamp: '2026-05-13 09:00', adminUsername: 'Funmi Adewale', actionType: 'SETTINGS_SAVED',   affectedId: 'SYSTEM',       description: 'Updated loan parameters: max multiplier set to 3×, property rate 7%' },
  { id: 'AUD-005', timestamp: '2026-05-13 08:45', adminUsername: 'Funmi Adewale', actionType: 'LOAN_APPROVED',    affectedId: 'LN-2026-037', description: 'Approved IOU ₦20,000 for Musa Garba' },
  { id: 'AUD-006', timestamp: '2026-05-12 16:30', adminUsername: 'Funmi Adewale', actionType: 'MEMBER_UPDATED',   affectedId: 'FAAN-2014-0056', description: 'Updated contact details for Bello Suleiman' },
];

export async function getAuditLog(): Promise<ApiListResponse<AuditEntry>> {
  await delay();
  return { data: [..._log].reverse(), meta: { total: _log.length, page: 1, perPage: 50 } };
}

export function addAuditEntry(entry: Omit<AuditEntry, 'id'>): void {
  _log.push({ ...entry, id: `AUD-${Date.now()}` });
}
