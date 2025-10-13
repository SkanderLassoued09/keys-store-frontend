import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ComponentCardComponent } from "../../shared/components/common/component-card/component-card.component";
import { LabelComponent } from "../../shared/components/form/label/label.component";
import { InputFieldComponent } from "../../shared/components/form/input/input-field.component";
import { DropdownComponent } from "../../shared/components/ui/dropdown/dropdown.component";

@Component({
  selector: "app-articles",
  imports: [
    CommonModule,
    ComponentCardComponent,
    LabelComponent,
    InputFieldComponent,
    DropdownComponent,
  ],
  templateUrl: "./articles.component.html",
  styleUrl: "./articles.component.css",
})
export class ArticlesComponent {
  // --- Dropdown states ---
  isTypeOpen = false;
  isCategorieOpen = false;
  isFournisseurOpen = false;

  // --- Selected values ---
  selectedType = "Clé";
  selectedCategorie = "Accessoire";
  selectedFournisseur = "Local Supplier";

  // --- Lists ---
  typeList = ["Clé", "Télécommande", "Machine", "Composant", "Outil"];
  categorieList = ["Accessoire", "Électronique", "Mécanique", "Logiciel"];
  fournisseurList = ["Local Supplier", "Xhorse", "OBDSTAR", "Autel", "Abrites"];

  // --- Methods ---
  toggleDropdown(name: string) {
    this.isTypeOpen = name === "type" ? !this.isTypeOpen : false;
    this.isCategorieOpen = name === "categorie" ? !this.isCategorieOpen : false;
    this.isFournisseurOpen = name === "fournisseur" ? !this.isFournisseurOpen : false;
  }

  selectValue(field: string, value: string) {
    if (field === "type") this.selectedType = value;
    if (field === "categorie") this.selectedCategorie = value;
    if (field === "fournisseur") this.selectedFournisseur = value;
    this.isTypeOpen = this.isCategorieOpen = this.isFournisseurOpen = false;
  }
}
