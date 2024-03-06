"use client";
import { useEffect } from "react";

import { motion, stagger, useAnimate } from "framer-motion";

import { cn } from "~/lib/utils";

export const TextGenerateEffect = ({
	words,
	className,
}: {
	words: string;
	className?: string;
}) => {
	const [scope, animate] = useAnimate();
	let wordsArray = words.split(" ");
	useEffect(() => {
		animate(
			"span",
			{
				opacity: 1,
			},
			{
				duration: 2,
				delay: stagger(0.2),
			},
		);
	}, [scope.current]);

	const renderWords = () => (
		<motion.div ref={scope}>
			{wordsArray.map((word, idx) => (
				<motion.span
					key={word + idx}
					className="text-black opacity-0 dark:text-white"
				>
					{word}{" "}
				</motion.span>
			))}
		</motion.div>
	);

	return (
		<div className={className}>
			<div className="mt-4">
				<div className=" text-black dark:text-white ">
					{renderWords()}
				</div>
			</div>
		</div>
	);
};
