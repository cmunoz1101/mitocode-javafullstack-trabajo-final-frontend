import { Component, OnInit } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from './../../../environments/environment';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {

  nombreUsuario: string;
  roles: string;

  constructor() { }

  ngOnInit(): void {

    const accessToken = sessionStorage.getItem(environment.TOKEN_NAME);
    const helper = new JwtHelperService();
    const decodedToken = helper.decodeToken(accessToken);
    let rolesConcatenados = '';

    this.nombreUsuario = decodedToken.user_name;

    decodedToken.authorities.forEach((rol: string, index: number) => {
      if (index === Object.keys(decodedToken.authorities).length - 1) {
        rolesConcatenados += rol;
      } else {
        rolesConcatenados += `${rol}, `;
      }
    });
    this.roles = rolesConcatenados;
  }

}
