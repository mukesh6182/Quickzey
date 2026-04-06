import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyOtpFpComponent } from './verify-otp-fp.component';

describe('VerifyOtpFpComponent', () => {
  let component: VerifyOtpFpComponent;
  let fixture: ComponentFixture<VerifyOtpFpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerifyOtpFpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerifyOtpFpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
