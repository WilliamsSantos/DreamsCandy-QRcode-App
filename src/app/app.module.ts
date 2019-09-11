import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { IonicStorageModule } from '@ionic/storage';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';

import { HttpClientModule } from '@angular/common/http';

import { Tab1Page } from '../app/tab1/tab1.page';
import { LoginPage } from '../app/login/login.page';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule, 
    IonicModule.forRoot(),
    IonicStorageModule.forRoot(), 
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
    BarcodeScanner,
    Tab1Page,
    LoginPage,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})

export class AppModule {

  //Variavel global para ser reaproveitada em toda a aplicação
  private static _url: string   = 'https://5d77b5ad1e31aa00149a34f3.mockapi.io/inscrito';
  private static _sincronizando: any;

  static url():string{
    return this._url;
  }
  static sincronizando(): any {
    return this._sincronizando;
  }
}
