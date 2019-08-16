import { Component } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  loading:any           = null;
  dadosInscritos:any    = null;
  scanner_data:any      = null;

  constructor(
    public loadingController: LoadingController,
    public alertController: AlertController,
    private storage: Storage,
    private barcodeScanner: BarcodeScanner,
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
    }); await this.loading.present();

    if ( this.submeterDados('Guardando') ){
      this.loading.style.display = 'none';
    }
  }

  verificaUsuario(){
    this.storage.get('inscritos').then( ( res ) => {
    });
  }

  async submeterDados( mensagem: string ){
    this.alerta(); 
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
  //Função desenvolvida apenas para fins de teste
  goHome(){
    window.location.href='/login'
  }
}
