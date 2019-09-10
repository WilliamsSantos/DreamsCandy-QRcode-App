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
  public inscritos:any                = [];
  public array_inscritos_confirmados  = [];
  checados:any                        = [];

  constructor(
    public alertController: AlertController,
    public storage: Storage
  ) {}

  async ngOnInit() {
    await this.listaInscritos();
  
    // console.log(this.array_inscritos_confirmados)
    // this.storage.set('inscritosConfirmados',[]);
  }

  listaInscritos() {
    this.storage.get('todosInscritos').then( (result:any) => {
      this.inscritos = result;
      this.checarEnviados(this.inscritos);
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
          var shouldShow    = item.textContent.toLowerCase().indexOf( query ) > -1;
          
          item['style'].display  = shouldShow ? 'block' : 'none';
        });
      });
    }
  }

  checkInscrito(inscrito_id:any, i:any){

    //Encontra e desabilita o check referente ao inscrito selecionado
      const checkbox = document.querySelectorAll('ion-checkbox');
      checkbox[i].checked = false;

      var id = inscrito_id;
      this.storage.get('todosInscritos').then( async ( result:any ) => {

        let inscrito = result.find( item => item.id_inscricao == id );

        if ( inscrito ){

          //Objeto que será enviado para o banco apenas se o inscrito for confirmado
          let obj_inscrito = {
            "id_inscrito" : id,
            "cpf"         : "inscrito.cpf",
            "lote"        : "inscrito.lote",
            "checagem"    : false
          }

          const alert = await this.alertController.create({
            header: inscrito.nom_pessoa,
            inputs: [
              {
                label: 'inscricao',
                type: 'text',
                value: 'INSCRIÇÃO : '+(inscrito.ind_status == 'P' ? 'Pendente' : inscrito.ind_status == 'C' ? 'Confirmado' : 'Cancelado' ),
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
                value: `INSCRIÇÃO : ${inscrito.num_inscricao}`,
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

                  obj_inscrito.checagem = false;

                  return false
                }
              }, {
                text: 'Confirmar',
                handler: () => {
                  checkbox[i].checked   = true;
                  checkbox[i].disabled  = true;

                  obj_inscrito.checagem = true;

                  this.storage.get('todosInscritos').then( ( result ) => {

                    if ( result ){
                    // Separa o inscrito dos demais
                      var inscrito_checado = result.filter((inscrito) => {
                        return inscrito.id_inscricao === id;
                      });

                      this.storage.get('inscritosConfirmados').then( async ( result ) => {
                        await this.storage.set('inscritosConfirmados', [...result, inscrito_checado[0]]);
                        return this.array_inscritos_confirmados = result;
                      });
                    }
                  });
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
          console.log(150,response);
        }
      });
  }

  checarEnviados(inscritos){
    this.storage.get('inscritosConfirmados').then( async ( result ) => {

      var reduced = [];
      inscritos.forEach((item) => {

          var duplicated  = result.findIndex(redItem => {
              return item.id_inscricao == redItem.id_inscricao;
          }) > -1;
          if(!duplicated) {
              reduced.push(item);
          }
      });
      this.inscritos = reduced;

      // console.log(JSON.stringify(reduced));
    });
  }
}
