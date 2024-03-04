import { relations } from "drizzle-orm";
import {
	pgTable,
	text,
	timestamp,
	boolean,
	integer,
	pgEnum,
	uuid,
} from "drizzle-orm/pg-core";
import { FX, TRANSITIONS, VIDEO_TYPES, VOICEMODELS } from "./enums";

export const users = pgTable("users", {
	id: uuid("id").primaryKey(),
	email: text("email").unique(),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export const ideas = pgTable("ideas", {
	id: uuid("id").primaryKey(),
	title: text("title"),
	description: text("description"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
	userId: uuid("user_id").references(() => users.id),
});

export const fx = pgEnum("fx", Object.values(FX) as [string, ...string[]]);

export const transition = pgEnum(
	"transition",
	Object.values(TRANSITIONS) as [string, ...string[]],
);

export const images = pgTable("images", {
	id: uuid("id").primaryKey(),
	title: text("title"),
	description: text("description"),
	prompt: text("prompt"),
	fx: fx("MoveAround"),
	transition: transition("Fade"),
	start: integer("start"),
	end: integer("end"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
	userId: uuid("user_id").references(() => users.id),
	videoId: uuid("video_id").references(() => videos.id),
	src: text("src"),
	tmpSrc: text("tmp_src"),
	generations: integer("generations"),
});

export const imageMaps = pgTable("image_maps", {
	id: uuid("id").primaryKey(),
	title: text("title"),
	imageId: uuid("image_id").references(() => images.id),
	start: integer("start"),
	end: integer("end"),
	videoId: uuid("video_id").references(() => videos.id),
	fx: fx("MoveAround"),
	transition: transition("Fade"),
	description: text("description"),
});

export const videoType = pgEnum(
	"video_type",
	Object.values(VIDEO_TYPES) as [string, ...string[]],
);
export const voiceModel = pgEnum(
	"voicemodel",
	Object.values(VOICEMODELS) as [string, ...string[]],
);

export const videos = pgTable("videos", {
	id: uuid("id").primaryKey(),
	title: text("title"),
	description: text("description"),
	tags: text("tags"),
	script: text("script"),
	voiceover: text("voiceover"),
	transcript: text("transcript"),
	draft: boolean("draft").default(true),
	uploaded: boolean("uploaded").default(false),
	videofile: text("videofile"),
	type: videoType("short"),
	channelId: uuid("channel_id").references(() => channels.id),
	notes: text("notes"),
	ideaId: uuid("idea_id").references(() => ideas.id),
	userId: uuid("user_id").references(() => users.id),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
	imageMap: text("image_map"),
	readyToRender: boolean("ready_to_render").default(false),
	voicemodel: voiceModel("voicemodel"),
	music: text("music"),
});

export const channels = pgTable("channels", {
	id: uuid("id").primaryKey(),
	name: text("name"),
	cta: text("cta"),
	writingStyle: text("writing_style"),
	voicemodel: voiceModel("onyx"),
	imageStyle: text("image_style"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
	userId: uuid("user_id").references(() => users.id),
});

export const usersRelations = relations(users, ({ many }) => ({
	videos: many(videos),
	channels: many(channels),
	ideas: many(ideas),
}));

export const ideasRelations = relations(ideas, ({ one, many }) => ({
	videos: many(videos),
}));

export const imageMapsRelations = relations(imageMaps, ({ one }) => ({
	image: one(images, {
		fields: [imageMaps.imageId],
		references: [images.id],
	}),
	video: one(videos, {
		fields: [imageMaps.videoId],
		references: [videos.id],
	}),
}));

export const videosRelations = relations(videos, ({ one, many }) => ({
	images: many(images),
	channel: one(channels, {
		fields: [videos.channelId],
		references: [channels.id],
	}),
	user: one(users, {
		fields: [videos.userId],
		references: [users.id],
	}),
	imageMaps: one(imageMaps, {
		fields: [videos.id],
		references: [imageMaps.videoId],
	}),
	idea: one(ideas, {
		fields: [videos.ideaId],
		references: [ideas.id],
	}),
}));

export const channelsRelations = relations(channels, ({ one, many }) => ({
	user: one(users, {
		fields: [channels.userId],
		references: [users.id],
	}),
	videos: many(videos),
}));

export const imagesRelations = relations(images, ({ many }) => ({
	imageMaps: many(imageMaps),
}));
