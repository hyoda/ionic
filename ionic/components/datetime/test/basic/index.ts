import {App, Page} from '../../../../../ionic';


@Page({
  templateUrl: 'main.html'
})
class E2EPage {
  wwwInvented;
  time;
  netscapeRelease: Date;
  firefoxRelease: Date;

  constructor() {
    this.wwwInvented = '1989';
    this.netscapeRelease = new Date(1994, 11, 15, 13, 47, 20, 789);
    this.firefoxRelease = new Date(2002, 8, 23, 15, 3, 46, 789);
    this.time = '13:47';
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
