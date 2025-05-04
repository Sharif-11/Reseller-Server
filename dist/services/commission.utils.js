"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ReferralService {
    constructor() {
        // Predefined commission table (1-based index = referral level)
        this.commissionTable = [
            [], // Level 0 (unused)
            [
                // Level 1 commissions
                { startPrice: 0, endPrice: 500, commission: 2 },
                { startPrice: 500, endPrice: 1000, commission: 3 },
                { startPrice: 1000, endPrice: Infinity, commission: 5 },
            ],
            [
                // Level 2 commissions
                { startPrice: 0, endPrice: 200, commission: 2 },
                { startPrice: 200, endPrice: 1000, commission: 5 },
                { startPrice: 1000, endPrice: Infinity, commission: 10 },
            ],
            // Add more levels as needed
        ];
    }
    /**
     * Calculates referral commission based on level and total price
     * @param referralLevel The 1-based level of the referral
     * @param totalPrice The total price of the transaction
     * @returns The fixed commission amount based on price range
     */
    calculateReferralCommission(referralLevel, totalPrice) {
        // Validate inputs
        if (referralLevel <= 0 || totalPrice <= 0) {
            return 0;
        }
        // Check if referral level exists in table
        if (referralLevel >= this.commissionTable.length ||
            !this.commissionTable[referralLevel]) {
            return 0;
        }
        // Get the commission tiers for this level
        const levelTiers = this.commissionTable[referralLevel];
        // Find the applicable tier
        const applicableTier = levelTiers.find(tier => totalPrice >= tier.startPrice && totalPrice < tier.endPrice);
        // Return the fixed commission amount or 0 if no tier matches
        return applicableTier ? applicableTier.commission : 0;
    }
}
exports.default = new ReferralService();
