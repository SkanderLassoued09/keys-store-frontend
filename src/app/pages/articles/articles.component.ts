import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ComponentCardComponent } from "../../shared/components/common/component-card/component-card.component";
import { LabelComponent } from "../../shared/components/form/label/label.component";
import { InputFieldComponent } from "../../shared/components/form/input/input-field.component";
import { DropdownComponent } from "../../shared/components/ui/dropdown/dropdown.component";
import { FormControl, FormGroup, FormsModule } from "@angular/forms";
import { ButtonComponent } from "../../shared/components/ui/button/button.component";
import { ArticlesService } from "../../articles.service";
import { HttpClient, HttpClientModule } from "@angular/common/http";

@Component({
  selector: "app-articles",
  imports: [
    HttpClientModule,
    CommonModule,
    ComponentCardComponent,
    LabelComponent,
    InputFieldComponent,
    DropdownComponent,
    FormsModule,
    ButtonComponent,
  ],
  providers: [ArticlesService],
  templateUrl: "./articles.component.html",
  styleUrl: "./articles.component.css",
})
export class ArticlesComponent {
  isLoading: boolean = false;
  constructor(private readonly articlesService: ArticlesService) {}
  articleData: any = {
    nom: "",
    reference: "",
    type: "",
    categorie: "",
    fournisseur: "",
    prixAchat: 0,
    prixVente: 0,
    quantiteStock: 0,
    quantiteBoutique: 0,
  };
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
    this.isFournisseurOpen =
      name === "fournisseur" ? !this.isFournisseurOpen : false;
  }

  updateArticle(field: string, value: any) {
    this.articleData[field] = value;
    // console.log(`Updated ${field}:`, value);
    console.log("Current article data:", this.articleData);
  }

  selectValue(field: string, value: any) {
    this.articleData[field] = value;
    if (field === "type") this.selectedType = value;
    if (field === "categorie") this.selectedCategorie = value;
    if (field === "fournisseur") this.selectedFournisseur = value;
    this.isTypeOpen = this.isCategorieOpen = this.isFournisseurOpen = false;
    console.log("Current article data:", this.articleData);
  }

  saveArticle() {
    // Optional: show loading spinner
    this.isLoading = true;

    this.articlesService.saveArticle(this.articleData).subscribe({
      next: (data) => {
        console.log("✅ Article saved successfully:", data);
        this.isLoading = false;

        // Optional: reset form or show a success message
        // this.articleData = { ...initial values };
      },
      error: (err) => {
        console.error("❌ Error saving article:", err);
        this.isLoading = false;

        // Optional: show an error notification
      },
    });
  }
}
