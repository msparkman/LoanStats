import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { LoanInputComponent } from './loan-input/loan-input.component';
import { LoanSummaryComponent } from './loan-summary/loan-summary.component';

@NgModule({
  declarations: [
    AppComponent,
    LoanInputComponent,
    LoanSummaryComponent
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
