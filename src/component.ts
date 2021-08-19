import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AuthGuard } from './auth/auth.guard';

import { DashboardComponent } from "./pages/dashboard/dashboard.component";
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';


const routes: Routes = [
  {
    path: "dashboard",
    canActivate: [AuthGuard],
    component: DashboardComponent,
    loadChildren: () =>
      import("./pages/dashboard/dashboard.module").then(m => m.DashboardModule)
  },
  {
    path: "auth",
    canActivate: [AuthGuard],
    loadChildren: () =>
      import("./auth/auth.module").then(m => m.AuthModule)
  },
  { 
    path: "",
    pathMatch: "full",
    redirectTo: "/dashboard"
  },
  { 
    path: '**',
    canActivate: [AuthGuard],
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
