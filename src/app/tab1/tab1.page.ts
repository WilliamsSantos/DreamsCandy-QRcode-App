import { Component } from '@angular/core';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})

export class Tab1Page {

  searchbar:any;
  items:any;

  constructor() {}

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

  salvarConfirmado( c_input:boolean ){
    console.log(c_input);
    const checkbox = document.querySelectorAll('ion-checkbox');
  }
}
