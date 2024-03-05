import type { ReactNode } from "react";
import { useState, Children } from "react";

import { AnimatePresence, motion } from "framer-motion";

import { cn } from "~/lib/utils";

interface HoverGridProps {
	className?: string;
	children: ReactNode;
	noPadding?: boolean;
}

export const HoverGrid = ({
	children,
	className,
	noPadding,
}: HoverGridProps) => {
	let [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

	return (
		<div
			className={cn(
				"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-4 overflow-y-auto",
				className,
			)}
		>
			{Children.map(children, (child, idx) => (
				<div
					onMouseEnter={() => setHoveredIndex(idx)}
					onMouseLeave={() => setHoveredIndex(null)}
					className={"relative p-4"}
				>
					<AnimatePresence>
						{hoveredIndex === idx && (
							<motion.span
								className="absolute inset-0 block size-full rounded-3xl bg-neutral-200 dark:bg-slate-800/[0.8]"
								layoutId="hoverBackground"
								initial={{ opacity: 0 }}
								animate={{
									opacity: 1,
									transition: { duration: 0.15 },
								}}
								exit={{
									opacity: 0,
									transition: {
										duration: 0.15,
										delay: 0.2,
									},
								}}
							/>
						)}
					</AnimatePresence>
					{child}
				</div>
			))}
		</div>
	);
};
