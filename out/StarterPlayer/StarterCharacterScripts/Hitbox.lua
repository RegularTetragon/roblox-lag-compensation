-- Compiled with https://roblox-ts.github.io v0.3.2
-- May 7, 2020, 12:38 AM Eastern Daylight Time

local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("RobloxTS"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"));
local exports = {};
local BacktrackableHitboxCFrame = TS.import(script, game:GetService("ServerStorage"), "LagCompensation", "History", "BacktrackableHitboxCFrame").BacktrackableHitboxCFrame;
local FRAME_COUNT = 30;
exports.Hitbox = BacktrackableHitboxCFrame.new(script.Parent, FRAME_COUNT);
return exports;
