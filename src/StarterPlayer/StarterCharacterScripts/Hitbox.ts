import { BacktrackableAimHistory } from "ServerStorage/History/BacktrackableAimHistory";
import { BacktrackableHitboxCFrame } from "ServerStorage/History/BacktrackableHitboxCFrame";

const FRAME_COUNT = 30;

export let Hitbox =  new BacktrackableHitboxCFrame(<Model>(script.Parent), FRAME_COUNT)