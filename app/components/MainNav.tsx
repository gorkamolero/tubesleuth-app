import * as React from "react";
import { Link } from "@remix-run/react";

import { cn } from "~/lib/utils";
import { LucideIcon } from "lucide-react";
import { Button } from "./ui/button";

export interface NavItem {
	title: string;
	to?: string;
	disabled?: boolean;
	external?: boolean;
	icon?: LucideIcon;
	label?: string;
}

interface MainNavProps {
	items?: NavItem[];
}

export function MainNav({ items }: MainNavProps) {
	return (
		<div className="flex gap-6 md:gap-10 items-center ">
			{items?.length ? (
				<nav className="flex gap-6 items-center">
					{items?.map(
						(item, index) =>
							item.to && (
								<Button
									asChild
									key={index}
									variant="ghost"
									className="block"
								>
									<Link
										key={index}
										to={item.to}
										className={cn(
											"flex items-center text-sm font-medium text-muted-foreground",
											item.disabled &&
												"cursor-not-allowed opacity-80",
										)}
									>
										{item.title}
									</Link>
								</Button>
							),
					)}
				</nav>
			) : null}
		</div>
	);
}
