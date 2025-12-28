import { Routes } from '@angular/router';
import { CustomerLayoutComponent } from './components/layout/customer-layout/customer-layout.component';
import { HomeComponent } from './components/customer/home/home.component';
import { CategoryComponent } from './components/customer/category/category.component';


export const routes: Routes = [
    {
        path:'',
        component:CustomerLayoutComponent,
        children:[
            {path:'',component:HomeComponent},
            {path:'categories',component:CategoryComponent}         
        ]
    },
    {
        path:'*',redirectTo:''
    }

];
