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

  ngOnInit(): void {
    this.storage.get('acess_token').then(res=>{
      if ( res == '' ){
        this.goHome()
      }
    })
  }

  goHome(){
    this.storage.set('acess_token', '');
    this.storage.set('todosInscritos', []);
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

    if ( await this._loginPage.getTodosInscritos()) {

      if ( this.submeterDados('Guardando') ) {

        this.loading.style.display = 'none';
        this._tab1.ngOnInit();
      }
    }; 
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
      todosConfirmados.forEach( inscritoConfirmado => {

        let inscrito = {
          'idInscricao': inscritoConfirmado['id_inscricao']
        } 
        console.log(inscrito)
        this.http.post(`${this.url_insert_inscritos}`, JSON.stringify(inscrito), httpOptions ).subscribe(async (res) => {

          console.log('todosConfirmados')

          if ( res.cod == 200 && res.status == 'sucess'){
            console.log('Enviado.')
          } else {
            this.alerta('Ops! Não conseguimos enviar os dados por favor tente novamente!');
          }
        },err => {
          console.log(err);
        }); 
      });
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

    const alert = await this.alertController.create({
      header: 'Tudo Sincronizado!',
      message: message,
      buttons: [
        {
          text: 'Entendi',
        }
      ],
    });
  await alert.present();
  }

}
