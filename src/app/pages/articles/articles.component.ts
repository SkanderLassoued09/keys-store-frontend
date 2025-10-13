import {  Component } from "@angular/core";
import { ComponentCardComponent } from "../../shared/components/common/component-card/component-card.component";
import { LabelComponent } from "../../shared/components/form/label/label.component";
import { CommonModule } from "@angular/common";
import { InputFieldComponent } from "../../shared/components/form/input/input-field.component";

@Component({
  selector: "app-articles",
  imports: [
    CommonModule,
    ComponentCardComponent,
    LabelComponent,
    InputFieldComponent,
  ],
  templateUrl: "./articles.component.html",
  styleUrl: "./articles.component.css",
})


export class ArticleComponent  {
   
  }
export class ArticlesComponent {}
