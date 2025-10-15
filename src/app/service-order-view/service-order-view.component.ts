import { Component } from "@angular/core";
import { CardOneComponent } from "../shared/components/cards/card-with-image/card-one/card-one.component";
import { CardWithImageComponent } from "../shared/components/cards/card-with-image/card-with-image/card-with-image.component";

@Component({
  selector: 'app-service-order-view',
  standalone: true, 
  imports: [CardOneComponent, CardWithImageComponent],
  templateUrl: './service-order-view.component.html',
  styleUrls: ['./service-order-view.component.css']
})
export class ServiceOrderViewComponent {}
