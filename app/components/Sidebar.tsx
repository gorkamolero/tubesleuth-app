import * as React from "react";
import { Archive, Video, Users, Sparkle } from "lucide-react";
import { Account } from "./Account";
import { Nav } from "./Nav";
import { Separator } from "~/components/ui/separator";
import { Button } from "./ui/button";
import { Link } from "@remix-run/react";
import { cn } from "~/lib/utils";

interface SidebarProps {
	isCollapsed: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed }) => {
	return (
		<>
			<div
				className={`flex h-[52px] items-center justify-start ${
					isCollapsed ? "h-[52px] justify-center" : "px-2"
				}`}
			>
				<Button
					asChild
					className={cn(
						"flex items-center gap-2",
						isCollapsed && "h-9 w-9 shrink-0 justify-center p-0",
					)}
					aria-label="Account information"
					variant="ghost"
				>
					<Link to="/account">
						<Sparkle className="h-4 w-4" />
						<h1 className={cn("text-sm", isCollapsed && "hidden")}>
							Tubesleuth
						</h1>
					</Link>
				</Button>
			</div>
			<Separator />
			<Nav
				isCollapsed={isCollapsed}
				links={[
					{
						title: "Ideas",
						label: "",
						icon: Archive, // Replace with appropriate icon
						variant: "ghost",
						to: "/ideas",
					},
					{
						title: "Videos",
						label: "",
						icon: Video, // Replace with appropriate icon
						variant: "ghost",
						to: "/videos",
					},
					{
						title: "Channels",
						label: "",
						icon: Users, // Replace with appropriate icon
						variant: "ghost",
						to: "/channels",
					},
				]}
			/>
		</>
	);
};
