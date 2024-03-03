import React from "react";
import { Separator } from "./separator";

interface StepperProps {
	steps: number;
	currentStep: number;
	title: string;
}

const Stepper: React.FC<StepperProps> = ({ steps, currentStep, title }) => {
	const progressPercentage = Math.round((currentStep / steps) * 100);

	return (
		<div className="flex flex-col gap-4 sticky -top-6 bg-background pt-6">
			<div className="flex items-end gap-8">
				<div className="w-[66%]">
					<div className="uppercase tracking-wide text-xs font-bold text-gray-500 mb-1 leading-tight">
						Step: {currentStep} of {steps}
					</div>
					<h1 className="text-md font-bold">{title}</h1>
				</div>

				<div className="w-[34%] pb-2 max-w-xl mx-auto flex gap-2 items-center justify-end">
					<div className="flex-1 bg-gray-200 rounded-full h-2 dark:bg-gray-700 ">
						<div
							className="bg-green-500 h-2 rounded-full"
							style={{ width: `${progressPercentage}%` }}
						/>
					</div>
				</div>
			</div>
			<Separator />
		</div>
	);
};

export default Stepper;
