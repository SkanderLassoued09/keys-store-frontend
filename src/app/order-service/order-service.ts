import { Component } from '@angular/core';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Dialog } from 'primeng/dialog';
import { InputNumber } from "primeng/inputnumber";
import { Select } from "primeng/select";

@Component({
    selector: 'app-order-service',
    imports: [TableModule, Button, Dialog, InputNumber, Select],
    templateUrl: './order-service.html',
    styleUrl: './order-service.scss'
})
export class OrderService {
showDialog(_t85: any) {
throw new Error('Method not implemented.');
}
visible: boolean = false;
qty: number = 1;
 employee: string[] | undefined = [
  "Anis",
  "Mohamed",
  "Elyes",
  "Nezih",
  "Hamouda"
];
  employeList: any;

confirmQty() {
  console.log("confirme quantity function works");
}


selectedItem() {
    console.log("working");
     this.visible = true;
}
ngOnInit() {
       this.employeList= this.employee;
    }

}
