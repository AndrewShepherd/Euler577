import { Component } from '@angular/core';
import { Workspace } from './workspace';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Euler577';

  workspace = new Workspace();

  constructor() {
    this.workspace.n = 6;
  }

  get n() : number {
    console.log('app.component.n.get invoked');
    return this.workspace.n;
  }

  set n(value: number) {
    console.log('app.component.n.set invoked');
    this.workspace.n = value;
  }
}
