import React, { useCallback } from "react";

interface ProgressWrapperProps {
	progress: number; // Current progress as a percentage
	onChange: (newProgress: number) => void; // Callback function to handle changes
}

export const ProgressWrapper: React.FC<ProgressWrapperProps> = ({
	progress,
	onChange,
}) => {
	const handleClick = useCallback(
		(event: React.MouseEvent<HTMLDivElement>) => {
			const target = event.target as HTMLDivElement;
			const rect = target.getBoundingClientRect();
			const newProgress =
				((event.clientX - rect.left) / rect.width) * 100;

			onChange(newProgress);
		},
		[onChange],
	);

	return (
		<div
			className="w-full bg-gray-200 h-2 cursor-pointer rounded-lg overflow-hidden"
			onClick={handleClick}
		>
			<div
				className="bg-blue-600 h-2 rounded-lg"
				style={{ width: `${progress}%` }}
			></div>
		</div>
	);
};

export default ProgressWrapper;
