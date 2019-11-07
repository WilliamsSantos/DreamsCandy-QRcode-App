import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { InscritoModel } from "../models/inscrito-model";

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

  private page                          = 1;
  private perPage                       = 0;
  private totalData                     = 0;
  private totalPage                     = 0;

  inscrito: InscritoModel[]             = [];

  constructor(
    public alertController: AlertController,
    public storage: Storage
  ) { }

  async ngOnInit() {
    await this.listaInscritos();
  }

  public listaInscritos() {
    this.storage.get('todosInscritos').then( ( result: any ) => {

      this.inscritos = result;

      for (let i = 0; i <= 50; i++) {

        let inscto = new InscritoModel(
          this.inscritos[i].nome,
        );
        this.inscrito.push(inscto);
      }

      this.perPage    = 10;
      this.totalData  = this.inscritos.length;
      this.totalPage  = 10;

    });
    return true;
  }

  doInfinite( infinityScrolling ) {
    this.totalPage = this.page * 10;

    setTimeout(() => {

      let result = this.inscritos.slice(this.page * 10);

      for (let i = 0; i <= this.perPage; i++) {
        if (result[i] != undefined) {
          let inscto = new InscritoModel(result[i].nome);
          this.inscrito.push(inscto);
        }
      }

      this.page += 1;
      infinityScrolling.target.complete()
    }, 2000);
  }

  public busca() {

    let searchbar       = document.querySelector('ion-searchbar').value;
    let searchInscritos = this.inscritos.filter(item => item.nom_pessoa.toLowerCase().indexOf(searchbar.toLowerCase()) > -1 )

    if ( searchInscritos.length > 0 ){

      this.inscritos          = searchInscritos;
      let alertaNaoEncontrado = document.querySelectorAll('.badgeNaoEncontrado');

      alertaNaoEncontrado.forEach((item) => { item['style'].display = 'none' });

    } else {
      const campo_mensagem = document.createElement('ion-card');   // Create a <button> element

      campo_mensagem.classList.add("badgeNaoEncontrado");
      campo_mensagem.innerHTML = 'Ops! Inscrito não encontrado. Sincronize e tente novamente!';

      document.body.appendChild(campo_mensagem);
    }

    if ( searchbar === '' ) this.listaInscritos();
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
          header : inscrito.nom_pessoa,
          message: `${inscrito.nom_setor}`,
          inputs: [
            {
              label: 'INSCRIÇÃO:',
              type: 'text',
              value: 'INSCRIÇÃO: '+(inscrito.ind_status == 'P' ? 'Pendente' : inscrito.ind_status == 'C' ? 'Confirmado' : 'Cancelado'),
              disabled: true
            },
            {
              label: 'CPF:',
              type: 'text',
              value: `CPF : ${inscrito.cpf}`,
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
              value: 'PERÍODO LOTE:',
              disabled: true
            },
            // input date without min nor max
            {
              name: 'data-lote-inicio',
              type: 'text',
              value: `INÍCIO : ${inscrito.dth_inicio.split(' ')[0].split('-').reverse().join('-')}`,
              disabled: true
            },
            {
              name: 'data-lote-vencimento',
              type: 'text',
              value: `VENCIMENTO : ${inscrito.dth_fim.split(' ')[0].split(' ')[0].split('-').reverse().join('-')}`,
              disabled: true
            }
          ],
          buttons: [
            {
              text: 'Sair',
              role: 'cancel',
              cssClass: 'danger',
              handler: () => {
                return false;
              }
            }, {
              text: 'Confirmar',
              handler: () => {

                checkbox[i].checked   = true;
                checkbox[i].disabled  = true;

                this.storage.get('todosInscritos').then( ( result:any ) => {

                  if ( result ) {

                    // Separa o inscrito dos demais
                    var inscrito_checado = result.filter( ( inscrito ) => {
                      return inscrito.id_inscricao === id;
                    });

                    this.storage.get('inscritosConfirmados').then( async ( result ) => {

                      if ( result == null ) return await this.storage.set('inscritosConfirmados', [ inscrito_checado[0] ]);

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

        //  Disabilita botão para confirmação caso o status seja A = cancelado 
        if ( inscrito.ind_status == 'A' || inscrito.ind_status == 'P' ) {
          if ( document.querySelectorAll('.alert-button.ion-focusable.ion-activatable.sc-ion-alert-md').length > 0 ){
            let btn_confirmar = document.querySelectorAll('.alert-button.ion-focusable.ion-activatable.sc-ion-alert-md');  
                btn_confirmar[1]['style']['display'] = 'none';
          } else if ( document.querySelectorAll('.alert-button.ion-focusable.ion-activatable.sc-ion-alert-ios').length > 0 ){
            let btn_confirmar = document.querySelectorAll('.alert-button.ion-focusable.ion-activatable.sc-ion-alert-ios');  
                btn_confirmar[1]['style']['display'] = 'none';
          }
        }
      } else {

        let response = {
          "status": 500,
          "message": "Inscrito não encontrado",
          "data": {
            "describe": new Error()
          }
        };
        alert(JSON.stringify(response));
      }
    });
  }
}
