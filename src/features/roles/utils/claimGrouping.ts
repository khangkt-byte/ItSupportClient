import type { ClaimDto } from '@/types/data';

export interface ClaimGroup {
    category: string;
    claims: ClaimDto[];
}

export function groupClaimsByCategory(claims: ClaimDto[]): ClaimGroup[] {
    const groups = new Map<string, ClaimDto[]>();

    claims.forEach((claim) => {
        const fallbackCategory = claim.claim?.split('.')?.[0];
        const category = claim.category || fallbackCategory || 'Other';

        if (!groups.has(category)) {
            groups.set(category, []);
        }

        groups.get(category)?.push(claim);
    });

    return Array.from(groups.entries())
        .map(([category, grouped]) => ({ category, claims: grouped }))
        .sort((a, b) => {
            if (a.category === 'Admin') return -1;
            if (b.category === 'Admin') return 1;
            return a.category.localeCompare(b.category);
        });
}