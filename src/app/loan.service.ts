import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Loan } from './loan';

@Injectable({
  providedIn: 'root'
})
export class LoanService {
  private apiUrl = 'http://localhost:13000';

  constructor(private http: HttpClient) { }

  getAllLoans(): Observable<{loan: Loan[]}> {
    return this.http.get<{loan: Loan[]}>(`${this.apiUrl}/`);
  }

  saveLoan(loan: Loan): Observable<{message: string}> {
    const loanData = {
      name: loan.name,
      principal: this.parseCurrency(loan.principal),
      rate: this.parseRate(loan.rate),
      termYears: loan.termYears ? this.parseInteger(loan.termYears) : null,
      monthlyPayment: loan.monthlyPayment ? this.parseCurrency(loan.monthlyPayment) : null,
      extraMonthlyPayment: loan.extraPrincipalPayment ? this.parseCurrency(loan.extraPrincipalPayment) : 0
    };
    
    return this.http.post<{message: string}>(`${this.apiUrl}/`, loanData);
  }

  private parseCurrency(value: string): number {
    if (!value) return 0;
    const cleaned = value.replace(/[$,\s]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
  }

  private parseRate(value: string): number {
    if (!value) return 0;
    const cleaned = value.replace(/[%\s]/g, '');
    const parsed = parseFloat(cleaned);
    if (isNaN(parsed)) return 0;
    return parsed > 1 ? parsed : parsed * 100;
  }

  private parseInteger(value: string): number {
    if (!value) return 0;
    const cleaned = value.replace(/[^\d.]/g, '');
    const parsed = parseInt(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
}
