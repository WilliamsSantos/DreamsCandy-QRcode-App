import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import * as _ from 'lodash';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})

export class Tab1Page {

  _: any = _;
  searchbar:any;
  items:any;
  inscritos:any               = [];
  array_inscritos_confirmados = [];

  constructor(
    public alertController: AlertController,
    public storage: Storage
  ) {}

  ngOnInit() {
    this.listaInscritos();
  }

  listaInscritos() {
    this.storage.get('todosInscritos').then( (result:any) => {
      this.inscritos = result;
    });
  }

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

  checkInscrito(inscrito_id:any, i:any){

    //Encontra e desabilita o check referente ao inscrito selecionado
      const checkbox = document.querySelectorAll('ion-checkbox');
      checkbox[i].checked = false;

      let id = inscrito_id ;
      this.storage.get('todosInscritos').then( async ( result:any ) => {

        let inscrito = result.find( item => item.id == id );

        if ( inscrito ){

          const alert = await this.alertController.create({
            header: inscrito.title,
            inputs: [
              {
                label: 'CPF:',
                type: 'text',
                value: `CPF : ${inscrito.id}`,
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
                  checkbox[i].checked  = true;
                  checkbox[i].disabled = true;
                  return true
                }
              }
            ]
          });
          await alert.present();

        }else{
          let response = {
            "status" : 500,
            "message": "Inscrito não encontrado",
            "data" : {
              "describe" : new Error()
            }
          };
          console.log(response);
        }
      });
      
  }

  salvarConfirmado( c_input:boolean ){
    console.log(c_input);
    const checkbox = document.querySelectorAll('ion-checkbox');
  }
}
