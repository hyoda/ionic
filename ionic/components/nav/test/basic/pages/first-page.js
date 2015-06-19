import {Component, Directive, onInit} from 'angular2/src/core/annotations_impl/annotations';
import {View} from 'angular2/src/core/annotations_impl/view';

import {Routable, Router, NavController, NavbarTemplate, Navbar, NavPush, Content} from 'ionic/ionic';
import {IonicApp} from '../index';
import {SecondPage} from './second-page';

@Component({
  selector: 'ion-view',
  lifecycle: [onInit]
})
@View({
  template: '' +
    '<ion-navbar *navbar>' +
      '<ion-title>First Page: {{ val }}</ion-title>' +
      '<ion-nav-items primary>' +
        '<button class="button">P1</button>' +
      '</ion-nav-items>' +
      '<ion-nav-items secondary>' +
        '<button class="button">S1</button>' +
        '<button class="button">S2</button>' +
      '</ion-nav-items>' +
    '</ion-navbar>' +
    '<ion-content class="padding">' +
      '<p>First Page: {{ val }}</p>' +
      '<p><button class="button" (click)="push()">Push (Go to 2nd)</button></p>' +
      '<p><button class="button" [push-data]="pushData" [nav-push]="pushPage">Push w/ nav-push (Go to 2nd)</button></p>' +
      '<icon class="ion-ios-arrow-back"></icon>' +
      '<f></f><f></f><f></f><f></f><f></f><f></f><f></f><f></f><f></f><f></f>' +
      '<f></f><f></f><f></f><f></f><f></f><f></f><f></f><f></f><f></f><f></f>' +
    '</ion-content>',
  directives: [NavbarTemplate, Navbar, NavPush, Content]
})
export class FirstPage {
  constructor(
    nav: NavController
  ) {

    // TODO: Shouldn't have to do this
    Router.setNavController(nav);

    this.nav = nav;
    this.val = Math.round(Math.random() * 8999) + 1000;


    this.pushPage = SecondPage;
    this.pushData = {
      id: 420
    }
  }

  onInit() {
  }

  viewLoaded() {
    this.router = FirstPage.router.invoke(this);
    console.log('viewLoaded first page');
  }

  viewWillEnter() {
    console.log('viewWillEnter first page');
  }

  viewDidEnter() {
    console.log('viewDidEnter first page');
  }

  viewWillLeave() {
    console.log('viewWillLeave first page');
  }

  viewDidLeave() {
    console.log('viewDidLeave first page');
  }

  viewWillCache() {
    console.log('viewWillCache first page');
  }

  viewDidCache() {
    console.log('viewDidCache first page');
  }

  viewWillUnload() {
    console.log('viewWillUnload first page');
  }

  viewDidUnload() {
    console.log('viewDidUnload first page');
  }

  push() {
    this.nav.push(SecondPage, { id: 8675309, myData: [1,2,3,4] }, { animation: 'ios' });
  }
}

new Routable(FirstPage, {
  url: '/first-page'
})