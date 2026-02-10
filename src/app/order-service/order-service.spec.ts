import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderService } from './order-service';

describe('OrderService', () => {
  let component: OrderService;
  let fixture: ComponentFixture<OrderService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
