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
import { AddManagerComponent } from './components/admin/add-manager/add-manager.component';
import { ManageUsersComponent } from './components/admin/manage-users/manage-users.component';
import { ForgotPasswordComponent } from './components/auth/forgot-password/forgot-password.component';
import { VerifyOtpFpComponent } from './components/auth/verify-otp-fp/verify-otp-fp.component';
import { ResetPasswordComponent } from './components/auth/reset-password/reset-password.component';
import { AddCategoryComponent } from './components/admin/add-category/add-category.component';
import { ManageCategoryComponent } from './components/admin/manage-category/manage-category.component';
import { AddSubCategoryComponent } from './components/admin/add-subcategory/add-subcategory.component';
import { ManageSubcategoryComponent } from './components/admin/manage-subcategory/manage-subcategory.component';
import { AddProductComponent as AdminAddProductComponent } from './components/admin/add-product/add-product.component';
import { AddProductComponent as ManagerAddProductComponent } from './components/manager/add-product/add-product.component';

import { ManageProductComponent as ManageAdminProductComponent} from './components/admin/manage-product/manage-product.component';
import { ManageProductComponent as ManageManagerProductComponent} from './components/manager/manage-product/manage-product.component';
import { ManagerDashboardComponent } from './components/manager/manager-dashboard/manager-dashboard.component';
import { ManagerLayoutComponent } from './components/layout/manager-layout/manager-layout.component';
import { ProductListComponent } from './components/customer/product-list/product-list.component';
import { ViewCartComponent } from './components/customer/view-cart/view-cart.component';
import { ProductDetailsComponent } from './components/customer/product-details/product-details.component';
import { ProfileComponent } from './components/customer/profile/profile.component';
import { OrdersComponent } from './components/customer/orders/orders.component';
import { ManageOrdersComponent } from './components/manager/manage-orders/manage-orders.component';
import { AddDeliveryPartnerComponent } from './components/admin/add-delivery-partner/add-delivery-partner.component';
import { DeliveryLayoutComponent } from './components/layout/delivery-layout/delivery-layout.component';
import { DeliveriesComponent } from './components/delivery/deliveries/deliveries.component';

export const routes: Routes = [

  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'auth/google/callback', component: GooglecallbackComponent },
  { path: 'register/verify-otp',component:VerifyOtpComponent},
  { path: 'forgot-password',component:ForgotPasswordComponent},
  { path: 'forgot-password/verify-otp',component:VerifyOtpFpComponent},
  { path: 'forgot-password/reset-password',component:ResetPasswordComponent},
  {
    path: '',
    component: CustomerLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'categories', component: CategoryComponent },
      { path: 'products', component: ProductListComponent },
      { path: 'cart', component: ViewCartComponent },
      { path: 'product/:id', component: ProductDetailsComponent },
      { path: 'profile',component:ProfileComponent},
      { path: 'orders', component: OrdersComponent}

    ]
  },
  {
    path:'admin',
    component:AdminLayoutComponent,
    children:[ 
      { path: '',component :AdminDashboardComponent },
      { path: 'add-store' ,component:AddStoreComponent },
      { path: 'manage-store', component:ManageStoreComponent },
      { path: 'add-manager', component: AddManagerComponent },
      { path: 'manage-users', component: ManageUsersComponent },
      { path: 'add-category',component:AddCategoryComponent},
      { path: 'manage-categories',component:ManageCategoryComponent},
      { path: 'add-subcategory',component:AddSubCategoryComponent},
      { path: 'manage-subcategories',component:ManageSubcategoryComponent},
      { path: 'add-product',component:AdminAddProductComponent},
      { path: 'manage-product',component:ManageAdminProductComponent},
      { path: 'add-delivery-partner', component: AddDeliveryPartnerComponent },
    ]
  },
  {
    path:'manager',
    component:ManagerLayoutComponent,
    children:[ 
      { path: '',component :ManagerDashboardComponent },
      { path: 'add-product',component:ManagerAddProductComponent},
      { path: 'manage-product',component:ManageManagerProductComponent},
      { path: 'manage-orders',component:ManageOrdersComponent},
      
    ]
  },
  {
    path: 'delivery',
    component: DeliveryLayoutComponent,
     children:[ 
      { path: 'deliveries',component :DeliveriesComponent },
     ]
    
  },
  // WILDCARD (Angular standard)
  { path: '**', redirectTo: '' }
];

