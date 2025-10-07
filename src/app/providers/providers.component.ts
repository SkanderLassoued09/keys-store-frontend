import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { ComponentCardComponent } from "../shared/components/common/component-card/component-card.component";
import { InputFieldComponent } from "../shared/components/form/input/input-field.component";
import { LabelComponent } from "../shared/components/form/label/label.component";

@Component({
  selector: "app-providers",
  imports: [
    CommonModule,
    ComponentCardComponent,
    LabelComponent,
    InputFieldComponent,
  ],
  templateUrl: "./providers.component.html",
  styleUrl: "./providers.component.css",
})
export class ProvidersComponent {}
