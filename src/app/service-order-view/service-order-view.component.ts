import { Component } from "@angular/core";
import { CardOneComponent } from "../shared/components/cards/card-with-image/card-one/card-one.component";

@Component({
  selector: 'app-service-order-view',
  standalone: true, 
  imports: [CardOneComponent],
  templateUrl: './service-order-view.component.html',
  styleUrls: ['./service-order-view.component.css']
})
export class ServiceOrderViewComponent {}
