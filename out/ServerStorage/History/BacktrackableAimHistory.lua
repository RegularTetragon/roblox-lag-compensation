-- Compiled with https://roblox-ts.github.io v0.3.2
-- May 7, 2020, 12:35 AM Eastern Daylight Time

local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("RobloxTS"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"));
local exports = {};
local InterpolationQueue = TS.import(script, game:GetService("ServerStorage"), "LagCompensation", "InterpolationQueue", "InterpolationQueue").InterpolationQueue;
local BacktrackableAimHistory;
do
	BacktrackableAimHistory = setmetatable({}, {
		__tostring = function() return "BacktrackableAimHistory" end;
	});
	BacktrackableAimHistory.__index = BacktrackableAimHistory;
	function BacktrackableAimHistory.new(...)
		local self = setmetatable({}, BacktrackableAimHistory);
		self:constructor(...);
		return self;
	end;
	function BacktrackableAimHistory:constructor(cframeEvent, maxsize)
		self.history = InterpolationQueue.new(maxsize);
		cframeEvent.Event:Connect(self.Append);
	end;
	function BacktrackableAimHistory:Append(from, target)
		print("Appending");
		self.history:Append(CFrame.new(from, target), game.Workspace.DistributedGameTime);
	end;
	function BacktrackableAimHistory:BacktrackAim(bySeconds)
		self.history:InterpolateAtTime(game.Workspace.DistributedGameTime - bySeconds);
	end;
end;
exports.BacktrackableAimHistory = BacktrackableAimHistory;
return exports;
