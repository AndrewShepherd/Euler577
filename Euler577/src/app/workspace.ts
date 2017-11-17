declare global {
  // class IterableIterator<T> {
  //   each(action: (t:T)=>void);
  // }
}





export interface Point {
  x:number;
  y:number;
}

export interface Line {
  p1: Point,
  p2: Point
}


export class WorkspaceRow {
  y: number;
  xStart: number;
  length: number;

  private *generatePoints() : IterableIterator<Point> {
    const last = this.lastPoint;
    for(let p = this.firstPoint; p.x <= last.x; p = { x: p.x + 1, y: p.y }) {
      yield p;
    }
  }

  private * generatePointsReverse() : IterableIterator<Point> {
    const first = this.firstPoint;
    for(let p = this.lastPoint; p.x >= first.x; p = {x: p.x-1, y:p.y }) {
      yield p;
    }
  }

  public get firstPoint() : Point {
    return {
      x: this.xStart,
      y: this.y
    };
  }

  public get lastPoint() : Point {
    return {
      x:this.xStart + this.length-1,
      y: this.y
    }
  }

  public get points() : IterableIterator<Point> {
    return this.generatePoints();
  }

  public get pointsReverse() : IterableIterator<Point> {
    return this.generatePointsReverse();
  }
}

export class Workspace {
    n: number;

    private generateRow(index:number) : WorkspaceRow {
        const row = new WorkspaceRow();
        row.y = index * Math.sqrt(3)/2;
        row.xStart = index/2;
        row.length = this.n-index + 1;    
        return row;
    }

    private *getVirtualRows() : IterableIterator<WorkspaceRow> {
      for(let r = 0; r <= this.n; ++r) {
        yield this.generateRow(r)
      }
    }

    private * getVirtualRowsReverse() : IterableIterator<WorkspaceRow> {
      for(let r = this.n; r >= 0; --r) {
        yield this.generateRow(r);
      }
    }

    

  private static *getAdjacentPairs<T>(iterator: IterableIterator<T>) : IterableIterator<T[]> {
    let iteratorResult = iterator.next();
    if(iteratorResult.done) {
      return;
    }
    let r1 = iteratorResult.value;
    iteratorResult = iterator.next();
    while(!iteratorResult.done) {
      const r2 = iteratorResult.value;
      yield [r1, r2];
      r1 = r2;
      iteratorResult = iterator.next();
    }
  }


    private static each<T>(r:IterableIterator<T>, lambda: (t:T)=>void) {
      var iteratorResult = r.next();
      while(!iteratorResult.done) {
        lambda(iteratorResult.value);
        iteratorResult = r.next();
      }    
    }

  private *generateHorizonalGridLines() : IterableIterator<Line> {
    const iterable = this.getVirtualRows();
    for(let iterResult = iterable.next(); !iterResult.done; iterResult = iterable.next()) {
      yield {
        p1: iterResult.value.firstPoint,
        p2: iterResult.value.lastPoint
      };
    }
  }

  private *generateForwardGridLines(): IterableIterator<Line> {
      let iterRow = this.getVirtualRows();
      let iterRowValue = iterRow.next();
      let bottomRow = iterRowValue.value;   

      const iterRowReverse = this.getVirtualRowsReverse();
      const iterPoint = bottomRow.points;
      for(let i = 0,
            iPv = iterPoint.next(), 
            iterRrv = iterRowReverse.next();
          i < bottomRow.length-1; 
          ++i, 
            iPv = iterPoint.next(), 
            iterRrv = iterRowReverse.next()) {
        yield {
          p1: iPv.value,
          p2: iterRrv.value.lastPoint
        };
      } 
  }

  private *generateBackwardGridLines() {
    console.log("generateBackwardGridLines");
    let iterRow = this.getVirtualRows();
    const bottomRow = iterRow.next().value;
    const bottomRowIter = bottomRow.pointsReverse;
    iterRow = this.getVirtualRowsReverse();
    for(let i = 0,
        ipv = bottomRowIter.next(),
        rv = iterRow.next();
        i < bottomRow.length-1 && !ipv.done && !rv.done;
        ++i, ipv = bottomRowIter.next(), rv = iterRow.next()
      ) {
        const line = {
          p1: ipv.value,
          p2: rv.value.firstPoint
        };
        console.log(`generateBackwardGridLines: p1=(${line.p1.x},${line.p1.y}), p2=(${line.p2.x}, ${line.p2.y})`);
        yield line;
      }
  }

  private static* concat<T>(...iters: IterableIterator<T>[]) : IterableIterator<T> {
    console.log('Workspace.concat. typeof(iters)=' + typeof(iters));
    
    for(let i = 0; i < iters.length; ++i) {
      const iter = iters[i];
      for(let iterResult = iter.next(); !iterResult.done; iterResult = iter.next()) {
        yield iterResult.value;
      }
    }
  }



  private generateGridLines() : IterableIterator<Line> {
    const iterOne = this.generateForwardGridLines();
    const iterThree = this.generateBackwardGridLines();
    const iterTwo = this.generateHorizonalGridLines();
    console.log("Invoking Workspace.concat");
    return Workspace.concat(iterOne, iterTwo, iterThree);
  }

  public get virtualLines() {
    console.log("Invoking this.generateGridLines()");
    
      return this.generateGridLines();
  }


    public get virtualPoints() : Point[] {
        let p:Point[] = [];
        let rows = this.getVirtualRows();
        let iteratorResult = rows.next();
        while(!iteratorResult.done) {
            const rowPoints = iteratorResult.value.points;
            let ip = rowPoints.next();
            while(!ip.done) {
              p.push(ip.value);
              ip = rowPoints.next();
            }
            iteratorResult = rows.next();
        }
        return p;
    };
}