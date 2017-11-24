
import { Point, Line, Utils } from "./geometry";
import { Workspace } from "./workspace";
import { Observable, Subscription } from "rxjs/Rx";


interface Outliers {
    column: {
        min: 0,
        max: 0
    },
    row: {
        min: 0,
        max: 0
    }
}

export interface AlgorithmState {
    markers: Point[];
    lines: Line[];
    text: string;
}





interface RelativePoint {
    rowDelta: number,
    columnDelta: number
}

interface TheoreticalHexagonSearchState {
    allHexagons:RelativePoint[][];
    lines: Line[]
}


export class Algorithm {
    public workspace: Workspace;

    private timerSubscription:Subscription;

    private stateIterator : IterableIterator<AlgorithmState>;
    private iteratorResult : IteratorResult<AlgorithmState>;

    private nextStep(stepNumber: number) {
        const iteratorResult = this.stateIterator.next();
        if(iteratorResult.done) {
            this.stop();
        } else {
            this.iteratorResult = iteratorResult;
        }
    }

    static hexagonCanFit(row:number, column:number, n:number, hexagon: RelativePoint[]) {
        for(let rc of hexagon) {
            // Ask the question : can each of the points
            // actually fit on the triange
            let projectedRow = row+rc.rowDelta;
            let projectedCol = column+rc.columnDelta;
            if((projectedRow < 0) || (projectedRow > n))  {
                return false;
            }
            const availableColumns = n-projectedRow;
            if((projectedCol < 0) || (projectedCol > availableColumns)) {
                return false;
            }
        }
        return true;
    }


    static *generateTheoreticalHexagons(n:number) : IterableIterator<TheoreticalHexagonSearchState> {
        const workspace = new Workspace();
        workspace.n = n;

        const searchState = <TheoreticalHexagonSearchState>{
            allHexagons: [],
            lines: []
        };

        const stationaryPoint = workspace.rowAt(0).pointAt(workspace.n-2);
        
        for(let r = 1; r <= n-2; ++r) {
            const hexagonCountBefore = searchState.allHexagons.length;
            const row = workspace.rowAt(r);
            for(let c = 0; c < row.length-2; ++c) {
                const line:Line = {
                    p1: stationaryPoint,
                    p2: row.pointAt(c),
                };

                const [dx, dy] = [(line.p2.x - line.p1.x), (line.p2.y - line.p1.y)];
                const angleRadians = Utils.angleToXAxis(line);
                const length = Math.sqrt(dx*dx+dy*dy);
                searchState.lines = [line];
                yield searchState;

                // Now attempt to project the next line
                const angleIncrement = 0-Math.PI/3;
                let targetAngle = angleRadians + angleIncrement;

                let lastPoint = line.p2;

                const relativePoints: RelativePoint[] = [];

                for(let i = 0; i < 5; ++i) {
                    const nextPoint = Utils.projectFromPoint(lastPoint, targetAngle, length);
                    const nextLine = <Line>{
                        p1: lastPoint,
                        p2: nextPoint
                    };
                    searchState.lines.push(nextLine);
                    yield searchState;
                    
                    const rowAndColumn = workspace.findRowAndColumn(nextPoint);

                    if((rowAndColumn.row > workspace.n) || (rowAndColumn.column < 0)) {
                        break;
                    }
                    relativePoints.push({
                      rowDelta : rowAndColumn.row,
                      columnDelta: rowAndColumn.column - (workspace.n-2)  
                    });
                    lastPoint = nextPoint;
                    targetAngle += angleIncrement;
                }
                if(relativePoints.length === 5) {
                    searchState.allHexagons.push(relativePoints);
                }
            }
            if(searchState.allHexagons.length === hexagonCountBefore) {
                break; // No reason to scan any more rows
            }
        }
    }

    static *generateAlgorithmIterator(n:number) : IterableIterator<AlgorithmState> {
        const workspace = new Workspace();
        workspace.n = n;

        const theoreticalHexagonIterable = Algorithm.generateTheoreticalHexagons(n);
        let ti = theoreticalHexagonIterable.next();

        let allHexagons:RelativePoint[][] = [];
        while(!ti.done) {
            allHexagons = ti.value.allHexagons;            
            yield <AlgorithmState>{
                lines: ti.value.lines,
                markers: [],
                text: `Hexagon count: ${ti.value.allHexagons.length}`
            };
            ti = theoreticalHexagonIterable.next();
        }

        let totalCount = 0;
        for(let r = 0; r <=workspace.n; ++r) {
            for(let c = 0; c < workspace.n-r; ++c) {
                // Find all of the hexagons that line up
                for(let hexagon of allHexagons) {
                    if(Algorithm.hexagonCanFit(r, c, workspace.n, hexagon)) {
                        ++totalCount;
                    }                    
                }
            }
        }
        yield {
            lines:[],
            markers: [],
            text: `${totalCount} possible hexagons`
        };
    }

    public get markers() : Point[] {
        return this.iteratorResult ? this.iteratorResult.value.markers : [];
    }

    public get trialLines() : Line[] {
        if(this.workspace.n < 3) {
            return [];
        }
        if(!this.iteratorResult) {
            return [];
        }
        if(!this.iteratorResult.value) {
            return [];
        }
        return this.iteratorResult.value.lines || [];        
    }

    public get text() : string {
        if(!this.iteratorResult) {
            return "";
        }
        return this.iteratorResult.value.text;
    }

    public get isRunning() {
        return !!this.timerSubscription;
    }

    public async start() {
        const timer = Observable.timer(0, 100);
        this.stateIterator = Algorithm.generateAlgorithmIterator(this.workspace.n);
        this.timerSubscription = timer.subscribe(t => this.nextStep(t));
    }

    public stop() : void {
        this.timerSubscription.unsubscribe();
        this.timerSubscription = null;
        this.stateIterator = null;
    }
}