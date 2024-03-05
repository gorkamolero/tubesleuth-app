import { Moon, Sun } from "lucide-react";
import { Theme, useTheme } from "remix-themes";

import { cn } from "~/lib/utils";

import { Button } from "./ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function ModeToggle({ isCollapsed }: { isCollapsed: boolean }) {
	const [, setTheme] = useTheme();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					aria-label="Toggle theme"
					variant="outline"
					className={cn(
						isCollapsed && "justify-center p-0 max-w-full",
					)}
				>
					<div
						className={cn(
							"flex items-center gap-2",
							isCollapsed &&
								"h-9 w-9 shrink-0 justify-center p-0",
						)}
					>
						<Sun className="size-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
						<Moon className="absolute size-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
						{isCollapsed || <div>Toggle theme</div>}
					</div>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem onClick={() => setTheme(Theme.LIGHT)}>
					Light
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme(Theme.DARK)}>
					Dark
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
