import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild } from "@angular/core";
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


export class DropdownComponent implements AfterViewInit, OnDestroy {
    @Input() className = '';
    @Input() isOpen = false;
    @Output() close = new EventEmitter<void>();
 
    @ViewChild('dropdownRef') dropdownRef!: ElementRef<HTMLDivElement>;
 
    private handleClickOutside = (event: MouseEvent) => {
      if (
        this.isOpen &&
        this.dropdownRef &&
        this.dropdownRef.nativeElement &&
        !this.dropdownRef.nativeElement.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest('.dropdown-toggle')
      ) {
        this.close.emit();
      }
    };
 
    ngAfterViewInit() {
      document.addEventListener('mousedown', this.handleClickOutside);
    }
 
    ngOnDestroy() {
      document.removeEventListener('mousedown', this.handleClickOutside);
    }
  }
export class ArticlesComponent {}
