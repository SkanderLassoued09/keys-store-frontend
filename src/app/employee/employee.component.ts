import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { ComponentCardComponent } from "../shared/components/common/component-card/component-card.component";
import { InputFieldComponent } from "../shared/components/form/input/input-field.component";
import { LabelComponent } from "../shared/components/form/label/label.component";

@Component({
  selector: "app-employee",
  imports: [
    CommonModule,
    ComponentCardComponent,
    LabelComponent,
    InputFieldComponent,
  ],
  templateUrl: "./employee.component.html",
  styleUrl: "./employee.component.css",
})
export class EmployeeComponent {}
