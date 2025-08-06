import { FormsModule } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LoanSummaryComponent } from './loan-summary.component';
import { Loan } from '../loan';

describe('LoanSummaryComponent', () => {
  let component: LoanSummaryComponent;
  let fixture: ComponentFixture<LoanSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule, FormsModule ],
      declarations: [ LoanSummaryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoanSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Loan Scenarios', () => {
    // Scenario 1: Simple Loan with no extra payments
    describe('Scenario 1: Simple Loan', () => {
      it('should correctly calculate values for a simple loan', () => {
        // Arrange
        const loan: Loan = {
          id: 1,
          principal: "100000",
          rate: "1.99",
          termYears: "30"
        };

        // Act
        component.loan = loan;
        component.calculate(loan);

        let EXPECTED_MONTHLY_PAYMENT = 369.12;
        let EXPECTED_TOTAL_INTEREST_PAID = 32883.06;

        // Assert - Fill in expected values here
        expect(component.loan.monthlyPayment).toBeCloseTo(EXPECTED_MONTHLY_PAYMENT);
        expect(component.loan.totalInterestPaid).toBeCloseTo(EXPECTED_TOTAL_INTEREST_PAID);
      });
    });

    // Scenario 2: Loan with extra payments
    describe('Scenario 2: Simple Loan with Extra Payments', () => {
      it('should correctly calculate values for a simple loan with extra payments', () => {
        // Arrange
        const loan: Loan = {
          id: 1,
          principal: "100000",
          rate: "1.99",
          termYears: "30",
          extraPrincipalPayment: "100"
        };

        // Act
        component.loan = loan;
        component.ngOnInit();
        component.calculate(loan);

        let EXPECTED_MONTHLY_PAYMENT = 369.12;
        let EXPECTED_TOTAL_INTEREST_PAID = 23491.83;

        // Assert - Fill in expected values here
        expect(component.loan.monthlyPayment).toBeCloseTo(EXPECTED_MONTHLY_PAYMENT);
        expect(component.loan.totalInterestPaid).toBeCloseTo(EXPECTED_TOTAL_INTEREST_PAID);
      });
    });

    // Scenario 3: Loan with different interest rate and term
    describe('Scenario 3: Different Interest Rate and Term', () => {
      it('should correctly calculate values for a loan with different rate and term', () => {
        // Arrange
        const loan: Loan = {
          id: 1,
          principal: "100000",
          rate: "3.99",
          termYears: "15"
        };

        // Act
        component.loan = loan;
        component.ngOnInit();
        component.calculate(loan);

        let EXPECTED_MONTHLY_PAYMENT = 739.19;
        let EXPECTED_TOTAL_INTEREST_PAID = 33053.64;

        // Assert - Fill in expected values here
        expect(component.loan.monthlyPayment).toBeCloseTo(EXPECTED_MONTHLY_PAYMENT);
        expect(component.loan.totalInterestPaid).toBeCloseTo(EXPECTED_TOTAL_INTEREST_PAID);
      });
    });

    // Add more scenarios as needed
    // Scenario 4: Edge case - very small loan amount
    describe('Scenario 4: Very Small Loan Amount', () => {
      it('should handle very small loan amounts correctly', () => {
        // Arrange
        const loan: Loan = {
          id: 1,
          principal: "100",
          rate: "1.99",
          termYears: "30"
        };

        // Act
        component.loan = loan;
        component.ngOnInit();
        component.calculate(loan);

        let EXPECTED_MONTHLY_PAYMENT = 0.37;
        let EXPECTED_TOTAL_INTEREST_PAID = 32.88;

        // Assert - Fill in expected values here
        expect(component.loan.monthlyPayment).toBeCloseTo(EXPECTED_MONTHLY_PAYMENT);
        expect(component.loan.totalInterestPaid).toBeCloseTo(EXPECTED_TOTAL_INTEREST_PAID);
      });
    });

    // Scenario 5: Edge case - zero interest rate (should behave like a simple division)
    describe('Scenario 5: Zero Interest Rate', () => {
      it('should handle zero interest rate correctly', () => {
        // Arrange
        const loan: Loan = {
          id: 1,
          principal: "100000",
          rate: "0",
          termYears: "30"
        };

        // Act
        component.loan = loan;
        component.ngOnInit();
        component.calculate(loan);

        let EXPECTED_MONTHLY_PAYMENT = 277.78;
        let EXPECTED_TOTAL_INTEREST_PAID = 0;

        // Assert - Fill in expected values here
        expect(component.loan.monthlyPayment).toBeCloseTo(EXPECTED_MONTHLY_PAYMENT);
        expect(component.loan.totalInterestPaid).toBeCloseTo(EXPECTED_TOTAL_INTEREST_PAID);
      });
    });
  });
});
