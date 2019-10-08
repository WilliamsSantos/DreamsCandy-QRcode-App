import { Component } from '@angular/core';
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

export class TabsPage {

  public loading:any            = null;
  protected dadosInscritos:any  = null;
  protected scanner_data:any    = null;
  public todos_inscritos: any   = null;
  private url                   = AppModule.postInscritos();

  constructor(
    public loadingController: LoadingController,
    public alertController: AlertController,
    private storage: Storage,
    private barcodeScanner: BarcodeScanner,
    public http: HttpClient,
    public _tab1: Tab1Page,
    public _loginPage : LoginPage
  ) {}

// Criar função de decodificar o QRCODE e no resultado da decodificação
// Executar uma função que irá verificar se o usuario existe no storage.
// Se não existir alertar que o usuario não existe.
// A consulta será realizada com base no cpf do usuario e retornara o nome dele
// caso o mesmo exista.
// Se o usuario existir executará um POST alterando o seu dado de 

  async sincronizarDados(){
    this.loading = await this.loadingController.create({
      spinner:'dots',
      message: 'Sincronizando',
      translucent: true,
      cssClass: 'b-color'
    }); 
    await this.loading.present();

this.submeterDados('Guardando')
    // if ( await this._loginPage.getTodosInscritos() && this.submeterDados('Guardando') ) {
    //   this.loading.style.display = 'none';
    //   // this._tab1.ngOnInit();
    // }; 
  }

  verificaUsuario(){
    this.storage.get('inscritos').then( ( res ) => {
    });
  }

  async submeterDados( mensagem: string ){

    //  Pegar os inscritos confirmados, e da um submite
    this.storage.get('inscritosConfirmados').then( ( inscritosConfirmados ) => {

      inscritosConfirmados.forEach(inscrito => {

        let postData = {
          'idInscricao' : inscrito.id_inscricao
        }

        const requestOptions = {
          headers: new HttpHeaders({ 
            'Access-Control-Allow-Origin':'*',
            // 'Authorization':'authkey',
            // 'userid':'1',
            'Content-Type': 'application/json',
          })
        };

        this.http.post(`${this.url}`, postData, requestOptions).subscribe(data => {
          console.log(data['_body']);
        }, error => {
          console.log(error);
        });
      });
    });    
  }

  async qrcodeScanner () {
    this.barcodeScanner.scan(
      {
        showFlipCameraButton : true, // iOS and Android
        showTorchButton : true, // iOS and Android
        torchOn: true, // Android, launch with the torch switched on (if available)
        prompt : "Place a barcode inside the scan area", // Android
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

  async alerta(){
    const alert = await this.alertController.create({
      header: 'Tudo Sincronizado!',
      message: 'Seus Dados Já Estão Atualizados.',
      buttons: [
        {
          text: 'Entendi',
        }
      ],
    });
  await alert.present();
  }

  async decodeQrcode ( qrcode ) {
    let base64 = qrcode;
    let arr_dados = [];

    let dadosInscrito = atob(base64);
    arr_dados = dadosInscrito.split('|');

    //Retorna os dados decodificados
    return arr_dados;
  }
  goHome(){
    location.href = '/login'; 
  }
}
