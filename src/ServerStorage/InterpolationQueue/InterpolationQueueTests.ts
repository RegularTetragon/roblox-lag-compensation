import { InterpolationQueue, IInterpolatable } from "./InterpolationQueue";
import {ModelCFrameInterpolator, BacktrackableHitboxCFrame} from "../History/BacktrackableHitboxCFrame"




class InterpolatableNumber implements IInterpolatable<InterpolatableNumber> {
    public readonly value : number;
    constructor(x:number) {
        this.value = x;
    }
    Lerp(other:InterpolatableNumber, alpha:number) : InterpolatableNumber{
        return new InterpolatableNumber((other.value-this.value)*alpha + this.value);
    }
}



function GenerateLinear() {
    let queue = new InterpolationQueue<InterpolatableNumber>(30);
    for (let i=0;i<30;i++) {
        queue.Append(new InterpolatableNumber(i), i);
    }
    return queue
}

export function TestLinear() {
    let queue = GenerateLinear()
    let out = new Array<number>()
    for (let j=0;j<30;j++) {
        out.push((<InterpolatableNumber>queue.InterpolateAtTime(j)!.contents).value);
        out.push((<InterpolatableNumber>queue.InterpolateAtTime(j+.5)!.contents).value);
    }
    for (let k=0;k<59;k++) {
        assert(math.abs(out[k] - k/2) < .01 , out[k] + " Exceeds maximum absolute error of .01 in comparison to " + k/2 + " for index " + k);
    }
}
export function TestExtrapolationUpperBound() {
    let queue = GenerateLinear();
    let err = math.abs((<InterpolatableNumber>queue.InterpolateAtTime(100)!.contents).value - 100)
    assert(err < .01, "Queue does not extrapolate above bounds within acceptable error, absolute error: " + err);
}

export function TestExtrapolationLowerBound() {
    let queue = GenerateLinear();
    let err = (math.abs((<InterpolatableNumber>queue.InterpolateAtTime(-1)!.contents).value + 1))
    assert(err < .01, "Queue does not extrapolate below bounds within acceptable error, absolute error: " + err);
}

export function TestFlyingArrows() {
    let arrows = <Model>(game.GetService("ServerStorage").FindFirstChild("TestingModels")!.FindFirstChild("Arrows")!.Clone())
    arrows.Parent = game.Workspace
    let queue = new InterpolationQueue<ModelCFrameInterpolator>(3)

    queue.Append(ModelCFrameInterpolator.FromCharacter(arrows), 0)
    arrows.SetPrimaryPartCFrame(CFrame.Angles(7,4,2).Inverse().mul( new CFrame(0,6,3) ).mul(CFrame.Angles(1,8,2)))
    queue.Append(ModelCFrameInterpolator.FromCharacter(arrows), 5)
    arrows.SetPrimaryPartCFrame(CFrame.Angles(3,9,8).Inverse().mul( new CFrame(7,6,2) ).mul(CFrame.Angles(1,3,8)))
    queue.Append(ModelCFrameInterpolator.FromCharacter(arrows), 10)

    let t = 0
    while (t<10) {
        (<ModelCFrameInterpolator>queue.InterpolateAtTime(t)!.contents).Apply()
        t += wait()[0]
    }

}

export function TestLinearArrows() {
    let arrows = <Model>(game.GetService("ServerStorage").FindFirstChild("TestingModels")!.FindFirstChild("Arrows")!.Clone())
    arrows.Parent = game.Workspace
    let queue = new InterpolationQueue<ModelCFrameInterpolator>(10)
    for (let i = 0; i < 10; i++) {
        arrows.SetPrimaryPartCFrame(arrows.GetPrimaryPartCFrame().mul(new CFrame(5,0,0)))
        queue.Append(ModelCFrameInterpolator.FromCharacter(arrows), i)
    }
    let t = -5
    while (t<15) {
        (<ModelCFrameInterpolator>queue.InterpolateAtTime(t)!.contents).Apply()
        t += wait()[0]
    }
}

function GenerateGraphPoint(x:number, y:number, c:BrickColor, parent:Model) : Part {
    let part = new Instance("Part", parent)
    part.Size = new Vector3(1,1,1)
    part.CFrame = new CFrame(x,y,0);
    part.BrickColor = c;
    part.Anchored = true
    return part
}

export function TestHitbox() {
    let arrows = <Model>(game.GetService("ServerStorage").FindFirstChild("TestingModels")!.FindFirstChild("UnanchoredArrows")!.Clone())
    arrows.SetPrimaryPartCFrame(new CFrame(5,10,0));
    arrows.Parent = game.Workspace
    let hitbox = new BacktrackableHitboxCFrame(arrows, 60)
    let startTime = game.Workspace.DistributedGameTime
    wait(1)

    let t = 0
    do {
        t = t + wait()[0]
        hitbox.BacktrackHitbox(game.Workspace.DistributedGameTime - 1)
    } while (true)
    
}

export function TestQuadraticGraph() {
    let model = new Instance("Model", game.Workspace)
    model.Name = "QuadraticGraph"
    let queue = new InterpolationQueue<InterpolatableNumber>(50)
    for (let x = -25; x < 25; x++) {
        let y = x*x
        GenerateGraphPoint(x, y, new BrickColor(0,1,0), model);
        queue.Append(new InterpolatableNumber(y), x)
    }
    for (let x = -25; x < 25; x+=.05) {
        let y = (<InterpolatableNumber>queue.InterpolateAtTime(x)!.contents).value
        GenerateGraphPoint(x,y,new BrickColor(1,0,0), model)
    }
}

export function TestMovingGraph() {
    let queue = new InterpolationQueue<InterpolatableNumber>(20)
    let model = new Instance("Model", game.Workspace)
    model.Name = "Moving Graph"
    for (let x = -5; x < 5; x++) {
        let y = math.sin(x/10*math.pi) * 10 + 15
        queue.Append(new InterpolatableNumber(y), x);
    }
    let x = 5
    while (x<100) {

        let y = math.sin(x) * 10 + 15
        queue.Append(new InterpolatableNumber(y), x);
        let brickList = new Array<Part>()
        for (let i = queue.GetTimeBegin()!-5;i<=queue.GetTimeEnd()!+5;i+=1/8) {
            brickList.push( GenerateGraphPoint(i*2,(<InterpolatableNumber>queue.InterpolateAtTime(i)!.contents).value,new BrickColor(1,0,0), model))
        }
        let dt = wait(1/10)[0] * 2 * math.pi
        x+=dt || 0
        brickList.forEach((p)=>p.Destroy())
    }
}