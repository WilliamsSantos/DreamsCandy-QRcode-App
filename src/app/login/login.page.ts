import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { LoadingController, NavController } from '@ionic/angular';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AlertController } from '@ionic/angular';

import { AppModule } from '../app.module';

import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})

export class LoginPage implements OnInit {

  private sincronizando:any = AppModule.sincronizando();
  private url               = AppModule.getInscritos();
  private url_login         = AppModule.postLogin();

  protected todos_inscritos:any;
  private autenticando:any;

  constructor(
    private storage: Storage,
    public  loadingController: LoadingController,
    private http: HttpClient,
    public  alertController: AlertController,
    public  navCtrl: NavController,
  ) { }

  ngOnInit() {
    // Limpa o token
    this.storage.set('acess_token', '');
  }

  // Esse methodo irá checar no localStorage se o usuario existe
  async authenticate(form: NgForm){

    this.autenticando = await this.loadingController.create({
      message: 'Conectando...',
      spinner:'dots',
      translucent: true,
      cssClass: 'b-color'
    });
    this.autenticando.present();

    const loginData = {
      'login'     : form.value.login, 
      'password'  : form.value.password
    }

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      })
    }

    this.http.post(`${this.url_login}`, JSON.stringify(loginData), httpOptions ).subscribe(
      async (auth) => {
        if ( auth['cod'] == 200 && auth['status'] == 'sucess' ){
          this.autenticando.style.display = 'none';
          this.sincronizando = await this.loadingController.create({
            message     : 'Sincronizando...',
            spinner     :'dots',
            translucent : true,
            cssClass    : 'b-color'
          });
          this.sincronizando.present();

            // Cria sessao usuario
            if ( await this.storage.set('acess_token', auth['data']['usuarioToken']) ){
              this.getTodosInscritos();
              // Chamo a função que dá Get nos inscritos
                // if ( await this.getTodosInscritos()) window.location.href='/tabs/tab1';
                // this.getTodosInscritos();
            };
          } else {

          this.autenticando.style.display = 'none';
          var response = {
            "status"  : 404,
            "message" : 'Usuario nao encontrado na base de dados',
            "data"    : {"describe": new Error()}
          } 

          this.alerta( response.message);
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  getTodosInscritos(){
    //Aqui caso o usuario esteja cadastrado ele atualiza o storage dos inscritos
    this.http.get(`${this.url}`).subscribe( async ( result: any ) => {

      if ( result ) {

        this.todos_inscritos = result['data'];
        this.storage.set('todosInscritos', []);
        await this.storage.set('todosInscritos', this.todos_inscritos);

        window.location.href='/tabs/tab1';

        return true;
      } else {

        this.sincronizando.style.display = 'none';
        var response = {
          "status"  : 404,
          "message" : 'Falha ao sincronizar os dados. Por favor Tente novamente!',
          "data"    : {"describe": new Error()}
        } 

        this.alerta( response.message);
        return false;
      }
    });
    return true;
  }

  // Utils
  async alerta( mensagem ){

    const alert = await this.alertController.create({
      header: 'Login',
      message: mensagem,
      buttons: ['Entendi.']
    });

    await alert.present();
  }
}