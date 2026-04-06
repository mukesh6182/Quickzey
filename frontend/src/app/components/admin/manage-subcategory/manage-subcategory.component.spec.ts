import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageSubcategoryComponent } from './manage-subcategory.component';

describe('ManageSubcategoryComponent', () => {
  let component: ManageSubcategoryComponent;
  let fixture: ComponentFixture<ManageSubcategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageSubcategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageSubcategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
