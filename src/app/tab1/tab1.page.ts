import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})

export class Tab1Page {

  searchbar:any;
  items:any;

  constructor(public alertController: AlertController) {}

  busca(){
    const searchbar = document.querySelector('ion-searchbar');
    const items = Array.from( document.querySelector('ion-list').children );
    searchbar.addEventListener('ionInput', handleInput);

    function handleInput( event ) {
      const query = event.target.value.toLowerCase();

      requestAnimationFrame( () => {
        items.forEach( item => {
          const shouldShow    = item.textContent.toLowerCase().indexOf( query ) > -1;
          item['style'].display  = shouldShow ? 'block' : 'none';
        });
      });
    }
  }

  async checkInscrito(){
    // Storage chamo aqui

      const alert = await this.alertController.create({
        header: 'Pedro',
        inputs: [
          {
            label: 'CPF:',
            type: 'text',
            value: 'CPF : 15225488744',
            disabled: true
          },
          // input date with min & max
          {
            name: 'lote',
            value: 'LOTE : Aqui vai o tipo do lote',
            disabled: true
          },
          {
            name: 'data-lote-inscricao',
            type: 'text',
            value: 'INSCRIÇÃO : 16/08/2019',
            disabled: true
          },
          // input date without min nor max
          {
            name: 'periodo',
            type: 'text',
            value: 'PERIODO LOTE:',
            disabled: true
          },
          // input date without min nor max
          {
            name: 'data-lote-inicio',
            type: 'text',
            value: 'INICIO : 16/08/2019',
            disabled: true
          },
          {
            name: 'data-lote-vencimento',
            type: 'text',
            value: 'VENCIMENTO : 16/08/2019',
            disabled: true
          }
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              console.log('Confirm Cancel');
              return false
            }
          }, {
            text: 'Confirmar',
            handler: () => {
              console.log('Confirm Ok');
              return true
            }
          }
        ]
      });
    await alert.present();
  }

  salvarConfirmado( c_input:boolean ){
    console.log(c_input);
    const checkbox = document.querySelectorAll('ion-checkbox');
  }
}
