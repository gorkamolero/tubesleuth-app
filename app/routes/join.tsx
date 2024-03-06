import * as React from "react";

import type {
	ActionFunctionArgs,
	LoaderFunctionArgs,
	MetaFunction,
} from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { Form, Link, useNavigation, useSearchParams } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { parseFormAny, useZorm } from "react-zorm";
import { jsonWithError } from "remix-toast";
import { z } from "zod";

import { LabelInputContainer } from "~/components/LabelInputContainer";
import { BottomGradient } from "~/components/ui/bottom-gradient";
import { Input } from "~/components/ui/input-gradient";
import { Label } from "~/components/ui/label-gradient";
import { i18nextServer } from "~/integrations/i18n";
import { createAuthSession, getAuthSession } from "~/modules/auth";
import { getUserByEmail, createUserAccount } from "~/modules/user";
import { assertIsPost, isFormProcessing } from "~/utils";

export async function loader({ request }: LoaderFunctionArgs) {
	const authSession = await getAuthSession(request);
	const t = await i18nextServer.getFixedT(request, "auth");
	const title = t("register.title");

	if (authSession) return redirect("/home");

	return json({ title });
}

const JoinFormSchema = z.object({
	firstName: z.string().min(2, "First name is too short"),
	lastName: z.string().min(2, "Last name is too short"),
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
	const emailFromForm = formData.get("email") as string;

	const result = await JoinFormSchema.safeParseAsync(parseFormAny(formData));

	if (!result.success) {
		return json(
			{
				errors: result.error,
			},
			{ status: 400 },
		);
	}

	const { firstName, lastName, email, password, redirectTo } = result.data;

	const existingUser = await getUserByEmail(email);

	if (existingUser) {
		return jsonWithError(null, "User already exists");
	}

	const authSession = await createUserAccount({
		email,
		password,
		firstName,
		lastName,
	});

	if (!authSession) {
		return jsonWithError(
			{
				type: "error",
			},
			"Unable to create user",
		);
	}

	return createAuthSession({
		request,
		authSession,
		redirectTo: redirectTo || "/home",
	});
}

export const meta: MetaFunction<typeof loader> = ({ data }) => [
	{
		title: data?.title,
	},
];

export default function Join() {
	const zo = useZorm("NewQuestionWizardScreen", JoinFormSchema);
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
					<div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
						<LabelInputContainer>
							<Label htmlFor="firstname">First name</Label>
							<Input
								id="firstname"
								placeholder="Tyler"
								type="text"
								name={zo.fields.firstName()}
							/>
							{zo.errors.firstName()?.message && (
								<div
									className="pt-1 text-sm text-red-700"
									id="firstname-error"
								>
									{zo.errors.firstName()?.message}
								</div>
							)}
						</LabelInputContainer>
						<LabelInputContainer>
							<Label htmlFor="lastname">Last name</Label>
							<Input
								id="lastname"
								placeholder="Durden"
								type="text"
								name={zo.fields.lastName()}
							/>
							{zo.errors.lastName()?.message && (
								<div
									className="pt-1 text-sm text-red-700"
									id="lastname-error"
								>
									{zo.errors.lastName()?.message}
								</div>
							)}
						</LabelInputContainer>
					</div>
					<LabelInputContainer className="mb-4">
						<Label htmlFor={zo.fields.email()}>
							{t("register.email")}
						</Label>
						<Input
							data-test-id="email"
							required
							autoFocus={true}
							name={zo.fields.email()}
							type="email"
							autoComplete="email"
							disabled={disabled}
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
						data-test-id="create-account"
						type="submit"
						className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
						disabled={disabled}
					>
						{t("register.action")}
						<BottomGradient />
					</button>

					<div className="flex items-center justify-center">
						<div className="text-center text-sm text-gray-500">
							{t("register.alreadyHaveAnAccount")}{" "}
							<Link
								className="text-foreground hover:underline"
								to={{
									pathname: "/login",
									search: searchParams.toString(),
								}}
							>
								{t("register.login")}
							</Link>
						</div>
					</div>
				</Form>
			</div>
		</div>
	);
}
