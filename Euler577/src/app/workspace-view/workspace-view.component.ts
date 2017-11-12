import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';

interface Point {
  x:number;
  y:number;
}

interface Line {
  p1: Point,
  p2: Point
}


@Component({
  selector: 'app-workspace-view',
  templateUrl: './workspace-view.component.html',
  styleUrls: ['./workspace-view.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class WorkspaceViewComponent implements OnInit {

  constructor() { }


  private _n: number;
  @Input()
  public get n(): number {
    return this._n;
  }

  public set n(v:number) {
    this._n = Math.min(v, 40);
  }


  ngOnInit() {
  }

  get displayWidth() : number {
    return 600;
  }

  get displayHeight() : number {
    return 500;
  }

  readonly margin = 20;

  private *getVirtualRows() /*: IterableIterator<Point[]>*/ {
      for(let r = 0; r <= this.n; ++r) {
        const p:Point[] = [];
        for(let c = 0; c <= this.n-r; ++c) {
          p.push({
            x: c + r/2,
            y: r * Math.sqrt(3)/2
          });
        }
        yield p;
      }
  }

  private get virtualPoints() : Point[] {
      let p:Point[] = [];
      let rows = this.getVirtualRows();
      let iteratorResult = rows.next();
      while(!iteratorResult.done) {
        p = p.concat(iteratorResult.value);
        iteratorResult = rows.next();
      }
      return p;
  };

  private static *getAdjacentPairs<T>(iterator: IterableIterator<T>) : IterableIterator<T[]> {
    let iteratorResult = iterator.next();
    if(iteratorResult.done) {
      return;
    }
    let r1 = iteratorResult.value;
    iteratorResult = iterator.next();
    if(iteratorResult.done) {
      return;
    }
    let r2 = iteratorResult.value;
    while(true) {
      yield [r1, r2];
      r1 = r2;
      iteratorResult = iterator.next();
      if(iteratorResult.done) {
        return;
      }
      r2 = iteratorResult.value;
    }
  }

  private static each<T>(r:IterableIterator<T>, lambda: (t:T)=>void) {
    var iteratorResult = r.next();
    while(!iteratorResult.done) {
      lambda(iteratorResult.value);
      iteratorResult = r.next();
    }    
  }


  private get virtualLines() {
    const result:Line[] = [];
    WorkspaceViewComponent.each(this.getVirtualRows(), (row) => {
      if(row.length > 0) {
        result.push({
          p1: row[0],
          p2: row[row.length-1]
        });
      }
    });
    const rowPairsIterator = WorkspaceViewComponent.getAdjacentPairs(this.getVirtualRows());
    var iteratorResult = rowPairsIterator.next();
    while(!iteratorResult.done) {
      const [r1, r2] = iteratorResult.value;
      console.log(`virtualLines: r1.length=${r1.length} and r2.length=${r2.length}`);
      for(let i = 0; i < r1.length; ++i) {
        if(r1.length > i && r2.length > i) {
          result.push({
            p1: r2[i],
            p2: r1[i]
          });
        }
        if(i > 0) {
          result.push({
            p1: r2[i-1],
            p2: r1[i]
          });
        }
      }
      iteratorResult = rowPairsIterator.next();
    }
    return result;
  }


  private get tranform() : (p:Point) => Point {
    const outSkirts = this.virtualPoints.reduce((p1, p2) => <Point>{
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
    return this.virtualPoints.map(t);
  }

  get lines() : Line[] {
    const t = this.tranform;
    const result = this.virtualLines.map(l => <Line>{
      p1: t(l.p1),
      p2: t(l.p2)
    });
    console.log("get lines invoked");
    for(let r of result) {
      console.log(`(${r.p1.x}, ${r.p1.y}), (${r.p2.x}, ${r.p2.y})`);
    }
    return result;
  }
}
