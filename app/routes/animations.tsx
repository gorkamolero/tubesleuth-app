import { Outlet } from "@remix-run/react";
import { Appbar } from "~/components/Appbar";
import { HoverGrid } from "~/components/HoverGrid";
import { Card, CardTitle } from "~/components/ui/card-hover-effect";
import { Animation, animations } from "~/lib/animations";
import * as animationVids from "../utils/animations/all-animations";

export default function VideosPage() {
	return (
		<>
			<Appbar title="Animations" />
			<Outlet />
			<HoverGrid>
				{Object.values(animations).map((animation: Animation) => (
					<Card key={animation.key} className="p-0">
						<CardTitle>{animation.title}</CardTitle>
						<div style={{ aspectRatio: "9 / 16" }}>
							<video className="w-full h-full" controls loop>
								<source
									src={
										animationVids[
											animation.key as keyof typeof animationVids
										]
									}
									type="video/mp4"
								/>
								Your browser does not support the video tag.
							</video>
						</div>
					</Card>
				))}
			</HoverGrid>
		</>
	);
}
