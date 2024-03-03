import * as React from "react";

import { cn } from "~/lib/utils";
import { useMediaQuery } from "~/hooks/use-media-query";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "~/components/ui/drawer";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "./ui/button";

interface DialogDrawerProps {
	trigger?: React.ReactNode;
	title?: string;
	description?: string;
	children?: React.ReactNode;
	open?: boolean;
	className?: string;
	fullScreen?: boolean;
}

export function DialogDrawer({
	trigger,
	title,
	description,
	children = <ProfileForm />,
	open: openDefault = false,
	className,
	fullScreen,
}: DialogDrawerProps) {
	const [open, setOpen] = React.useState(openDefault);
	const isDesktop = useMediaQuery("(min-width: 768px)");

	return isDesktop ? (
		<Dialog open={open} onOpenChange={setOpen}>
			{trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
			<DialogContent
				className={cn(
					"sm:max-w-[425px]",
					className,
					fullScreen &&
						"w-screen h-screen sm:max-w-none overflow-y-scroll",
				)}
				style={
					fullScreen
						? {
								height: "calc(100vh - 3.5rem)",
								width: "calc(100vw - 3.5rem)",
							}
						: {}
				}
			>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				{children}
			</DialogContent>
		</Dialog>
	) : (
		<Drawer open={open} onOpenChange={setOpen}>
			{trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}

			<DrawerContent>
				<DrawerHeader className="text-left">
					<DrawerTitle>{title}</DrawerTitle>
					<DrawerDescription>{description}</DrawerDescription>
				</DrawerHeader>
				{children}
				<DrawerFooter className="pt-2">
					<DrawerClose asChild>
						<Button variant="outline">Cancel</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}

function ProfileForm({ className }: React.ComponentProps<"form">) {
	return (
		<form className={cn("grid items-start gap-4", className)}>
			<div className="grid gap-2">
				<Label htmlFor="email">Email</Label>
				<Input
					type="email"
					id="email"
					defaultValue="shadcn@example.com"
				/>
			</div>
			<div className="grid gap-2">
				<Label htmlFor="username">Username</Label>
				<Input id="username" defaultValue="@shadcn" />
			</div>
			<Button type="submit">Save changes</Button>
		</form>
	);
}
