import { cn } from "~/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@remix-run/react";
import { useState } from "react";

export const HoverEffect = ({
	items,
	className,
}: {
	items: {
		title: string;
		description: string;
		link: string;
	}[];
	className?: string;
}) => {
	let [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

	return (
		<div
			className={cn(
				"grid grid-cols-1 md:grid-cols-2  lg:grid-cols-3 ",
				className,
			)}
		>
			{items.map((item, idx) => (
				<Link
					to={item?.link}
					key={item?.link}
					className="relative group  block p-2 h-full w-full"
					onMouseEnter={() => setHoveredIndex(idx)}
					onMouseLeave={() => setHoveredIndex(null)}
				>
					<AnimatePresence>
						{hoveredIndex === idx && (
							<motion.span
								className="absolute inset-0 h-full w-full bg-neutral-200 dark:bg-slate-800/[0.8] block rounded"
								layoutId="hoverBackground"
								initial={{ opacity: 0 }}
								animate={{
									opacity: 1,
									transition: { duration: 0.15 },
								}}
								exit={{
									opacity: 0,
									transition: { duration: 0.15, delay: 0.2 },
								}}
							/>
						)}
					</AnimatePresence>
					<Card>
						<CardTitle>{item.title}</CardTitle>
						<CardDescription>{item.description}</CardDescription>
					</Card>
				</Link>
			))}
		</div>
	);
};

export const Card = ({
	className,
	children,
}: {
	className?: string;
	children: React.ReactNode;
}) => {
	return (
		<div
			className={cn(
				"rounded-2xl h-full w-full p-4 overflow-hidden bg-background border dark:border-white/[0.2] group-hover:border-slate-700 relative z-20 ",
				className,
			)}
		>
			<div className="relative z-50 h-full">
				<div className="p-4 flex flex-col h-full gap-8">{children}</div>
			</div>
		</div>
	);
};
export const CardTitle = ({
	className,
	children,
}: {
	className?: string;
	children: React.ReactNode;
}) => {
	return (
		<h4
			className={cn(
				" text-base sm:text-xl text-black mt-4 mb-2 dark:text-neutral-200",
				className,
			)}
		>
			{children}
		</h4>
	);
};
export const CardDescription = ({
	className,
	children,
}: {
	className?: string;
	children: React.ReactNode;
}) => {
	return (
		<p
			className={cn(
				"text-sm text-neutral-600 dark:text-neutral-400",
				className,
			)}
		>
			{children}
		</p>
	);
};
export const CardActions = ({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) => {
	return (
		<div
			className={cn(
				"flex justify-end items-center space-x-4 mt-auto",
				className,
			)}
		>
			{children}
		</div>
	);
};
