import * as React from "react";

import { Link } from "@remix-run/react";
import { Lightbulb, Video, Sparkle, Play } from "lucide-react";

import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";
import { LogoutButton } from "~/modules/auth";

import { ModeToggle } from "./mode-toggle";
import { Nav } from "./Nav";
import { NavLink } from "./NavLink";

interface SidebarProps {
	isCollapsed: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed }) => (
	<div className="flex h-full flex-col">
		<div
			className={`flex h-[52px] items-center justify-start ${
				isCollapsed ? "h-[52px] justify-center" : "px-2"
			}`}
		>
			<NavLink isCollapsed={isCollapsed}>
				<Link to="/account" data-test-id="account">
					<Sparkle className="size-4" />
					<h1 className={cn("text-sm", isCollapsed && "hidden")}>
						Tubesleuth
					</h1>
				</Link>
			</NavLink>
		</div>
		<Separator />
		<Nav
			isCollapsed={isCollapsed}
			links={[
				{
					title: "Ideas",
					label: "",
					icon: Lightbulb,
					variant: "ghost",
					to: "/ideas",
				},
				{
					title: "Videos",
					label: "",
					icon: Video,
					variant: "ghost",
					to: "/videos",
				},
				{
					title: "Channels",
					label: "",
					icon: Play,
					variant: "ghost",
					to: "/channels",
				},
			]}
		/>
		<div className="mt-auto grid gap-2 p-2">
			<ModeToggle isCollapsed={isCollapsed} />
			<LogoutButton isCollapsed={isCollapsed} />
		</div>
	</div>
);
