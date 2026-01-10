import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Gender, RelationshipType } from '@prisma/client';

export interface MuslimHeirShares {
    [key: string]: number; // PersonId -> Percentage
}

export interface CalculationResult {
    shares: MuslimHeirShares;
    remainingEstate: number;
    warnings: string[];
}

@Injectable()
export class MuslimLawService {
    constructor(private prisma: PrismaService) { }

    /**
     * Refined calculation of heir shares (Faraid)
     * Implements the 2/3 (or rest) distribution logic
     */
    calculateHeirShares(estateValue: number, survivors: any[]): CalculationResult {
        let remainingEstate = estateValue;
        const shares: MuslimHeirShares = {};
        const warnings: string[] = [];

        // Helper to find people
        const getPerson = (rel: string) => survivors.filter(p => p.relationship === rel);
        const hasPerson = (rel: string) => getPerson(rel).length > 0;

        const sons = getPerson('SON');
        const daughters = getPerson('DAUGHTER');
        const father = getPerson('FATHER')[0];
        const mother = getPerson('MOTHER')[0];
        const spouse = getPerson('SPOUSE')[0];

        const hasChildren = sons.length > 0 || daughters.length > 0;

        // --- STEP 1: SPOUSE (Sharer) ---
        // Husband dies (Wife survives): 1/8 if children, 1/4 if no children
        // Wife dies (Husband survives): 1/4 if children, 1/2 if no children
        // Note: Assuming "Spouse" relationship implies gender opposite to testator, 
        // but better to check testator gender if available. 
        // For now, using standard generic 'Spouse' shares which often default to Wife's share (1/8 or 1/4)
        // or we need testator gender passed in.

        // We will assume standard Husband dies scenario as default unless specified
        if (spouse) {
            const shareFraction = hasChildren ? 0.125 : 0.25; // 1/8 or 1/4
            shares[spouse.id] = estateValue * shareFraction;
            remainingEstate -= shares[spouse.id];
        }

        // --- STEP 2: PARENTS (Sharers) ---
        if (hasChildren) {
            if (father) {
                shares[father.id] = estateValue * (1 / 6); // 16.66%
                remainingEstate -= shares[father.id];
            }
            if (mother) {
                shares[mother.id] = estateValue * (1 / 6); // 16.66%
                remainingEstate -= shares[mother.id];
            }
        } else {
            // If no children, Mother gets 1/3 (or 1/3 of residue if spouse exists - Umariyyat case)
            // Father gets residue. 
            // Simplified for "parents share in son's property" query as requested
            if (mother) {
                shares[mother.id] = estateValue * (1 / 3);
                remainingEstate -= shares[mother.id];
            }
        }

        // --- STEP 3: CHILDREN (Residuaries) ---
        const sonsCount = sons.length;
        const daughtersCount = daughters.length;

        if (sonsCount > 0 || daughtersCount > 0) {
            // Residue distributed 2:1 ratio
            const totalUnits = (sonsCount * 2) + (daughtersCount * 1);

            // Prevent division by zero if logic fails
            if (totalUnits > 0 && remainingEstate > 0) {
                const valuePerUnit = remainingEstate / totalUnits;

                sons.forEach(son => {
                    shares[son.id] = valuePerUnit * 2;
                });

                daughters.forEach(daughter => {
                    shares[daughter.id] = valuePerUnit * 1;
                });

                // Everything distributed
                remainingEstate = 0;
            }
        } else {
            // If no children, Father (if alive) is residuary
            if (father) {
                shares[father.id] = (shares[father.id] || 0) + remainingEstate;
                remainingEstate = 0;
            }
            // If father not alive, siblings come into picture (not implemented yet)
            else {
                warnings.push('No primary residuary (Son/Father) found. Estate may go to distant relatives.');
            }
        }

        return { shares, remainingEstate, warnings };
    }

    /**
     * Validate 1/3 rule (Wasiyat Limit)
     */
    validateBequestLimit(totalEstateValue: number, bequestsValue: number): boolean {
        const oneThird = totalEstateValue / 3;
        return bequestsValue <= oneThird;
    }
}
