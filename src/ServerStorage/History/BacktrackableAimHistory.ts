import { IInterpolatable, InterpolationQueue } from "../InterpolationQueue/InterpolationQueue";



export class BacktrackableAimHistory {
    history : InterpolationQueue<CFrame>
    constructor (cframeEvent:BindableEvent, maxsize:number)  {
        this.history = new InterpolationQueue<CFrame>(maxsize);
        cframeEvent.Event.Connect(this.Append)
    }
    Append(from:any, target:any) {
        print("Appending")
        this.history.Append(new CFrame(<Vector3>from, <Vector3>target), game.Workspace.DistributedGameTime)
    }
    BacktrackAim(bySeconds:number) {
        this.history.InterpolateAtTime(game.Workspace.DistributedGameTime - bySeconds)
    }

}