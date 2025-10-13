import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { ComponentCardComponent } from "../shared/components/common/component-card/component-card.component";
import { InputFieldComponent } from "../shared/components/form/input/input-field.component";
import { LabelComponent } from "../shared/components/form/label/label.component";
import { DropdownComponent } from "../shared/components/ui/dropdown/dropdown.component";

@Component({
  selector: "app-machine",
  imports: [
    CommonModule,
    ComponentCardComponent,
    LabelComponent,
    InputFieldComponent,
    DropdownComponent,
  ],
  templateUrl: "./machine.component.html",
  styleUrl: "./machine.component.css",
})
export class MachineComponent {
  isStatusOpen = false;
  selectedStatus = "Active";

  statusList = ["Active", "In Maintenance", "Out of Service", "Sold"];

  toggleStatusDropdown() {
    this.isStatusOpen = !this.isStatusOpen;
  }

  selectStatus(status: string) {
    this.selectedStatus = status;
    this.isStatusOpen = false;
  }
}
