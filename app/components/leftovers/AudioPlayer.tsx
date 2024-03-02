import { Pause, Play } from "lucide-react";
import { Card } from "../ui/card";
import ProgressWrapper from "./PlayerProgress";

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
			<Card className="bg-white w-full max-w-[768px] flex justify-start items-start p-8 relative max-h-70 shadow-sm rounded-md">
				<div className="text-align-left">
					<p className="text-2xl font-semibold grow text-gray-600">
						{title}
					</p>
					<p className="text-lg font-normal text-gray-600 max-w-[70%">
						{description}
					</p>
				</div>
				<span className="clear-left rounded-full bg-[#eff0f9] p-4 cursor-pointer group [&_*]:transition-all [&_*]:duration-150 [&_*]:ease-in">
					<button
						onClick={onClick}
						className="px-3 py-3 block bg-white rounded-full shadow-md group-hover:bg-rose-600"
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
