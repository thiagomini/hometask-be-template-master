export const deposits = Object.freeze({
  canDeposit(depositAmount: number, totalAmountToPay: number): boolean {
    return depositAmount <= totalAmountToPay * 1.25;
  },
});
