import { Routes } from "@angular/router";
import { ProductListComponent } from "./features/product-list/product-list.component";

export const PRODUCTS_ROUTES: Routes = [
	{
		path: "",
		component: ProductListComponent,
	},
	{ path: "**", redirectTo: "" },
];
