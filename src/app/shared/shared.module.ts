// src/app/shared/shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Angular Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Componenti condivisi
import { Navbar } from './components/navbar/navbar';
import { DeploymentsModel } from './deploymentsModel';

import { MaterialModule } from '../material/material-module';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    Navbar
  ],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    MaterialModule,
    RouterModule,
    MatProgressSpinnerModule
  ],
  exports: [
    Navbar,
    RouterModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule
  ]
})
export class SharedModule {}
