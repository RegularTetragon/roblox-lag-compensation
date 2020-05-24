
type InstanceModificationCallback = (instance:Instance) => void;

let defaultInstanceModifiers = new Map<keyof Instances, InstanceModificationCallback>(
    [["BasePart" , ((part : Instance) => {
        if (part.IsA("BasePart")) {
            part.Anchored = true;
            part.Transparency = .5
            part.CanCollide = false
        }
        else {
            error("Invalid type passed into BasePart callback function")
        }
    })]]
)

export class ModelHitboxPair {
    //Maps original to duplicate part
    public readonly map : Map<Instance, Instance>
    //The hitbox
    public readonly hitbox : Model;
    //The original
    public readonly original : Model ;

    ///Returns the list of instances which were kept. Third parameter is internal and should not be used externally
    private SanitizeInstance(instance : Instance, permittedTypes : Array<keyof Instances>, kept : Array<Instance> = new Array<Instance>()) : Array<Instance> {
        for (let child of instance.GetChildren()) {
            if (!permittedTypes.find(permittedType => child.IsA(permittedType))) {
                child.Destroy()
            }
            else {
                kept.push(child);
                this.SanitizeInstance(child, permittedTypes, kept);
            }
        }
        return kept
    }

    
    constructor (
        model : Model,
        hitboxParent : Instance = game.Workspace.CurrentCamera!,
        permittedTypesArray : Array<keyof Instances> = ["BasePart"],
        santizeCallbacks : Map<keyof Instances, InstanceModificationCallback> = defaultInstanceModifiers
    ) {
        let numvals = new Array<[Instance, NumberValue]>();
        let cloneToOriginalUnsanitizedMap = new Map<Instance, Instance>();
        for (let obj of model.GetDescendants()) {
            let numValue = new Instance("NumberValue");
            numValue.Name = "TmpCouplingId"
            numValue.Value = numvals.size()
            numValue.Parent = obj
            numvals.push([obj, numValue])
        }

        let priorArchivalbe = model.Archivable
        model.Archivable = true
        let clone = model.Clone();
        model.Archivable = priorArchivalbe

        for (let cloneObj of clone.GetDescendants()) {
            let cloneNumValue = <NumberValue | undefined>cloneObj.FindFirstChild("TmpCouplingId")
            if (cloneNumValue) {
                let [originalObj, originalNumValue] = numvals[cloneNumValue.Value]
                cloneToOriginalUnsanitizedMap.set(cloneObj, originalObj)
                originalNumValue.Destroy()
                cloneNumValue.Destroy()
            }
            else if (cloneObj.Name !== "TmpCouplingId") {
                warn("Object not tagged with a TmpCouplingId" + cloneObj.GetFullName())
            }
            
        }
        let kept = this.SanitizeInstance(clone, permittedTypesArray);
        let originalToCloneSanitizedMap = new Map<Instance, Instance>();
        for (let keptObj of kept) {
            originalToCloneSanitizedMap.set(<Instance>assert(cloneToOriginalUnsanitizedMap.get(keptObj)), keptObj);
            santizeCallbacks.forEach((callback, permittedType) => {
                    if (keptObj.IsA(permittedType)) callback(keptObj)
                }
            )
        }
         

        //originalToCloneSanitizedMap.forEach((copy, original) => print(copy.GetFullName(), original.GetFullName()))
        this.hitbox = clone;
        this.map = originalToCloneSanitizedMap;
        this.original = model;
        clone.Parent = hitboxParent
    }
}