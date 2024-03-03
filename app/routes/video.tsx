import { Outlet } from "@remix-run/react";
import { MainNav } from "~/components/MainNav";
import { Separator } from "~/components/ui/separator";

export default function Video() {
	return (
		<>
			<div className="h-[52px] px-2 gap-2 yolo w-full align-center flex">
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
			<div className="p-6">
				<Outlet />
			</div>
		</>
	);
}
