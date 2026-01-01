import { Routes } from '@angular/router';
import { CustomerLayoutComponent } from './components/layout/customer-layout/customer-layout.component';
import { HomeComponent } from './components/customer/home/home.component';
import { CategoryComponent } from './components/customer/category/category.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { LoginComponent } from './components/auth/login/login.component';
import { GooglecallbackComponent } from './components/auth/googlecallback/googlecallback.component';
import { VerifyOtpComponent } from './components/auth/verify-otp/verify-otp.component';
import { AdminLayoutComponent } from './components/layout/admin-layout/admin-layout.component';
import { Component } from '@angular/core';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { AddStoreComponent } from './components/admin/add-store/add-store.component';
import { ManageStoreComponent } from './components/admin/manage-store/manage-store.component';

export const routes: Routes = [

  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'auth/google/callback', component: GooglecallbackComponent },
  { path: 'register/verify-otp',component:VerifyOtpComponent},
  {
    path: '',
    component: CustomerLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'categories', component: CategoryComponent }
    ]
  },
  {
    path:'admin',
    component:AdminLayoutComponent,
    children:[ 
      { path: '',component :AdminDashboardComponent },
      { path: 'add-store' ,component:AddStoreComponent },
      { path: 'manage-store', component:ManageStoreComponent }
    ]
  },

  // WILDCARD (Angular standard)
  { path: '**', redirectTo: '' }
];
