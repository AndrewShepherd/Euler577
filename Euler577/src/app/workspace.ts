export interface Point {
  x:number;
  y:number;
}

export interface Line {
  p1: Point,
  p2: Point
}


export class Workspace {
    n: number;

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

  public get virtualLines() {
      const result:Line[] = [];
      Workspace.each(this.getVirtualRows(), (row) => {
        if(row.length > 0) {
          result.push({
            p1: row[0],
            p2: row[row.length-1]
          });
        }
      });
      const rowPairsIterator = Workspace.getAdjacentPairs(this.getVirtualRows());
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


    public get virtualPoints() : Point[] {
        let p:Point[] = [];
        let rows = this.getVirtualRows();
        let iteratorResult = rows.next();
        while(!iteratorResult.done) {
            p = p.concat(iteratorResult.value);
            iteratorResult = rows.next();
        }
        return p;
    };
}