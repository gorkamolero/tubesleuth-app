import React from "react";

import { useFetcher } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { BottomGradient } from "~/components/ui/bottom-gradient";
import { Input } from "~/components/ui/input-gradient";
import type { action } from "~/routes/send-magic-link";


export function ContinueWithEmailForm() {
	const ref = React.useRef<HTMLFormElement>(null);
	const sendMagicLink = useFetcher<typeof action>();
	const { data, state } = sendMagicLink;
	const isSuccessFull = state === "idle" && data != null && !data.error;
	const isLoading = state === "submitting" || state === "loading";
	const { t } = useTranslation("auth");
	const buttonLabel = isLoading
		? t("register.sendingLink")
		: t("register.continueWithEmail");

	React.useEffect(() => {
		if (isSuccessFull) {
			toast.success(t("register.checkEmail"));
			ref.current?.reset();
		}
	}, [isSuccessFull]);

	return (
		<sendMagicLink.Form method="post" action="/send-magic-link" ref={ref}>
			<div className="grid gap-2">
				<Input
					placeholder="Or continue with magic link"
					type="email"
					name="email"
					id="magic-link"
					disabled={isLoading}
				/>
				<button
					type="submit"
					disabled={isLoading}
					className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
				>
					{buttonLabel}
					<BottomGradient />
				</button>
			</div>
		</sendMagicLink.Form>
	);
}
