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
    const validationError = this.validateLoan(loan);
    if (validationError) {
      loan.loanMessage = `Error: ${validationError}`;
      loan.loanMonths = [];
      loan.totalInterestPaid = 0;
      return;
    }

    // Parse and format inputs
    let principal: number = this.parseCurrency(loan.principal);
    let monRate: number = this.parseRate(loan.rate) / (12 * 100);
    let monPay: number = 0;

    // If loan length is given, calculate the monthly payment
    if (loan.termYears) {
      let termMon: number = this.parseInteger(loan.termYears) * 12;
      // Monthly Payment
      monPay = principal * (monRate / (1 - (1 + monRate) ** -termMon));
      loan.monthlyPayment =  monPay.toFixed(2);
    } else if (loan.monthlyPayment) {
      monPay = this.parseCurrency(loan.monthlyPayment);     
    }

    // Validate that monthly payment is sufficient to cover interest
    let firstMonthInterest = principal * monRate;
    if (monPay <= firstMonthInterest) {
      loan.loanMessage = "Error: Monthly payment is too low to cover interest. Loan will never be paid off.";
      loan.loanMonths = [];
      loan.totalInterestPaid = 0;
      return;
    }

    let oldPrincipal: number = principal;
    let newPrincipal: number = oldPrincipal;
    let parsedExtraPrincipal: number = this.parseCurrency(loan.extraPrincipalPayment || "0");

    let loanMonths: LoanMonth[] = new Array();
    let numOfMonths: number = 1;
    let totalInterestPaid: number = 0;

    // Add safety limit to prevent infinite loops
    const maxMonths = 1200; // 100 years maximum
    
    while (newPrincipal > 0 && numOfMonths <= maxMonths) {
        // Monthly Interest Payment
        let monInterestPay: number = newPrincipal * monRate;
        // Monthly Principal Payment
        let monPrincipalPay: number = monPay - monInterestPay;

        // Handle final payment (don't overpay)
        if (newPrincipal < monPrincipalPay + parsedExtraPrincipal) {
          monPrincipalPay = newPrincipal;
          parsedExtraPrincipal = 0;
        }

        newPrincipal = Math.max(0, oldPrincipal - monPrincipalPay - parsedExtraPrincipal);

        let loanMonth: LoanMonth = {
          monthNum: numOfMonths,
          principal: Math.round(oldPrincipal * 100) / 100,
          towardsInterest: Math.round(monInterestPay * 100) / 100,
          towardsPrincipal: Math.round((monPrincipalPay + parsedExtraPrincipal) * 100) / 100,
          newPrincipal: Math.round(newPrincipal * 100) / 100
        }
        loanMonths.push(loanMonth);

        oldPrincipal = newPrincipal;
        numOfMonths++;
        totalInterestPaid += monInterestPay;
    }

    if (numOfMonths > maxMonths) {
      loan.loanMessage = "Error: Loan term exceeds maximum calculation limit.";
      loan.loanMonths = [];
      loan.totalInterestPaid = 0;
      return;
    }

    let loanMessage: string;
    const totalMonths = numOfMonths - 1;
    if (totalMonths >= 12) {
      const years = Math.floor(totalMonths / 12);
      const months = totalMonths % 12;
      if (months === 0) {
        loanMessage = `Loan paid off in ${years} year${years !== 1 ? 's' : ''}.`;
      } else {
        loanMessage = `Loan paid off in ${years} year${years !== 1 ? 's' : ''} and ${months} month${months !== 1 ? 's' : ''}.`;
      }
    } else {
      loanMessage = `Loan paid off in ${totalMonths} month${totalMonths !== 1 ? 's' : ''}.`;
    }

    loan.loanMessage = loanMessage;
    loan.loanMonths = loanMonths;
    loan.totalInterestPaid = Math.round(totalInterestPaid * 100) / 100;
  }

  /**
   * Formats and parses a currency string to a number
   * Handles: $123,456.78, 123456.78, 123,456, etc.
   */
  private parseCurrency(value: string): number {
    if (!value) return 0;
    // Remove currency symbols, spaces, and commas
    const cleaned = value.replace(/[$,\s]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
  }

  /**
   * Formats and parses a percentage string to a decimal
   * Handles: 2.99%, 2.99, 0.0299, etc.
   */
  private parseRate(value: string): number {
    if (!value) return 0;
    // Remove percentage symbol and spaces
    const cleaned = value.replace(/[%\s]/g, '');
    const parsed = parseFloat(cleaned);
    if (isNaN(parsed)) return 0;
    
    // If the value is greater than 1, assume it's a percentage (e.g., 2.99)
    // If it's less than 1, assume it's already a decimal (e.g., 0.0299)
    return parsed > 1 ? parsed : parsed * 100;
  }

  /**
   * Formats and parses an integer string
   * Handles: "30", "30 years", "30.0", etc.
   */
  private parseInteger(value: string): number {
    if (!value) return 0;
    // Remove non-numeric characters except decimal point
    const cleaned = value.replace(/[^\d.]/g, '');
    const parsed = parseInt(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Validates that all required fields are present and valid
   */
  private validateLoan(loan: Loan): string | null {
    const principal = this.parseCurrency(loan.principal);
    const rate = this.parseRate(loan.rate);
    
    if (principal <= 0) {
      return "Principal amount must be greater than 0";
    }
    
    if (rate <= 0) {
      return "Interest rate must be greater than 0";
    }
    
    if (!loan.termYears && !loan.monthlyPayment) {
      return "Either term years or monthly payment must be provided";
    }
    
    if (loan.termYears && this.parseInteger(loan.termYears) <= 0) {
      return "Term years must be greater than 0";
    }
    
    if (loan.monthlyPayment && this.parseCurrency(loan.monthlyPayment) <= 0) {
      return "Monthly payment must be greater than 0";
    }
    
    return null;
  }
}
