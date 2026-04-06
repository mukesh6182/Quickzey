import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDeliveryPartnerComponent } from './add-delivery-partner.component';

describe('AddDeliveryPartnerComponent', () => {
  let component: AddDeliveryPartnerComponent;
  let fixture: ComponentFixture<AddDeliveryPartnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddDeliveryPartnerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddDeliveryPartnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
