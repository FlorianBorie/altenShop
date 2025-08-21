import {
  Component,
  OnInit,
} from "@angular/core";
import { RouterModule } from "@angular/router";
import { SplitterModule } from 'primeng/splitter';
import { ToolbarModule } from 'primeng/toolbar';
import { PanelMenuComponent } from "./shared/ui/panel-menu/panel-menu.component";
import { CommonModule } from '@angular/common';
import { Observable } from "rxjs";
import { PanierService } from "./panier/panier.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  standalone: true,
  imports: [RouterModule, SplitterModule, ToolbarModule, PanelMenuComponent, CommonModule],
})
export class AppComponent implements OnInit{
  title = "ALTEN SHOP";

  totalQuantityPanier$!: Observable<number>;

  constructor(private readonly panierService: PanierService) {}

  ngOnInit() {
    this.totalQuantityPanier$ = this.panierService.getTotalQuantityPanier();
  }
}
