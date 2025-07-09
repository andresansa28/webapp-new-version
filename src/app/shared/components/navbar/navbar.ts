import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  analyzerRunning: boolean = true; // TODO: leggi questo dal backend o websocket

  logout() {
    // TODO: chiama Keycloak logout o altro metodo
    console.log('Logout');
  }
}
