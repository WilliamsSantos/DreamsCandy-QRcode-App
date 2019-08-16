import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})

export class LoginPage implements OnInit {

  usuario:any   = null;

  constructor(
    private storage: Storage
  ) { }

  ngOnInit() {
  }
  // Esse methodo irá checar no localStorage se o usuario existe
  autenticarUsuario( username:string, password:any ){

    let user = username;
    let pass = password;

    this.storage.get('usuario').then( ( res ) => {
      this.usuario = [res];
      let arr_usuario = this.usuario.map( item => item.item );
      for ( let i in arr_usuario ) {
        if ( arr_usuario[i].username == user && arr_usuario[i].password == pass ) {
          alert('Autenticado');
        }
        alert('Conta incorreta')
      }
    });
  }

  //Função desenvolvida apenas para fins de teste
  goHome(){
      window.location.href='/tabs/tab1'
  }
}
