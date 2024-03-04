import * as React from "react";
import { Lightbulb, Video, Sparkle, Play } from "lucide-react";
import { Nav } from "./Nav";
import { Separator } from "~/components/ui/separator";
import { Link } from "@remix-run/react";
import { cn } from "~/lib/utils";
import { ModeToggle } from "./mode-toggle";
import { NavLink } from "./NavLink";
import { LogoutButton } from "~/modules/auth";

interface SidebarProps {
	isCollapsed: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed }) => {
	return (
		<div className="flex flex-col h-full">
			<div
				className={`flex h-[52px] items-center justify-start ${
					isCollapsed ? "h-[52px] justify-center" : "px-2"
				}`}
			>
				<NavLink isCollapsed={isCollapsed}>
					<Link to="/account">
						<Sparkle className="h-4 w-4" />
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
};
