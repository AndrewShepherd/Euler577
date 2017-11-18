import { Workspace, Point, Line } from "./workspace";
import { Observable, Subscription } from "rxjs/Rx";


export interface AlgorithmState {
    markers: Point[];
    lines: Line[];
}

export class Algorithm {
    public workspace: Workspace;

    private timerSubscription:Subscription;

    private stateIterator : IterableIterator<AlgorithmState>;
    private iteratorResult : IteratorResult<AlgorithmState>;

    private nextStep(stepNumber: number) {
        this.iteratorResult = this.stateIterator.next();
        if(this.iteratorResult.done) {
            this.stateIterator = this.generatePointIterator();
            this.iteratorResult = this.stateIterator.next();
        }
    }

    *generatePointIterator() : IterableIterator<AlgorithmState> {
        for(let r = 1; r <= this.workspace.n-2; ++r) {
            const row = this.workspace.rowAt(r);
            for(let c = 0; c < row.length-2; ++c) {
                yield <AlgorithmState>{
                    markers: [row.pointAt(c), this.stationaryPoint],
                    lines: [{
                        p1: row.pointAt(c),
                        p2: this.stationaryPoint
                    }] 
                };
            }
        }
    }

    public get markers() : Point[] {
        return this.iteratorResult ? this.iteratorResult.value.markers : [];
    }

    private get stationaryPoint() : Point {
        return this.workspace.rowAt(0).pointAt(this.workspace.n-2);
    }

    public get trialLines() : Line[] {
        if(this.workspace.n < 3) {
            return [];
        }
        if(!this.iteratorResult) {
            return [];
        }
        return this.iteratorResult.value.lines;        
    }

    public get isRunning() {
        return !!this.timerSubscription;
    }

    public async start() {
        const timer = Observable.timer(0, 500);
        this.stateIterator = this.generatePointIterator();
        this.timerSubscription = timer.subscribe(t => this.nextStep(t));
    }

    public stop() : void {
        this.timerSubscription.unsubscribe();
        this.timerSubscription = null;
        this.stateIterator = null;
        this.iteratorResult = null;
    }
}