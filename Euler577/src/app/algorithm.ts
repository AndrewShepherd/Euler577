import { Workspace, Point, Line } from "./workspace";
import { Observable, Subscription } from "rxjs/Rx";


export class Algorithm {
    public workspace: Workspace;

    private timerSubscription:Subscription;

    private pointsIterable : IterableIterator<Point>;
    private iteratorResult : IteratorResult<Point>;

    private nextStep(stepNumber: number) {
        this.iteratorResult = this.pointsIterable.next();
        if(this.iteratorResult.done) {
            this.pointsIterable = this.generatePointIterator();
            this.iteratorResult = this.pointsIterable.next();
        }
    }

    *generatePointIterator() : IterableIterator<Point> {
        for(let r = 1; r <= this.workspace.n-2; ++r) {
            const row = this.workspace.rowAt(r);
            for(let c = 0; c < row.length-2; ++c) {
                yield row.pointAt(c);
            }
        }
    }

    public get markers() : Point[] {
        return this.iteratorResult ? [this.iteratorResult.value, this.stationaryPoint] : [];
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
        return [
            <Line>{
                p1: this.iteratorResult.value,
                p2: this.stationaryPoint
            }
        ];
        
    }

    public get isRunning() {
        return !!this.timerSubscription;
    }

    public async start() {
        const timer = Observable.timer(0, 500);
        this.pointsIterable = this.generatePointIterator();
        this.timerSubscription = timer.subscribe(t => this.nextStep(t));
    }

    public stop() : void {
        this.timerSubscription.unsubscribe();
        this.timerSubscription = null;
        this.pointsIterable = null;
        this.iteratorResult = null;
    }
}