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
    // Limpa storage 
    // this.storage.set('inscritosConfirmados',[]);
  }

  public listaInscritos() {
    this.storage.get('todosInscritos').then( ( result: any ) => {
      // console.log('RESULT '+result)
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
      // this.checarEnviados( this.inscritos );
    });
    return true;
  }

  doInfinite(infinityScrolling) {
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
      this.inscritos = searchInscritos;
      let alertaNaoEncontrado = document.querySelectorAll('.badgeNaoEncontrado');

      alertaNaoEncontrado.forEach((item) => {
        item['style'].display = 'none';
      });

    } else {
      const campo_mensagem = document.createElement('ion-card');   // Create a <button> element

      campo_mensagem.classList.add("badgeNaoEncontrado");
      campo_mensagem.innerHTML = 'Ops! Inscrito não encontrado. Sincronize e tente novamente!';

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

      // console.log(result);
      let inscrito = result.find( item => item.id_inscricao == id );

      if ( inscrito ) {

        const alert = await this.alertController.create({
          message: '<h1 style="text-align:center;margin-bottom:-10px">'+inscrito.nom_pessoa+'</h1>',
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

                checkbox[i].checked   = true;
                checkbox[i].disabled  = true;

                this.storage.get('todosInscritos').then( ( result:any ) => {

                  if ( result ) {
                    // Separa o inscrito dos demais

                    var inscrito_checado = result.filter( ( inscrito ) => {
                      console.log(inscrito.id_inscricao);
                      return inscrito.id_inscricao === id;
                    });

                    this.storage.get('inscritosConfirmados').then( async ( result ) => {

                      // console.log('tab1 nscritosConfirmados');

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

      } else {

        let response = {
          "status": 500,
          "message": "Inscrito não encontrado",
          "data": {
            "describe": new Error()
          }
        };
        alert(JSON.stringify(response));
        // console.log(response);
      }
    });
  }

  // checarEnviados( inscritos ) {
  //   this.storage.get('inscritosConfirmados').then( async ( result ) => {

  //     // console.log(inscritos)
  //     var array_inscritos = [];
  //     [inscritos].forEach( ( item ) => {
  //     // Esse metodo filtra os duplicados
  //     // Deixando somente os que ainda não estão 
  //       var duplicated = result.findIndex( redItem => {
  //         return item.id_inscricao == redItem.id_inscricao;
  //       }) > -1;

  //       if ( !duplicated ) {
  //         array_inscritos.push( item );
  //       }
  //     });

  //     // console.log(array_inscritos);
  //     return this.inscritos = array_inscritos;
  //   });
  // }
}
