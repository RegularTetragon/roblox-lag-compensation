-- Compiled with https://roblox-ts.github.io v0.3.2
-- May 7, 2020, 12:35 AM Eastern Daylight Time

local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("RobloxTS"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"));
local exports = {};
local defaultInstanceModifiers = {
	["BasePart"] = function(part)
		if part:IsA("BasePart") then
			part.Anchored = true;
			part.Transparency = .5;
			part.CanCollide = false;
		else
			error("Invalid type passed into BasePart callback function");
		end;
	end;
};
local ModelHitboxPair;
do
	ModelHitboxPair = setmetatable({}, {
		__tostring = function() return "ModelHitboxPair" end;
	});
	ModelHitboxPair.__index = ModelHitboxPair;
	function ModelHitboxPair.new(...)
		local self = setmetatable({}, ModelHitboxPair);
		self:constructor(...);
		return self;
	end;
	function ModelHitboxPair:constructor(model, hitboxParent, permittedTypesArray, santizeCallbacks)
		if hitboxParent == nil then hitboxParent = game.Workspace.CurrentCamera; end;
		if permittedTypesArray == nil then permittedTypesArray = { "BasePart" }; end;
		if santizeCallbacks == nil then santizeCallbacks = defaultInstanceModifiers; end;
		local numvals = {};
		local cloneToOriginalUnsanitizedMap = {};
		local _0 = model:GetDescendants();
		for _1 = 1, #_0 do
			local obj = _0[_1];
			local numValue = Instance.new("NumberValue");
			numValue.Name = "TmpCouplingId";
			numValue.Value = #numvals;
			numValue.Parent = obj;
			numvals[#numvals + 1] = { obj, numValue };
		end;
		local priorArchivalbe = model.Archivable;
		model.Archivable = true;
		local clone = model:Clone();
		model.Archivable = priorArchivalbe;
		local _2 = clone:GetDescendants();
		for _3 = 1, #_2 do
			local cloneObj = _2[_3];
			local cloneNumValue = cloneObj:FindFirstChild("TmpCouplingId");
			if cloneNumValue then
				local _4 = numvals[cloneNumValue.Value + 1];
				local originalObj = _4[1];
				local originalNumValue = _4[2];
				cloneToOriginalUnsanitizedMap[cloneObj] = originalObj;
				originalNumValue:Destroy();
				cloneNumValue:Destroy();
			elseif cloneObj.Name ~= "TmpCouplingId" then
				warn("Object not tagged with a TmpCouplingId" .. cloneObj:GetFullName());
			end;
		end;
		local kept = self:SanitizeInstance(clone, permittedTypesArray);
		local originalToCloneSanitizedMap = {};
		for _4 = 1, #kept do
			local keptObj = kept[_4];
			originalToCloneSanitizedMap[assert(cloneToOriginalUnsanitizedMap[keptObj])] = keptObj;
			TS.map_forEach(santizeCallbacks, function(callback, permittedType)
				if keptObj:IsA(permittedType) then
					callback(keptObj);
				end;
			end);
		end;
		self.hitbox = clone;
		self.map = originalToCloneSanitizedMap;
		self.original = model;
		clone.Parent = hitboxParent;
	end;
	function ModelHitboxPair:SanitizeInstance(instance, permittedTypes, kept)
		if kept == nil then kept = {}; end;
		local _0 = instance:GetChildren();
		for _1 = 1, #_0 do
			local child = _0[_1];
			if not (TS.array_find(permittedTypes, function(permittedType)
				return child:IsA(permittedType);
			end)) then
				child:Destroy();
			else
				kept[#kept + 1] = child;
				self:SanitizeInstance(child, permittedTypes, kept);
			end;
		end;
		return kept;
	end;
end;
exports.ModelHitboxPair = ModelHitboxPair;
return exports;
