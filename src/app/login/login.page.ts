import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { LoadingController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})

export class LoginPage implements OnInit {

  private url           = 'https://jsonplaceholder.typicode.com/todos/'; 
  usuario:any           = null;
  todos_inscritos       = [];

  constructor(
    private storage: Storage,
    public loadingController: LoadingController,
    private  http: HttpClient,
    public alertController: AlertController
  ) { }

  ngOnInit() {
  }

  // Esse methodo irá checar no localStorage se o usuario existe
  async authenticate( username:string, password:any ){

    const autenticando = await this.loadingController.create({
      message: 'Conectando...',
      spinner:'dots',
      translucent: true,
      cssClass: 'b-color'
    });
    autenticando.present();

    let user = username;
    let pass = password;

    //Get De Autenticação
    this.http.get(`${this.url}`) .subscribe(async (result: any) => {

      if ( result ){

        autenticando.onDidDismiss();

        const sincronizando = await this.loadingController.create({
          message: 'Sincronizando...',
          spinner:'dots',
          translucent: true,
          cssClass: 'b-color'
        });
        sincronizando.present();

        //Aqui caso o usuario esteja cadastrado ele atualiza o storage dos inscritos
        this.http.get(`${this.url}`).subscribe( async ( result: any ) => {

          if ( result ){

            this.todos_inscritos = result;

            await this.storage.set('todosInscritos', this.todos_inscritos);

            sincronizando.onDidDismiss();
            window.location.href='/tabs/tab1';

          } else {
            
          }
        });

        // window.location.href='/tabs/tab1';
      } else {

        autenticando.onDidDismiss();
        var response = {
          "status"  : 404,
          "message" : 'Usuario nao encontrado na base de dados',
          "data"    : {"describe": new Error()}
        } 
        
        console.log(response);
        const alert = await this.alertController.create({
          header: 'Login',
          message: response.message,
          buttons: ['Entendi.']
        });
  
        await alert.present();
      }

    }, async ( Error ) => {

      var response = {
        "status"  : 404,
        "message" : 'Usuario não Encontrado.',
        "data"    : {"describe": Error}
      } 

      console.log(response);
      const alert = await this.alertController.create({
        header: 'Login',
        message: response.message,
        buttons: ['Entendi.']
      });
  
      await alert.present();

    });

    
    // this.storage.get('usuario').then( async ( res ) => {
    //   this.usuario = [res];
    //   let arr_usuario = this.usuario.map( item => item.item );
    //   for ( let i in arr_usuario ) {

    //     if ( arr_usuario[i].username == user && arr_usuario[i].password == pass ) {
    //       const loading = this.loadingController.create({
    //         message: 'Por favor Aguarde',
    //       });


    //       if(window.location.href='/tabs/tab1'){

    //       }
            
    //     }
    //     alert('Conta incorreta');
    //   }
    // });
  }

}
