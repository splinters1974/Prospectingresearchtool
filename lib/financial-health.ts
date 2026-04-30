import type { CHCompanyProfile, CHCharge } from './companies-house';
import type { FinancialHealthCheck, FinancialHealthItem, HealthFlag } from '@/types/research';

function titleCase(s: string): string {
  return s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function statusItem(status?: string, hasInsolvencyHistory?: boolean): FinancialHealthItem {
  const s = (status ?? '').toLowerCase();

  if (['liquidation', 'administration', 'receivership', 'dissolved'].some((x) => s.includes(x))) {
    return {
      label: 'Company Status',
      value: titleCase(status ?? 'Unknown'),
      flag: 'red',
      detail: 'Company is not actively trading or is subject to insolvency proceedings',
    };
  }
  if (s.includes('voluntary-arrangement') || s.includes('voluntary arrangement')) {
    return {
      label: 'Company Status',
      value: 'Voluntary Arrangement',
      flag: 'red',
      detail: 'Company has entered a formal arrangement with creditors',
    };
  }
  if (s === 'dormant') {
    return {
      label: 'Company Status',
      value: 'Dormant',
      flag: 'amber',
      detail: 'Registered but not currently trading',
    };
  }
  if (s === 'active') {
    const flag: HealthFlag = hasInsolvencyHistory ? 'amber' : 'green';
    const detail = hasInsolvencyHistory
      ? 'Currently active, but has a history of insolvency proceedings on record'
      : 'Trading normally — no active insolvency proceedings';
    return { label: 'Company Status', value: 'Active', flag, detail };
  }
  return {
    label: 'Company Status',
    value: titleCase(status ?? 'Unknown'),
    flag: 'amber',
    detail: 'Status could not be confirmed — verify directly with Companies House',
  };
}

function ageItem(dateOfCreation: string): FinancialHealthItem {
  const years = (Date.now() - new Date(dateOfCreation).getTime()) / (1000 * 60 * 60 * 24 * 365.25);

  if (years < 1) {
    const months = Math.max(1, Math.round(years * 12));
    return {
      label: 'Company Age',
      value: `${months} month${months !== 1 ? 's' : ''}`,
      flag: 'amber',
      detail: 'Recently incorporated — limited trading history available for assessment',
    };
  }
  if (years < 3) {
    return {
      label: 'Company Age',
      value: `${Math.floor(years)} years`,
      flag: 'neutral',
      detail: 'Relatively new company — some caution warranted for large long-term commitments',
    };
  }
  return {
    label: 'Company Age',
    value: `${Math.floor(years)} years`,
    flag: 'green',
    detail: `Incorporated ${dateOfCreation} — established company with a trading history`,
  };
}

function accountsFilingItem(nextAccounts: NonNullable<NonNullable<CHCompanyProfile['accounts']>['next_accounts']>): FinancialHealthItem {
  if (nextAccounts.overdue) {
    return {
      label: 'Accounts Filing',
      value: 'OVERDUE',
      flag: 'red',
      detail: `Accounts were due ${nextAccounts.due_on ?? '(date unknown)'} and have not been filed — a statutory obligation`,
    };
  }
  if (nextAccounts.due_on) {
    const daysUntil = (new Date(nextAccounts.due_on).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (daysUntil < 30) {
      return {
        label: 'Accounts Filing',
        value: `Due ${nextAccounts.due_on}`,
        flag: 'amber',
        detail: 'Accounts due within 30 days — monitor for timely filing',
      };
    }
    return {
      label: 'Accounts Filing',
      value: 'Up to date',
      flag: 'green',
      detail: `Next accounts due ${nextAccounts.due_on}`,
    };
  }
  return {
    label: 'Accounts Filing',
    value: 'Up to date',
    flag: 'green',
    detail: 'No overdue accounts on record',
  };
}

function accountsTypeItem(type: string, madeUpTo?: string): FinancialHealthItem {
  const t = type.toLowerCase();
  const period = madeUpTo ? ` (year ending ${madeUpTo})` : '';

  if (t === 'full' || t === 'group') {
    return {
      label: 'Accounts Transparency',
      value: `${titleCase(type)} accounts`,
      flag: 'green',
      detail: `Full financial statements on public record${period}`,
    };
  }
  if (t === 'small' || t.includes('total-exemption')) {
    return {
      label: 'Accounts Transparency',
      value: 'Small company accounts',
      flag: 'neutral',
      detail: `Abridged accounts under small company exemption${period} — some financial detail omitted`,
    };
  }
  if (t.includes('micro')) {
    return {
      label: 'Accounts Transparency',
      value: 'Micro-entity accounts',
      flag: 'amber',
      detail: `Minimum statutory disclosure only${period} — turnover, assets and liabilities not publicly visible`,
    };
  }
  if (t === 'dormant') {
    return {
      label: 'Accounts Transparency',
      value: 'Dormant accounts',
      flag: 'amber',
      detail: `No trading activity reported${period}`,
    };
  }
  return {
    label: 'Accounts Transparency',
    value: titleCase(type),
    flag: 'neutral',
    detail: `Accounts type: ${type}${period}`,
  };
}

function chargesItem(charges: CHCharge[]): FinancialHealthItem {
  const outstanding = charges.filter((c) =>
    (c.status ?? '').toLowerCase().includes('outstanding')
  );
  const total = charges.length;

  if (total === 0) {
    return {
      label: 'Registered Charges',
      value: 'None',
      flag: 'green',
      detail: 'No charges registered at Companies House — no secured borrowing on record',
    };
  }
  if (outstanding.length === 0) {
    return {
      label: 'Registered Charges',
      value: `${total} (all satisfied)`,
      flag: 'neutral',
      detail: `${total} historical charge${total !== 1 ? 's' : ''} registered, all subsequently satisfied or discharged`,
    };
  }

  const creditors = outstanding
    .flatMap((c) => c.persons_entitled ?? [])
    .map((p) => p.name)
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 3)
    .join(', ');

  const flag: HealthFlag = outstanding.length >= 5 ? 'red' : outstanding.length >= 3 ? 'amber' : 'neutral';

  const chargeTypes = outstanding
    .map((c) => c.classification?.type)
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i)
    .map((t) => titleCase(t!))
    .join(', ');

  const detail = [
    chargeTypes ? `Type: ${chargeTypes}` : null,
    creditors ? `Charged to: ${creditors}${outstanding.length > 3 ? ' and others' : ''}` : null,
  ]
    .filter(Boolean)
    .join(' · ') || `${outstanding.length} outstanding charge${outstanding.length !== 1 ? 's' : ''} secured against company assets`;

  return {
    label: 'Registered Charges',
    value: `${outstanding.length} outstanding${total > outstanding.length ? ` (${total - outstanding.length} satisfied)` : ''}`,
    flag,
    detail,
  };
}

export function computeFinancialHealth(
  companyStatus: string | undefined,
  dateOfCreation: string | undefined,
  profile: CHCompanyProfile | null,
  charges: CHCharge[]
): FinancialHealthCheck {
  const items: FinancialHealthItem[] = [];

  items.push(statusItem(companyStatus, profile?.has_insolvency_history));

  if (dateOfCreation) {
    items.push(ageItem(dateOfCreation));
  }

  const nextAccounts = profile?.accounts?.next_accounts;
  if (nextAccounts && (nextAccounts.due_on || nextAccounts.overdue !== undefined)) {
    items.push(accountsFilingItem(nextAccounts));
  }

  if (profile?.accounts?.last_accounts?.type) {
    items.push(accountsTypeItem(
      profile.accounts.last_accounts.type,
      profile.accounts.last_accounts.made_up_to
    ));
  }

  items.push(chargesItem(charges));

  const flags = items.map((i) => i.flag);
  const overallFlag: 'green' | 'amber' | 'red' = flags.includes('red')
    ? 'red'
    : flags.includes('amber')
    ? 'amber'
    : 'green';

  const headline =
    overallFlag === 'red'
      ? 'Significant risk indicators found — review before proceeding'
      : overallFlag === 'amber'
      ? 'Some items warrant attention — see details below'
      : 'No significant risk indicators in public filing data';

  return {
    overallFlag,
    headline,
    items,
    disclaimer:
      'Based on public Companies House data only. Does not include CCJs, payment behaviour, or third-party credit agency data. For a full credit check use Creditsafe or Experian Business.',
  };
}
