import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceOrderViewComponent } from './service-order-view.component';

describe('ServiceOrderViewComponent', () => {
  let component: ServiceOrderViewComponent;
  let fixture: ComponentFixture<ServiceOrderViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceOrderViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceOrderViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
