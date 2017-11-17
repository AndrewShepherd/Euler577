import { Workspace, Point } from "./workspace";
import { Observable, Subscription } from "rxjs/Rx";


export class Algorithm {
    public workspace: Workspace;


    private timerSubscription:Subscription;
    private points: Point[];

    private timerStep: number = 0;
    private nextStep(stepNumber: number) {
        this.timerStep = stepNumber;
    }

    public get markers() : Point[] {
        if(this.points && this.points.length) {
            return [ this.points[this.timerStep % this.points.length] ];
        } else {
            return [];
        }
    }

    public get isRunning() {
        return !!this.timerSubscription;
    }

    public async start() {
        const timer = Observable.timer(0, 500);
        this.points = this.workspace.virtualPoints;
        this.timerSubscription = timer.subscribe(t => this.nextStep(t));
    }

    public stop() : void {
        this.timerSubscription.unsubscribe();
        this.timerSubscription = null;
    }
}