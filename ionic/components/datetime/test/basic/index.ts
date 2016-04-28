import {App, Page} from 'ionic-angular';


@Page({
  templateUrl: 'main.html'
})
class E2EPage {
  year;

  constructor() {
    this.year = '1994';
  }

}


@App({
  template: '<ion-nav [root]="root"></ion-nav>'
})
class E2EApp {
  root;

  constructor() {
    this.root = E2EPage;
  }
}
