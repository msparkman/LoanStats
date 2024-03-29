import { LoanMonth } from "./loan-month";

export interface Loan {
    principal: string;
    rate: string;
    termYears?: string;
    extraPrincipalPayment?: string;
    monthlyPayment?: string;
    loanMonths?: LoanMonth[];
    loanMessage?: string;
    totalInterestPaid?: number;
}