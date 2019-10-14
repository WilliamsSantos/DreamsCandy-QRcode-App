import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { Storage } from '@ionic/storage';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';

import { Tab1Page } from '../tab1/tab1.page';
import { LoginPage } from '../login/login.page';

import { AppModule } from '../app.module';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})

export class TabsPage implements OnInit {

  public loading:any            = null;
  protected dadosInscritos:any  = null;
  protected scanner_data:any    = null;
  public todos_inscritos: any   = null;
  private url_insert_inscritos  = AppModule.postInscritos();

  constructor(
    public loadingController: LoadingController,
    public alertController: AlertController,
    private storage: Storage,
    private barcodeScanner: BarcodeScanner,
    public http: HttpClient,
    public _tab1: Tab1Page,
    public _loginPage : LoginPage
  ) {}

  async ngOnInit(){
    if (await this.storage.get('acess_token') == ""){
      this.goHome()
    };
  }

  goHome(){
    this.storage.set('acess_token', '');
    this.storage.get('todosInscritos').then(res=>{
      this.storage.set('todosInscritos', res = [])
    });
    location.href = '/login'; 
  }

  async sincronizarDados(){
    this.loading = await this.loadingController.create({
      spinner:'dots',
      message: 'Sincronizando',
      translucent: true,
      cssClass: 'b-color'
    }); 
    await this.loading.present();

    await this.submeterDados('Guardando');
      
  }

  verificaUsuario(){
    this.storage.get('inscritos').then( ( res ) => {
    });
  }

  async submeterDados( mensagem: string ){

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      })
    }

    this.storage.get('inscritosConfirmados').then(todosConfirmados => {
      for ( let i = 0; i <= todosConfirmados.length; i++) {

        let inscrito = {
          'idInscricao': todosConfirmados[i]['id_inscricao']
        } 

        this.http.post(`${this.url_insert_inscritos}`, JSON.stringify(inscrito), httpOptions ).subscribe(async (res) => {
          // console.log('dentro ',i)
          if ( res['cod'] == 200 && res['status'] == 'sucess'){
            let novoArrayInscritos = todosConfirmados.splice(todosConfirmados[i], 0);
            await this.storage.set('inscritosConfirmados', novoArrayInscritos);
          }
        });
      }
      console.log(this.storage.get('inscritosConfirmados'));
    });
    this.alerta('Seus Dados Já Estão Atualizados.');
  }

  async qrcodeScanner () {
    this.barcodeScanner.scan(
      {
        showFlipCameraButton : true, // iOS and Android
        showTorchButton : true, // iOS and Android
        torchOn: true, // Android, launch with the torch switched on (if available)
        prompt : "Posicione o código de barras dentro da área do Scanner", // Android
        resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
        formats : "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
        disableAnimations : true, // iOS
        disableSuccessBeep: false // iOS and Android
      }
    ).then( barcodeData => {
      let base64 = barcodeData;
      let dadosInscrito = atob(base64.text);
      this.scanner_data = dadosInscrito.split('|');

      alert('dados: '+JSON.stringify( this.scanner_data ));
    }).catch( ( err ) => {
      console.log('Error', err);
    });
  }

  async decodeQrcode ( qrcode ) {
    let base64 = qrcode;
    let arr_dados = [];

    let dadosInscrito = atob(base64);
    arr_dados = dadosInscrito.split('|');

    //Retorna os dados decodificados
    return arr_dados;
  }

  async alerta(message){
    this.loading.style.display = 'none'
    const alert = await this.alertController.create({
      header: 'Tudo Sincronizado!',
      message: message,
      buttons: [
        {
          text: 'Entendi',
          handler: async () => {
            await this._loginPage.getTodosInscritos();
          }
        }
      ],
    });
  await alert.present();
  }

}
