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

  async submeterDados( mensagem: string ){

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      })
    }

    this.storage.get('inscritosConfirmados').then(todosConfirmados => {
      for ( let i = 0; i <= todosConfirmados.length; i++) {

        let inscrito = {
          'idInscricao' : todosConfirmados[i].id_inscricao
        } 

        this.http.post(`${this.url_insert_inscritos}`, JSON.stringify(inscrito), httpOptions ).subscribe(async (res) => {
          if ( res['cod'] == 200 && res['status'] == 'sucess'){
            let novoArrayInscritos = todosConfirmados.splice(todosConfirmados[i], 0);
            await this.storage.set('inscritosConfirmados', novoArrayInscritos);
          }
        });
      }
    });

    this.alerta('Seus Dados Já Estão Atualizados.', true);
  }

  async qrcodeScanner () {
    this.barcodeScanner.scan(
      {
        showFlipCameraButton : true, // iOS and Android
        showTorchButton : true, // iOS and Android
        torchOn: false, // Android, launch with the torch switched on (if available)
        prompt : "Posicione o código dentro da área do Scanner", // Android
        resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
        formats : "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
        disableAnimations : true, // iOS
        disableSuccessBeep: false // iOS and Android
      }
    ).then( barcodeData => {

      let base64        = barcodeData;
      let dadosInscrito = atob(base64.text);
      this.scanner_data = dadosInscrito.split('|');
      let dadosScanner  = {
        'cpf'             : JSON.stringify( this.scanner_data[0] ),
        'idInscricao'     : JSON.stringify( this.scanner_data[1] ),
        'data_inscricao'  : JSON.stringify( this.scanner_data[2] )
      };

      this.storage.get('todosInscritos').then( async inscritos => {
        this.loading = await this.loadingController.create({
          spinner: null,
          message: 'Please wait...',
          translucent: true,
          cssClass: 'custom-class custom-loading'
        });
        await this.loading.present();
        
        let inscritoConfirmado = await inscritos.find( inscrito => inscrito.id_inscricao == dadosScanner.idInscricao);

        if ( inscritoConfirmado == null){
          this.alerta('Inscrito não Encontrado na lista.', false);
          return false;
        }

        for (let i = 0; i < inscritos.length; i++) {

          const inscrito    = inscritos[i];
          const httpOptions = {
            headers: new HttpHeaders({
              'Content-Type'                  : 'application/json',
              'Access-Control-Allow-Origin'   : '*',
              'Access-Control-Allow-Methods'  : 'POST, OPTIONS',
              'Access-Control-Allow-Headers'  : 'Content-Type'
            })
          }

          try {
            this.http.post(`${this.url_insert_inscritos}`, JSON.stringify(inscritoConfirmado.id_inscricao), httpOptions ).subscribe(async (res) => {
              if ( res['cod'] == 200 && res['status'] == 'sucess'){
                let novoArrayInscritos = inscritos.split(inscrito[i], 0)
                await this.storage.set('inscritosConfirmados', novoArrayInscritos);
              }
            });
          } catch (e) {
            alert(e)
          }
        }
      });

      this.alerta('Inscrito Confirmado.', true);
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

  // Sempre que for True o parametro status, o botão de entendi atualiza todos os inscritos
  // Se for false apenas fecha o modal
  async alerta(message, status){

    this.loading.style.display = 'none';
      let  alert = await this.alertController.create({
          header: status==true?'Tudo Sincronizado!':'Informativo!',
          message: message,
          buttons: [
            {
              text: 'Entendi',
              handler: async () => {
                if ( status == false){
                  return false;
                }
                await this._loginPage.getTodosInscritos();
              }
            }
          ],
      });
    await alert.present();
  }
}
