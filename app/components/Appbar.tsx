import { cn } from "~/lib/utils";
import { Separator } from "./ui/separator";

export const Appbar = ({
	title,
	className,
	children,
}: {
	title: string;
	className?: string;
	children?: React.ReactNode;
}) => {
	return (
		<div className="flex flex-col">
			<div
				className={cn(
					"flex items-center px-4 py-2 h-[52px]",
					className,
				)}
			>
				<div className="flex items-center space-x-4">
					<h1 className="text-xl">{title}</h1>
				</div>
				<div className="flex ml-auto items-center space-x-4">
					{children}
				</div>
			</div>
			<Separator />
		</div>
	);
};
