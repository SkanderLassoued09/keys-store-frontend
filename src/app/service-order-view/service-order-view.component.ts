import { Component } from "@angular/core";
import { CardWithImageComponent } from "../shared/components/cards/card-with-image/card-with-image/card-with-image.component";

@Component({
  selector: 'app-service-order-view',
  imports: [CardWithImageComponent],
  templateUrl: './service-order-view.component.html',
  styleUrl: './service-order-view.component.css'
})
export class ServiceOrderViewComponent {

}
