import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Storage } from '@ionic/storage';

import  * as _ from 'lodash';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})

export class Tab1Page {

  _:any                                 = _;
  public items:any                      = null;
  public searchbar:any                  = null;
  public inscritos: any                 = [];
  protected array_inscritos_confirmados = [];

  constructor(
    public alertController: AlertController,
    public storage: Storage
  ) { }

  async ngOnInit() {

    await this.listaInscritos();
    // Limpa storage 
    // this.storage.set('inscritosConfirmados',[]);
  }

  public listaInscritos() {
    this.storage.get('todosInscritos').then( ( result: any ) => {
      this.inscritos = result;
      this.checarEnviados( this.inscritos );
    });
    return true;
  }

  public busca() {

    let searchbar       = document.querySelector('ion-searchbar').value;
    let searchInscritos = this.inscritos.filter(item => item.nom_pessoa.toLowerCase().indexOf(searchbar.toLowerCase()) > -1 )

    if ( searchInscritos.length > 0 ){
      this.inscritos = searchInscritos;
      let alertaNaoEncontrado = document.querySelectorAll('.badgeNaoEncontrado');

      alertaNaoEncontrado.forEach((item) => {
        item.style.display = 'none';
      });

    } else {
      var campo_mensagem = document.createElement('ion-card');   // Create a <button> element

      campo_mensagem.setAttribute("class", "badgeNaoEncontrado");
      campo_mensagem.style      = 'height: 238px; background-color: azure; font-size: 20pt; text-align: center; padding: 79px 0px; margin: 56%auto;';
      campo_mensagem.innerHTML  = "Ops! Inscrito não encontrado. Sincronize e tente novamente!";                       // Insert text

      document.body.appendChild(campo_mensagem);
    }

    if (searchbar === '') this.listaInscritos();
  }

  checkInscrito( inscrito_id: any, i: any ) {

    //Encontra e desabilita o check referente ao inscrito selecionado
    const checkbox      = document.querySelectorAll('ion-checkbox');
    checkbox[i].checked = false;

    var id  = inscrito_id;
    this.storage.get('todosInscritos').then( async ( result: any ) => {

      let inscrito = result.find( item => item.id_inscricao == id );

      if ( inscrito ) {

        const alert = await this.alertController.create({
          message: '<h1 style="text-align:center">'+inscrito.nom_pessoa+'</h1>',
          inputs: [
            {
              label: 'INSCRIÇÃO:',
              type: 'text',
              value: 'Inscrição: '+(inscrito.ind_status == 'P' ? 'Pendente' : inscrito.ind_status == 'C' ? 'Confirmado' : 'Cancelado'),
              disabled: true
            },
            {
              label: 'CPF:',
              type: 'text',
              value: `CPF : ${inscrito.cpf}`,
              disabled: true
            },
            // input date with min & max
            {
              name: 'lote',
              value: `LOTE : ${inscrito.nom_setor}`,
              disabled: true
            },
            {
              name: 'data-lote-inscricao',
              type: 'text',
              value: `INSCRIÇÃO : ${inscrito.id_inscricao}`,
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
              value: `INICIO : ${inscrito.dth_inicio}`,
              disabled: true
            },
            {
              name: 'data-lote-vencimento',
              type: 'text',
              value: `VENCIMENTO : ${inscrito.dth_fim}`,
              disabled: true
            }
          ],
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
              cssClass: 'secondary',
              handler: () => {
                console.log('Cancel');
                return false;
              }
            }, {
              text: 'Confirmar',
              handler: () => {

                checkbox[i].checked = true;
                checkbox[i].disabled = true;

                this.storage.get('todosInscritos').then( ( result:any ) => {

                  if ( result ) {
                    // Separa o inscrito dos demais

                    var inscrito_checado = result.filter( ( inscrito ) => {
                      console.log(inscrito.id_inscricao);
                      return inscrito.id_inscricao === id;
                    });

                    this.storage.get('inscritosConfirmados').then( async ( result ) => {

                      console.log('tab1 nscritosConfirmados');

                      if ( result == null ) return await this.storage.set('inscritosConfirmados', [ inscrito_checado[0] ]);

                      console.log('tab 1 this.storage.set(inscritosConfirmados)');
                      await this.storage.set('inscritosConfirmados', [ ...result, inscrito_checado[0] ]);
                      return this.array_inscritos_confirmados = result;
                    });
                  }
                });
              }
            }
          ]
        });
        await alert.present();

      } else {

        let response = {
          "status": 500,
          "message": "Inscrito não encontrado",
          "data": {
            "describe": new Error()
          }
        };
        alert(JSON.stringify(response));
        console.log(response);
      }
    });
  }

  checarEnviados( inscritos ) {
    this.storage.get('inscritosConfirmados').then( async ( result ) => {

      console.log(inscritos)
      var array_inscritos = [];
      inscritos.forEach( ( item ) => {
      // Esse metodo filtra os duplicados
      // Deixando somente os que ainda não estão 
        var duplicated = result.findIndex( redItem => {
          return item.id_inscricao == redItem.id_inscricao;
        }) > -1;

        if ( !duplicated ) {
          array_inscritos.push( item );
        }
      });

      return this.inscritos = array_inscritos;
    });
  }
}
