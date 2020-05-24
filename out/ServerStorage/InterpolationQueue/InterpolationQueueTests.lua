-- Compiled with https://roblox-ts.github.io v0.3.2
-- May 7, 2020, 12:38 AM Eastern Daylight Time

local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("RobloxTS"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"));
local exports = {};
local InterpolatableNumber;
local InterpolationQueue = TS.import(script, game:GetService("ServerStorage"), "LagCompensation", "InterpolationQueue", "InterpolationQueue").InterpolationQueue;
local _0 = TS.import(script, game:GetService("ServerStorage"), "LagCompensation", "History", "BacktrackableHitboxCFrame");
local ModelCFrameInterpolator, BacktrackableHitboxCFrame = _0.ModelCFrameInterpolator, _0.BacktrackableHitboxCFrame;
do
	InterpolatableNumber = setmetatable({}, {
		__tostring = function() return "InterpolatableNumber" end;
	});
	InterpolatableNumber.__index = InterpolatableNumber;
	function InterpolatableNumber.new(...)
		local self = setmetatable({}, InterpolatableNumber);
		self:constructor(...);
		return self;
	end;
	function InterpolatableNumber:constructor(x)
		self.value = x;
	end;
	function InterpolatableNumber:Lerp(other, alpha)
		return InterpolatableNumber.new((other.value - self.value) * alpha + self.value);
	end;
end;
local function GenerateLinear()
	local queue = InterpolationQueue.new(30);
	do
		local i = 0;
		while i < 30 do
			queue:Append(InterpolatableNumber.new(i), i);
			i = i + 1;
		end;
	end;
	return queue;
end;
local function TestLinear()
	local queue = GenerateLinear();
	local out = {};
	do
		local j = 0;
		while j < 30 do
			out[#out + 1] = (queue:InterpolateAtTime(j).contents).value;
			out[#out + 1] = (queue:InterpolateAtTime(j + .5).contents).value;
			j = j + 1;
		end;
	end;
	do
		local k = 0;
		while k < 59 do
			assert(math.abs(out[k + 1] - k / 2) < .01, out[k + 1] .. " Exceeds maximum absolute error of .01 in comparison to " .. k / 2 .. " for index " .. k);
			k = k + 1;
		end;
	end;
end;
local function TestExtrapolationUpperBound()
	local queue = GenerateLinear();
	local err = math.abs((queue:InterpolateAtTime(100).contents).value - 100);
	assert(err < .01, "Queue does not extrapolate above bounds within acceptable error, absolute error: " .. err);
end;
local function TestExtrapolationLowerBound()
	local queue = GenerateLinear();
	local err = math.abs((queue:InterpolateAtTime(-1).contents).value + 1);
	assert(err < .01, "Queue does not extrapolate below bounds within acceptable error, absolute error: " .. err);
end;
local function TestFlyingArrows()
	local arrows = game:GetService("ServerStorage"):FindFirstChild("TestingModels"):FindFirstChild("Arrows"):Clone();
	arrows.Parent = game.Workspace;
	local queue = InterpolationQueue.new(3);
	queue:Append(ModelCFrameInterpolator:FromCharacter(arrows), 0);
	arrows:SetPrimaryPartCFrame(((CFrame.Angles(7, 4, 2):Inverse() * (CFrame.new(0, 6, 3))) * (CFrame.Angles(1, 8, 2))));
	queue:Append(ModelCFrameInterpolator:FromCharacter(arrows), 5);
	arrows:SetPrimaryPartCFrame(((CFrame.Angles(3, 9, 8):Inverse() * (CFrame.new(7, 6, 2))) * (CFrame.Angles(1, 3, 8))));
	queue:Append(ModelCFrameInterpolator:FromCharacter(arrows), 10);
	local t = 0;
	while t < 10 do
		(queue:InterpolateAtTime(t).contents):Apply();
		t = t + ((wait()));
	end;
end;
local function TestLinearArrows()
	local arrows = game:GetService("ServerStorage"):FindFirstChild("TestingModels"):FindFirstChild("Arrows"):Clone();
	arrows.Parent = game.Workspace;
	local queue = InterpolationQueue.new(10);
	do
		local i = 0;
		while i < 10 do
			arrows:SetPrimaryPartCFrame((arrows:GetPrimaryPartCFrame() * (CFrame.new(5, 0, 0))));
			queue:Append(ModelCFrameInterpolator:FromCharacter(arrows), i);
			i = i + 1;
		end;
	end;
	local t = -5;
	while t < 15 do
		(queue:InterpolateAtTime(t).contents):Apply();
		t = t + ((wait()));
	end;
end;
local function GenerateGraphPoint(x, y, c, parent)
	local part = Instance.new("Part", parent);
	part.Size = Vector3.new(1, 1, 1);
	part.CFrame = CFrame.new(x, y, 0);
	part.BrickColor = c;
	part.Anchored = true;
	return part;
end;
local function TestHitbox()
	local arrows = game:GetService("ServerStorage"):FindFirstChild("TestingModels"):FindFirstChild("UnanchoredArrows"):Clone();
	arrows:SetPrimaryPartCFrame(CFrame.new(5, 10, 0));
	arrows.Parent = game.Workspace;
	local hitbox = BacktrackableHitboxCFrame.new(arrows, 60);
	local startTime = game.Workspace.DistributedGameTime;
	wait(1);
	local t = 0;
	repeat
		do
			t = t + (wait());
			hitbox:BacktrackHitbox(game.Workspace.DistributedGameTime - 1);
		end;
	until not (true);
end;
local function TestQuadraticGraph()
	local model = Instance.new("Model", game.Workspace);
	model.Name = "QuadraticGraph";
	local queue = InterpolationQueue.new(50);
	do
		local x = -25;
		while x < 25 do
			local y = x * x;
			GenerateGraphPoint(x, y, BrickColor.new(0, 1, 0), model);
			queue:Append(InterpolatableNumber.new(y), x);
			x = x + 1;
		end;
	end;
	do
		local x = -25;
		while x < 25 do
			local y = (queue:InterpolateAtTime(x).contents).value;
			GenerateGraphPoint(x, y, BrickColor.new(1, 0, 0), model);
			x = x + (.05);
		end;
	end;
end;
local function TestMovingGraph()
	local queue = InterpolationQueue.new(20);
	local model = Instance.new("Model", game.Workspace);
	model.Name = "Moving Graph";
	do
		local x = -5;
		while x < 5 do
			local y = math.sin(x / 10 * math.pi) * 10 + 15;
			queue:Append(InterpolatableNumber.new(y), x);
			x = x + 1;
		end;
	end;
	local x = 5;
	while x < 100 do
		local y = math.sin(x) * 10 + 15;
		queue:Append(InterpolatableNumber.new(y), x);
		local brickList = {};
		do
			local i = queue:GetTimeBegin() - 5;
			while i <= queue:GetTimeEnd() + 5 do
				brickList[#brickList + 1] = GenerateGraphPoint(i * 2, (queue:InterpolateAtTime(i).contents).value, BrickColor.new(1, 0, 0), model);
				i = i + (1 / 8);
			end;
		end;
		local dt = (wait(1 / 10)) * 2 * math.pi;
		local _2 = x;
		local _1 = dt;
		x = _2 + ((_1 ~= 0 and _1 == _1 and _1) or 0);
		TS.array_forEach(brickList, function(p)
			return p:Destroy();
		end);
	end;
end;
exports.TestLinear = TestLinear;
exports.TestExtrapolationUpperBound = TestExtrapolationUpperBound;
exports.TestExtrapolationLowerBound = TestExtrapolationLowerBound;
exports.TestFlyingArrows = TestFlyingArrows;
exports.TestLinearArrows = TestLinearArrows;
exports.TestHitbox = TestHitbox;
exports.TestQuadraticGraph = TestQuadraticGraph;
exports.TestMovingGraph = TestMovingGraph;
return exports;
