import { config } from "dotenv";
config();

export const token = process.env.TOKEN?.trim();
export const password = process.env.PASSWORD?.trim();
export const guild_id = process.env.GUILD_ID?.trim();

export const initial_backup = Boolean(process.env.INITIAL_BACKUP?.trim().toLocaleLowerCase());
export const live_backup = Boolean(process.env.LIVE_BACKUP?.trim().toLowerCase());

export const ignore_users = process.env.IGNORE_USERS?.split(",").map(v => v.trim()) || [];
export const ignore_channels = process.env.IGNORE_CHANNELS?.split(",").map(v => v.trim()) || [];