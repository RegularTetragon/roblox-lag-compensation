import {InterpolationQueue, IInterpolatable} from "../InterpolationQueue/InterpolationQueue"
import {ModelHitboxPair} from "./ModelHitboxPair"
import {IBacktrackableHitbox} from "./IBacktrackableHitbox"


export class ModelCFrameInterpolator implements IInterpolatable<ModelCFrameInterpolator> {
    public readonly contents : Map<BasePart, CFrame>;
    Lerp(other:ModelCFrameInterpolator, alpha:number):ModelCFrameInterpolator {
        let newMap = new Map<BasePart, CFrame>();
        this.contents.forEach(
            (thisCFrame, basePart) => {
                let otherCFrame = other.contents.get(basePart)
                if (otherCFrame) {
                    newMap.set(
                        basePart,
                        thisCFrame.Lerp(
                            otherCFrame, alpha
                        )
                    )
                }
            }
        )
        return new ModelCFrameInterpolator(newMap);
    }
    
    Apply():void {
        this.contents.forEach(
            (thisCFrame, basePart) => {
                basePart.CFrame = thisCFrame
            }
        )
    }

    ApplyToHitbox(hitbox : ModelHitboxPair):void {
        this.contents.forEach(
            (thisCFrame, thisBasePart) => {
                let corresponding = hitbox.map.get(thisBasePart)
                if (corresponding) {
                    (<BasePart>corresponding).CFrame = thisCFrame
                }
            }
        )
    }
    static FromCharacter(character : Model) : ModelCFrameInterpolator {
        let map = new Map<BasePart, CFrame>()
            
            
        for (let instance of (<Model>character).GetChildren()) {
            if (instance.IsA("BasePart")) {
                let part = <BasePart>instance;
                map.set(part, part.CFrame);
            }
        }
        return new ModelCFrameInterpolator(map);
    }
    public constructor(map : Map<BasePart, CFrame>) {
        this.contents = <Map<BasePart,CFrame>>map; 
    }
}



export class BacktrackableHitboxCFrame implements IBacktrackableHitbox {
    queue : InterpolationQueue<ModelCFrameInterpolator>;
    originalHitboxPair : ModelHitboxPair;
    public original : Model ;
    public hitbox : Model ;
    constructor(original:Model, maxFrames:number, copyParent:Instance = game.Workspace.CurrentCamera!) {
        this.originalHitboxPair = new ModelHitboxPair(original, copyParent)
        this.queue = new InterpolationQueue<ModelCFrameInterpolator>(maxFrames);
        this.original = this.originalHitboxPair.original;
        this.hitbox = this.originalHitboxPair.hitbox;
        let rsConnection = game.GetService("RunService").Stepped.Connect(
            (time, _) => {
                this.queue.Append(ModelCFrameInterpolator.FromCharacter(original), time);
            }
        )
        this.original.AncestryChanged.Connect(()=>{
            if (!this.original.IsDescendantOf(game)) {
                this.hitbox.Destroy();
                rsConnection.Disconnect()
            }
        })
        
    }

    BacktrackHitbox(toTime : number) {
        assert(!(this.queue.IsEmpty()));
        
        (<ModelCFrameInterpolator>(this.queue.InterpolateAtTime(toTime)!.contents)).ApplyToHitbox(this.originalHitboxPair)
        
    }

    GetHitbox() : Model {
        return this.hitbox;
    }
}