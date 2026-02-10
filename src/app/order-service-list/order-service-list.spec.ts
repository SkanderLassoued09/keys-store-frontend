import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderServiceList } from './order-service-list';

describe('OrderServiceList', () => {
  let component: OrderServiceList;
  let fixture: ComponentFixture<OrderServiceList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderServiceList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderServiceList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
