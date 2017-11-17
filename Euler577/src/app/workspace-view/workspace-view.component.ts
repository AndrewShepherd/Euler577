import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { Point, Line, Workspace } from '../workspace';
import { Algorithm } from '../algorithm';



@Component({
  selector: 'app-workspace-view',
  templateUrl: './workspace-view.component.html',
  styleUrls: ['./workspace-view.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class WorkspaceViewComponent implements OnInit {

  constructor() { }

  //private readonly workspace:Workspace = new Workspace;
  @Input()
  public workspace:Workspace;

  @Input()
  public algorithm:Algorithm;

  ngOnInit() {
  }

  get displayWidth() : number {
    return 600;
  }

  get displayHeight() : number {
    return 500;
  }

  readonly margin = 20;

 
  private get tranform() : (p:Point) => Point {
    const outSkirts = this.workspace.virtualPoints.reduce((p1, p2) => <Point>{
      x: Math.max(p1.x, p2.x),
      y: Math.max(p1.y, p2.y) 
    }, { x:0, y:0 });
    const maxSize = {
      x: this.displayWidth - this.margin*2,
      y: this.displayHeight - this.margin*2
    };
    const verticalFlip = (p:Point) => <Point> {
      x:p.x,
      y: (p.y - outSkirts.y/2)*(-1.0) + outSkirts.y/2  
    }

    const inflationFactor = Math.min(maxSize.x / outSkirts.x, maxSize.y / outSkirts.y);
    const transformAndInflate = (p:Point) => <Point> {
      x: p.x*inflationFactor + this.margin,
      y: p.y*inflationFactor + this.margin
    };

    return(p:Point) => transformAndInflate(verticalFlip(p));
  }

  get points() : Point[] {
    const t = this.tranform;
    return this.workspace.virtualPoints.map(t);
  }

  get lines() : Line[] {
    const t = this.tranform;
    const linesArray:Line[] = [];
    console.log("invoking workspaceViewComponent.get lines");
    const iter = this.workspace.virtualLines;
    for(let iterResult = iter.next();
        !iterResult.done;
        iterResult = iter.next()) {
          linesArray.push(<Line> {
            p1: t(iterResult.value.p1),
            p2: t(iterResult.value.p2)
          });          
        }
    return linesArray;
  }

  get markers() : Point[] {
    const t = this.tranform;
    const p = this.algorithm.markers;
    console.log(`workspaceViewComponent.get markers invoked, length = ${p.length}`);
    return p.map(t);
  }
}
