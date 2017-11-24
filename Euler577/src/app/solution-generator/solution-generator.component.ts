import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';

@Component({
  selector: 'app-solution-generator',
  templateUrl: './solution-generator.component.html',
  styleUrls: ['./solution-generator.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SolutionGeneratorComponent implements OnInit {

  private _n=-1;

  constructor() { }

  ngOnInit() {
  }

  public get n() {
    console.log(`n getter, returning ${this._n}`);
    return this._n;
  }

   @Input()
  public set n(value:number) {
    console.log(`n setter, value = ${value}`);
    this._n = value;
  }

  public result:string = "";

  public calculate() {
    console.log("Running the calculate method");
    this.result = `result for ${this.n}`;
  }
}
