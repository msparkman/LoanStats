import { Component } from '@angular/core';
import { Loan } from '../loan';
import { LoanMonth } from '../loan-month';

@Component({
  selector: 'app-loan-summary',
  templateUrl: './loan-summary.component.html',
  styleUrls: ['./loan-summary.component.css']
})
export class LoanSummaryComponent {
  loan: Loan = {
    principal: "126,000.00",
    rate: "2.99",
    termYears: "30"
  };

  calculate(loan: Loan): void {
    let principal: number = Math.round(parseFloat(loan.principal) * 100) / 100;

    // Monthly Rate
    let monRate: number = parseFloat(loan.rate) / (12 * 100);
    let monPay: number = 0;

    // If loan length is given, calculate the monthly payment
    if (loan.termYears) {
      let termMon: number = parseInt(loan.termYears) * 12;
      // Monthly Payment
      monPay = principal * (monRate / (1 - (1 + monRate) ** -termMon));
      loan.monthlyPayment = monPay.toString();
    } else if (loan.monthlyPayment) {
      monPay = parseFloat(loan.monthlyPayment);     
    }

    let oldPrincipal: number = principal;
    let newPrincipal: number = oldPrincipal;
    let parsedExtraPrincipal: number = parseFloat(loan.extraPrincipalPayment ? loan.extraPrincipalPayment : "0");

    let loanMonths: LoanMonth[] = new Array();
    let numOfMonths: number = 1;
    let totalInterestPaid: number = 0;
    while (newPrincipal > 0) {
        // Monthly Interest Payment
        let monInterestPay: number = newPrincipal * monRate;
        // Monthly Principal Payment
        let monPrincipalPay: number = monPay - monInterestPay;

        newPrincipal = oldPrincipal - monPrincipalPay - parsedExtraPrincipal;
        let loanMonth: LoanMonth = {
          monthNum: numOfMonths,
          principal: oldPrincipal,
          towardsInterest: monInterestPay,
          towardsPrincipal: +monPrincipalPay + +parsedExtraPrincipal,
          newPrincipal: newPrincipal
        }
        loanMonths.push(loanMonth);

        oldPrincipal = newPrincipal;
        numOfMonths++;
        totalInterestPaid += monInterestPay;
    }

    let loanMessage: string;
    if (numOfMonths / 12 > 1) {
      loanMessage = `Loan paid off in ${Math.trunc(numOfMonths / 12)} years and ${(numOfMonths % 12) - 1} months.`;
    } else {
      loanMessage = `Loan paid off in ${numOfMonths} months.`;
    }
    loan.loanMessage = loanMessage;
    loan.loanMonths = loanMonths;
    loan.totalInterestPaid = totalInterestPaid;
  }
}
