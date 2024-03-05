import React from "react";

import { Separator } from "./separator";

interface StepperProps {
	steps: number;
	currentStep: number;
	title: string;
	children?: React.ReactNode;
}

const Stepper: React.FC<StepperProps> = ({
	steps,
	currentStep,
	title,
	children,
}) => {
	const progressPercentage = Math.round((currentStep / steps) * 100);

	return (
		<div className="sticky -top-6 z-10 flex w-full flex-col gap-4 bg-background pt-6">
			<div className="flex items-end gap-8">
				<div className="w-[66%]">
					<div className="mb-1 text-xs font-bold uppercase leading-tight tracking-wide text-gray-500">
						Step: {currentStep} of {steps}
					</div>
					<h1 className="text-md font-bold">{title}</h1>
				</div>

				<div className="mx-auto flex w-[34%] max-w-xl flex-col items-center justify-end gap-2 pb-2">
					<div className="h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-700 ">
						<div
							className="h-2 rounded-full bg-green-500"
							style={{ width: `${progressPercentage}%` }}
						/>
					</div>
					{children}
				</div>
			</div>
			<Separator />
		</div>
	);
};

export default Stepper;
