import { Component } from "@angular/core";
import { LabelComponent } from "../shared/components/form/label/label.component";
import { CommonModule } from "@angular/common";
import { ComponentCardComponent } from "../shared/components/common/component-card/component-card.component";
import { InputFieldComponent } from "../shared/components/form/input/input-field.component";

@Component({
  selector: "app-client",
  imports: [
    CommonModule,
    ComponentCardComponent,
    LabelComponent,
    InputFieldComponent,
  ],
  templateUrl: "./client.component.html",
  styleUrl: "./client.component.css",
})
export class ClientComponent {}
