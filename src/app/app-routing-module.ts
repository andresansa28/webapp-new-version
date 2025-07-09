import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Dashboard } from './components/dashboard/dashboard';
import { Deployments } from './components/deployments/deployments';
import { Users } from './components/users/users';
 

const routes: Routes = [
  { path: 'dashboard', component: Dashboard },
  { path: 'deployments', component: Deployments },
  { path: 'users', component: Users },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})



export class AppRoutingModule { }
