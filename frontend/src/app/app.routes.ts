import { Routes } from '@angular/router';
import { CustomerLayoutComponent } from './components/layout/customer-layout/customer-layout.component';
import { HomeComponent } from './components/customer/home/home.component';
import { CategoryComponent } from './components/customer/category/category.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { LoginComponent } from './components/auth/login/login.component';

export const routes: Routes = [

  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  
  {
    path: '',
    component: CustomerLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'categories', component: CategoryComponent }
    ]
  },

  // WILDCARD (Angular standard)
  { path: '**', redirectTo: '' }
];
