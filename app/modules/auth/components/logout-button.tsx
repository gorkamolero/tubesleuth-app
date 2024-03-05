import { Form } from "@remix-run/react";
import { LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

// TODO: CHECK THIS FOR ACTIONS
export function LogoutButton({ isCollapsed }: { isCollapsed?: boolean }) {
	const { t } = useTranslation("auth");

	return (
		<Form action="/logout" method="post" className="w-full">
			<Button
				data-test-id="logout"
				type="submit"
				className={cn(
					"w-full",
					isCollapsed && "justify-center p-0 max-w-full",
				)}
				variant="outline"
			>
				<div className="flex items-center gap-2">
					<LogOut className="size-4" />
					{isCollapsed || t("logout.action")}
				</div>
			</Button>
		</Form>
	);
}
