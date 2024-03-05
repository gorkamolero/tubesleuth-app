import { Pause, Play } from "lucide-react";

import ProgressWrapper from "./PlayerProgress";
import { Card } from "../ui/card";

export const AudioPlayer = ({
	title = "Roxette",
	description = "Listen to your heart",
	onClick,
	isPlaying,
	progress,
	onChangeProgress,
}: {
	title: string;
	description: string;
	onClick: () => void;
	isPlaying: boolean;
	progress: number;
	onChangeProgress: (progress: number) => void;
}) => {
	const className =
		"h-7 w-7 fill-[#7e9cff] stroke-[#7e9cff] group-hover:fill-white group-hover:stroke-white";
	return (
		<>
			<Card className="max-h-70 relative flex w-full max-w-[768px] items-start justify-start rounded-md bg-white p-8 shadow-sm">
				<div className="text-align-left">
					<p className="grow text-2xl font-semibold text-gray-600">
						{title}
					</p>
					<p className="max-w-[70% text-lg font-normal text-gray-600">
						{description}
					</p>
				</div>
				<span className="group clear-left cursor-pointer rounded-full bg-[#eff0f9] p-4 [&_*]:transition-all [&_*]:duration-150 [&_*]:ease-in">
					<button
						onClick={onClick}
						className="block rounded-full bg-white p-3 shadow-md group-hover:bg-rose-600"
					>
						{isPlaying ? (
							<Pause
								className={className}
								strokeWidth="1.5"
								stroke="currentColor"
							/>
						) : (
							<Play
								className={className}
								strokeWidth="1.5"
								stroke="currentColor"
							/>
						)}
					</button>
				</span>
			</Card>
			<ProgressWrapper progress={progress} onChange={onChangeProgress} />
		</>
	);
};
