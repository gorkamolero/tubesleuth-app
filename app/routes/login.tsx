import * as React from "react";

import type {
	ActionFunctionArgs,
	LoaderFunctionArgs,
	MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useNavigation, useSearchParams } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { parseFormAny, useZorm } from "react-zorm";
import { z } from "zod";

import { LabelInputContainer } from "~/components/LabelInputContainer";
import { BottomGradient } from "~/components/ui/bottom-gradient";
import { GradientSeparator } from "~/components/ui/gradient-separator";
import { Input } from "~/components/ui/input-gradient";
import { Label } from "~/components/ui/label-gradient";
import { i18nextServer } from "~/integrations/i18n";
import {
	createAuthSession,
	getAuthSession,
	signInWithEmail,
	ContinueWithEmailForm,
} from "~/modules/auth";
import { assertIsPost, isFormProcessing } from "~/utils";
import { updateInvitation } from "~/modules/invitations";

export async function loader({ request }: LoaderFunctionArgs) {
	const authSession = await getAuthSession(request);
	const t = await i18nextServer.getFixedT(request, "auth");
	const title = t("login.title");

	if (authSession) return redirect("/home");

	return json({ title });
}

const LoginFormSchema = z.object({
	email: z
		.string()
		.email("Invalid email")
		.transform((email) => email.toLowerCase()),
	password: z.string().min(8, "Password is too short"),
	redirectTo: z.string().optional(),
});

export async function action({ request }: ActionFunctionArgs) {
	assertIsPost(request);
	const formData = await request.formData();
	const result = await LoginFormSchema.safeParseAsync(parseFormAny(formData));

	if (!result.success) {
		return json(
			{
				errors: result.error,
			},
			{ status: 400 },
		);
	}

	const { email, password, redirectTo } = result.data;

	const authSession = await signInWithEmail(email, password);

	if (!authSession) {
		return json(
			{ errors: { email: "Invalid email-password", password: null } },
			{ status: 400 },
		);
	}

	await updateInvitation({
		email,
		data: {
			accepted: true,
			updatedAt: new Date(),
			userId: authSession.userId,
		},
	});

	return createAuthSession({
		request,
		authSession,
		redirectTo: redirectTo || "/",
	});
}

export const meta: MetaFunction<typeof loader> = ({ data }) => [
	{
		title: data?.title,
	},
];

export default function LoginPage() {
	const zo = useZorm("NewQuestionWizardScreen", LoginFormSchema);
	const [searchParams] = useSearchParams();
	const redirectTo = searchParams.get("redirectTo") ?? undefined;

	const navigation = useNavigation();
	const disabled = isFormProcessing(navigation.state);
	const { t } = useTranslation("auth");

	return (
		<div className="flex min-h-full w-full flex-col justify-center">
			<div className="mx-auto w-full max-w-md rounded-none bg-white p-4 shadow-input dark:bg-black md:rounded-2xl md:p-8">
				<h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
					Welcome to Tubesleuth
				</h2>
				<Form
					ref={zo.ref}
					method="post"
					className="my-8 space-y-6"
					replace
				>
					<LabelInputContainer className="mb-4">
						<Label htmlFor={zo.fields.email()}>
							{t("login.email")}
						</Label>

						<Input
							data-test-id="email"
							required
							autoFocus={true}
							name={zo.fields.email()}
							type="email"
							autoComplete="email"
							disabled={disabled}
							placeholder="projectmayhem@fc.com"
						/>
						{zo.errors.email()?.message && (
							<div
								className="pt-1 text-sm text-red-700"
								id="email-error"
							>
								{zo.errors.email()?.message}
							</div>
						)}
					</LabelInputContainer>

					<LabelInputContainer className="mb-4">
						<Label htmlFor={zo.fields.password()}>
							{t("register.password")}
						</Label>
						<Input
							data-test-id="password"
							name={zo.fields.password()}
							type="password"
							autoComplete="new-password"
							disabled={disabled}
							placeholder="••••••••"
						/>
						{zo.errors.password()?.message && (
							<div
								className="pt-1 text-sm text-red-700"
								id="password-error"
							>
								{zo.errors.password()?.message}
							</div>
						)}
					</LabelInputContainer>

					<input
						type="hidden"
						name={zo.fields.redirectTo()}
						value={redirectTo}
					/>
					<button
						data-test-id="login"
						type="submit"
						className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
						disabled={disabled}
					>
						{t("login.action")}
						<BottomGradient />
					</button>
					<div className="flex items-center justify-center text-center text-sm text-gray-500">
						<Link to="/forgot-password" className="hover:underline">
							{t("login.forgotPassword")}?
						</Link>
					</div>
					<div className="flex items-center justify-center">
						<div className="text-center text-sm text-gray-500">
							{t("login.dontHaveAccount")}{" "}
							<Link
								className="underline"
								to={{
									pathname: "/join",
									search: searchParams.toString(),
								}}
							>
								{t("login.signUp")}
							</Link>
						</div>
					</div>
				</Form>
				<GradientSeparator />
				<div className="mt-6">
					<ContinueWithEmailForm />
				</div>
			</div>
		</div>
	);
}
