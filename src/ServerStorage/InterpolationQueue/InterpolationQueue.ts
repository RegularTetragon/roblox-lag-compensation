//Object can be interpolated with another object of type T, and outputs an object that is interpolatable with type T.


export interface IInterpolatable<T> {
    //Alpha is between 0 and 1
    Lerp(other:IInterpolatable<T>, alpha:number):IInterpolatable<T>;
}


export class InterpolatableFrame<T> {
    public readonly contents:IInterpolatable<T>;
    public readonly time : number;
    public InterpolateAtTime(other:InterpolatableFrame<T>, sampleAt:number):InterpolatableFrame<T> {
        assert(this.time !== other.time, "Frames have identical timings.")
        //Determine which time came first.
        let first, last;
        if (this.time < other.time) {
            first = this;
            last = other;
        }
        else {
            first = other;
            last = this;
        }
        
        return first.Interpolate(last, (sampleAt - first.time)/(last.time - first.time));
    }
    public Interpolate(other:InterpolatableFrame<T>, alpha:number) : InterpolatableFrame<T>{
        
        return new InterpolatableFrame<T>(
            this.contents.Lerp(other.contents, alpha),
            ((other.time - this.time) * alpha) + this.time
        );
    }
    
    constructor(contents:IInterpolatable<T>, time:number) {
        this.contents = contents;
        this.time = time;
    }
}

class SlidingWindow<T> {
    
    public readonly MaxSize : number;

    private CurrentSize = 0;
    private StartIndex = 0;
    private Sequence : Array<T>;
    public constructor(MaxSize:number) {
        this.Sequence = new Array<T>();
        this.MaxSize = MaxSize;
    }
    public Append(item:T) {
        if (this.CurrentSize < this.MaxSize) {
            this.Sequence[this.CurrentSize] = item;
            this.CurrentSize += 1;
        }
        else {
            this.Sequence[this.StartIndex] = item;
            this.StartIndex = (this.StartIndex + 1) % this.MaxSize
        }
    }
    public Index(i:number):T | undefined {
        assert(i < this.MaxSize, "Index out of bounds")
        return this.Sequence[(i+this.StartIndex)%this.MaxSize]
    }
    public GetCurrentSize() {
        return this.CurrentSize;
    }
}

export class InterpolationQueue<T extends IInterpolatable<T>> {
    private sequence : SlidingWindow<InterpolatableFrame<T>>;
    public constructor(MaxSize:number) {
        this.sequence = new SlidingWindow(MaxSize);
    }
    public GetTimeBegin() : number | undefined {
        let v = this.sequence.Index(0)
        if (v) 
            return v.time
    }
    public GetTimeEnd() : number | undefined {
        let v = this.sequence.Index(this.sequence.GetCurrentSize() - 1)
        if (v)
            return v.time
    }

    public IsEmpty() : boolean {
        return this.sequence.GetCurrentSize() <= 0
    }
    
    //Append frames to the sequence. These must be done in order or this function will error.
    public Append(item:T, itemTime:number):void {
        let last = this.sequence.Index(this.sequence.GetCurrentSize() - 1)
        if (last) {
            let largestTime = last.time
            assert(itemTime > largestTime, "insertion time " + itemTime + " is less than or equal to the current largest: "+largestTime+". Was the same element inserted twice?")
        }
        this.sequence.Append(new InterpolatableFrame<T>(item, itemTime));
    }
    //Interpolates between frames in the sequence.
    public InterpolateAtTime(sampleTime:number):InterpolatableFrame<T> | undefined{
        let size = this.sequence.GetCurrentSize()
        if (size === 0) {
            return undefined
        }
        else if (size === 1) {
            return this.sequence.Index(0)!;
        }
        else {
            let left = 0;
            let right = this.sequence.GetCurrentSize() - 1;
            assert(right-left > 0, "Attempt to interpolate on an empty queue.")
          
            //At this point the list is guaranteed to have at least two elements.
            
            //Locate the frame closest to sampleAt without going over
            
            let middle : number;
            //The biggest pivot we've seen without going over
            while (right - left > 1) {
                middle = math.floor((right - left) / 2)+left
                
                let middleFrame = this.sequence.Index(middle)
                if (middleFrame!.time > sampleTime) {
                    //The pivot is too big, look at content left of the pivot
                    right = middle;
                }
                else if (middleFrame!.time < sampleTime) {
                    //The pivot is too small, look at content right of the pivot
                    left = middle;
                }
                else {
                    left = middle;
                    right = middle;
                }
            }

            if (left === right) {
                return this.sequence.Index(left)
            }
            else {
                return this.sequence!.Index(left)!.InterpolateAtTime(this.sequence.Index(right)!, sampleTime)
            }
        }
    }
}



