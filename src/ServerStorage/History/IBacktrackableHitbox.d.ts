export interface IBacktrackableHitbox {
    BacktrackHitbox(toTime : number) : void;
    GetHitbox() : Model;
}