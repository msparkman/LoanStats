import { LoanMonth } from "./loan-month";

export interface Loan {
    principal: number;
    rate: number;
    termYears?: number;
    extraPrincipalPayment?: number;
    monthlyPayment?: number;
    loanMonths?: LoanMonth[];
    loanMessage?: string;
    totalInterestPaid?: number;
}