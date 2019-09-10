import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { LoadingController, NavController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { Tab1Page } from '../tab1/tab1.page';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})

export class LoginPage implements OnInit {

  private url               = 'https://5d77b5ad1e31aa00149a34f3.mockapi.io/inscrito'; 
  protected todos_inscritos = [];
  protected usuario         = { login:null, senha:null}

  constructor(
    private storage: Storage,
    public loadingController: LoadingController,
    private  http: HttpClient,
    public alertController: AlertController,
    public navCtrl: NavController
  ) { }

  ngOnInit() {
  }

  // Esse methodo irá checar no localStorage se o usuario existe
  async authenticate(){

    let autenticando = await this.loadingController.create({
      message: 'Conectando...',
      spinner:'dots',
      translucent: true,
      cssClass: 'b-color'
    });
    autenticando.present();

    //Get De Autenticação
    this.http.get(`${this.url}`).subscribe(async (result: any) => {

      //  "id": [1..6], "title": "delectus aut autem"
      //  result.find ( item => item.title == this.usuario.login) && result.find( item => item.id == this.usuario.senha )
      if (result){

        autenticando.onDidDismiss();

        let sincronizando = await this.loadingController.create({
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

            sincronizando.onDidDismiss();
            var response = {
              "status"  : 404,
              "message" : 'Falha ao sincronizar os dados.',
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

      autenticando.onDidDismiss();

      var response = {
        "status"  : 500,
        "message" : 'Falha na conexão.',
        "data"    : {"describe": new Error()}
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
