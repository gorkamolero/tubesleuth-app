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
			className="h-2 w-full cursor-pointer overflow-hidden rounded-lg bg-gray-200"
			onClick={handleClick}
		>
			<div
				className="h-2 rounded-lg bg-blue-600"
				style={{ width: `${progress}%` }}
			></div>
		</div>
	);
};

export default ProgressWrapper;
