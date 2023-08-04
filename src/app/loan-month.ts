export interface LoanMonth {
    monthNum: number;
    principal: number;
    monthlyPayment?: number;
    towardsInterest?: number;
    towardsPrincipal?: number;
    newPrincipal?: number;
}