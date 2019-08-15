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


  async submeterDados( mensagem ){
    this.alerta()
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
}
