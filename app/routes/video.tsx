import { Outlet } from "@remix-run/react";

import { MainNav } from "~/components/MainNav";
import { Separator } from "~/components/ui/separator";

export default function Video() {
	return (
		<>
			<div className="align-center flex h-[52px] w-full gap-2 px-2">
				<MainNav
					items={[
						{
							title: "New",
						},
						{
							title: "Edit",
							to: "/edit",
						},
						{
							title: "Image Map",
						},
						{
							title: "Images",
						},
						{
							title: "Video",
						},
					]}
				/>
			</div>
			<Separator />
			<div className="border-box p-6">
				<Outlet />
			</div>
		</>
	);
}
