import { useEffect } from "react";

import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { parseFormAny, useZorm } from "react-zorm";
import { toast } from "sonner";
import { z } from "zod";

import { LabelInputContainer } from "~/components/LabelInputContainer";
import { BottomGradient } from "~/components/ui/bottom-gradient";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label-gradient";
import { i18nextServer } from "~/integrations/i18n";
import { getAuthSession, sendResetPasswordLink } from "~/modules/auth";
import { assertIsPost, isFormProcessing, tw } from "~/utils";

export async function loader({ request }: LoaderFunctionArgs) {
	const authSession = await getAuthSession(request);
	const t = await i18nextServer.getFixedT(request, "auth");
	const title = t("login.forgotPassword");

	if (authSession) return redirect("/notes");

	return json({ title });
}

const ForgotPasswordSchema = z.object({
	email: z
		.string()
		.email("Invalid email")
		.transform((email) => email.toLowerCase()),
});

export async function action({ request }: ActionFunctionArgs) {
	assertIsPost(request);

	const formData = await request.formData();
	const result = await ForgotPasswordSchema.safeParseAsync(
		parseFormAny(formData),
	);

	if (!result.success) {
		return json(
			{
				message: "invalid-request",
			},
			{ status: 400 },
		);
	}

	const { email } = result.data;

	const { error } = await sendResetPasswordLink(email);

	if (error) {
		return json(
			{
				message: "unable-to-send-reset-password-link",
			},
			{ status: 500 },
		);
	}

	return json({ message: null });
}

export default function ForgotPassword() {
	const zo = useZorm("ForgotPasswordForm", ForgotPasswordSchema);
	const { t } = useTranslation("auth");
	const actionData = useActionData<typeof action>();
	const navigation = useNavigation();
	const disabled = isFormProcessing(navigation.state);

	useEffect(() => {
		if (actionData?.message) {
			toast.success(t("register.checkEmail"));
		} else {
			toast.error(
				"Unable to send reset password link. Please try again.",
			);
		}
	}, [actionData]);

	return (
		<div className="flex min-h-full w-full flex-col justify-center">
			<div className="mx-auto w-full max-w-md rounded-none bg-white p-4 shadow-input dark:bg-black md:rounded-2xl md:p-8">
				<h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
					Recover your password
				</h2>
				<Form
					ref={zo.ref}
					method="post"
					className="mt-8 space-y-6"
					replace
				>
					<LabelInputContainer className="mb-4">
						<Label htmlFor={zo.fields.email()}>
							{t("register.email")}
						</Label>
						<Input
							data-test-id="email"
							name={zo.fields.email()}
							type="email"
							autoComplete="email"
							disabled={disabled}
						/>
						{zo.errors.email()?.message && (
							<div
								className="pt-1 text-sm text-red-700"
								id="password-error"
							>
								{zo.errors.email()?.message}
							</div>
						)}
					</LabelInputContainer>

					<button
						data-test-id="send-password-reset-link"
						type="submit"
						className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
						disabled={disabled}
					>
						{t("register.sendLink")}

						<BottomGradient />
					</button>
				</Form>
			</div>
		</div>
	);
}
