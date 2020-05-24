-- Compiled with https://roblox-ts.github.io v0.3.2
-- May 7, 2020, 12:38 AM Eastern Daylight Time

local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("RobloxTS"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"));
local exports = {};
local ModelCFrameInterpolator;
local InterpolationQueue = TS.import(script, game:GetService("ServerStorage"), "LagCompensation", "InterpolationQueue", "InterpolationQueue").InterpolationQueue;
local ModelHitboxPair = TS.import(script, game:GetService("ServerStorage"), "LagCompensation", "History", "ModelHitboxPair").ModelHitboxPair;
do
	ModelCFrameInterpolator = setmetatable({}, {
		__tostring = function() return "ModelCFrameInterpolator" end;
	});
	ModelCFrameInterpolator.__index = ModelCFrameInterpolator;
	function ModelCFrameInterpolator.new(...)
		local self = setmetatable({}, ModelCFrameInterpolator);
		self:constructor(...);
		return self;
	end;
	function ModelCFrameInterpolator:constructor(map)
		self.contents = map;
	end;
	-- static methods
	function ModelCFrameInterpolator:FromCharacter(character)
		local map = {};
		local _0 = (character):GetChildren();
		for _1 = 1, #_0 do
			local instance = _0[_1];
			if instance:IsA("BasePart") then
				local part = instance;
				map[part] = part.CFrame;
			end;
		end;
		return ModelCFrameInterpolator.new(map);
	end;
	-- instance methods
	function ModelCFrameInterpolator:Lerp(other, alpha)
		local newMap = {};
		TS.map_forEach(self.contents, function(thisCFrame, basePart)
			local otherCFrame = other.contents[basePart];
			if otherCFrame then
				newMap[basePart] = thisCFrame:Lerp(otherCFrame, alpha);
			end;
		end);
		return ModelCFrameInterpolator.new(newMap);
	end;
	function ModelCFrameInterpolator:Apply()
		TS.map_forEach(self.contents, function(thisCFrame, basePart)
			basePart.CFrame = thisCFrame;
		end);
	end;
	function ModelCFrameInterpolator:ApplyToHitbox(hitbox)
		TS.map_forEach(self.contents, function(thisCFrame, thisBasePart)
			local corresponding = hitbox.map[thisBasePart];
			if corresponding then
				(corresponding).CFrame = thisCFrame;
			end;
		end);
	end;
end;
local BacktrackableHitboxCFrame;
do
	BacktrackableHitboxCFrame = setmetatable({}, {
		__tostring = function() return "BacktrackableHitboxCFrame" end;
	});
	BacktrackableHitboxCFrame.__index = BacktrackableHitboxCFrame;
	function BacktrackableHitboxCFrame.new(...)
		local self = setmetatable({}, BacktrackableHitboxCFrame);
		self:constructor(...);
		return self;
	end;
	function BacktrackableHitboxCFrame:constructor(original, maxFrames, copyParent)
		if copyParent == nil then copyParent = game.Workspace.CurrentCamera; end;
		self.originalHitboxPair = ModelHitboxPair.new(original, copyParent);
		self.queue = InterpolationQueue.new(maxFrames);
		self.original = self.originalHitboxPair.original;
		self.hitbox = self.originalHitboxPair.hitbox;
		local rsConnection = game:GetService("RunService").Stepped:Connect(function(time, _)
			self.queue:Append(ModelCFrameInterpolator:FromCharacter(original), time);
		end);
		self.original.AncestryChanged:Connect(function()
			if not (self.original:IsDescendantOf(game)) then
				self.hitbox:Destroy();
				rsConnection:Disconnect();
			end;
		end);
	end;
	function BacktrackableHitboxCFrame:BacktrackHitbox(toTime)
		assert(not (self.queue:IsEmpty()));
		(self.queue:InterpolateAtTime(toTime).contents):ApplyToHitbox(self.originalHitboxPair);
	end;
	function BacktrackableHitboxCFrame:GetHitbox()
		return self.hitbox;
	end;
end;
exports.ModelCFrameInterpolator = ModelCFrameInterpolator;
exports.BacktrackableHitboxCFrame = BacktrackableHitboxCFrame;
return exports;
