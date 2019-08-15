import { Component } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  loading:any;

  constructor(
    public loadingController: LoadingController,
    public alertController: AlertController
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

  //Função desenvolvida apenas para fins de teste
  goHome(){
    window.location.href='/login'
  }

  verificaUsuario(){
    // this.storage.get('inscritos').then(res => {

    // });
  }

  async submeterDados( mensagem: string ){
    this.alerta(); 
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

  decodeQrcode ( qrcode ) {
    let base64 = qrcode;
    let arr_dados = [];

    let dadosInscrito = atob(base64);
    arr_dados = dadosInscrito.split('|');

    //Retorna os dados decodificados
    return arr_dados;
  }

}
