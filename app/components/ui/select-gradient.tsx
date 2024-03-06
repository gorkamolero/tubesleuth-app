import * as React from "react";

import * as SelectPrimitive from "@radix-ui/react-select";
import { useMotionTemplate, useMotionValue, motion } from "framer-motion";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

import { cn } from "~/lib/utils";

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Trigger>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => {
	const radius = 100; // change this to increase the radius of the hover effect
	const [visible, setVisible] = React.useState(false);

	let mouseX = useMotionValue(0);
	let mouseY = useMotionValue(0);

	function handleMouseMove({ currentTarget, clientX, clientY }: any) {
		let { left, top } = currentTarget.getBoundingClientRect();

		mouseX.set(clientX - left);
		mouseY.set(clientY - top);
	}

	return (
		<motion.div
			style={{
				background: useMotionTemplate`
          radial-gradient(
            ${
				visible ? radius + "px" : "0px"
			} circle at ${mouseX}px ${mouseY}px,
            var(--accent),
            transparent 80%
          )
        `,
			}}
			onMouseMove={handleMouseMove}
			onMouseEnter={() => setVisible(true)}
			onMouseLeave={() => setVisible(false)}
			className="rounded-lg p-[2px] transition duration-300"
		>
			<SelectPrimitive.Trigger
				ref={ref}
				className={cn(
					"flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
					className,
				)}
				{...props}
			>
				{children}
				<SelectPrimitive.Icon asChild>
					<ChevronDown className="size-4 opacity-50" />
				</SelectPrimitive.Icon>
			</SelectPrimitive.Trigger>
		</motion.div>
	);
});
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

// The rest of the components remain unchanged as they do not directly relate to the gradient effect implementation.
