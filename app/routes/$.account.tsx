import { Label } from "~/components/ui/label-gradient";
import { Input } from "~/components/ui/input-gradient";
import { Button } from "~/components/ui/button";
import { DialogDrawer } from "~/components/DialogDrawer";
import {
	Form,
	json,
	useLoaderData,
	useNavigate,
	useNavigation,
} from "@remix-run/react";
import {
	deleteAuthAccount,
	destroyAuthSession,
	requireAuthSession,
} from "~/modules/auth";
import { LoaderFunctionArgs } from "react-router";
import { deleteUserAccount, getUserByEmail } from "~/modules/user";
import { LabelInputContainer } from "~/components/LabelInputContainer";
import { BottomGradient } from "~/components/ui/bottom-gradient";
import { useZorm } from "react-zorm";
import { assertIsDelete, isFormProcessing } from "~/utils";
import { z } from "zod";
import { jsonWithError, redirectWithSuccess } from "remix-toast";
import { useState } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
	const authSession = await requireAuthSession(request);

	const user = await getUserByEmail(authSession.email);

	return json({ email: authSession.email, user });
}

export async function action({ request }: LoaderFunctionArgs) {
	assertIsDelete(request);

	const formData = await request.formData();
	const email = formData.get("email") as string | null;

	if (!email) {
		return jsonWithError(null, "Email is required for account deletion");
	}

	await deleteUserAccount(email);

	const newFormData = new FormData();
	// action: logout
	newFormData.append("action", "logout");

	return destroyAuthSession(request);
}

const EditAccountFormSchema = z.object({
	firstName: z.string().min(2, "First name is too short"),
	lastName: z.string().min(2, "Last name is too short"),
});

export default function Component() {
	const { email, user } = useLoaderData<typeof loader>();
	const zo = useZorm("NewQuestionWizardScreen", EditAccountFormSchema);
	const navigation = useNavigation();
	const disabled = isFormProcessing(navigation.state);
	const navigate = useNavigate();

	const [firstName, setFirstName] = useState(user?.firstName ?? "");
	const [lastName, setLastName] = useState(user?.lastName ?? "");

	return (
		<DialogDrawer
			title="Your Profile"
			open={true}
			onClose={() => navigate("/")}
		>
			<div className="w-full max-w-md mx-auto">
				<div className="flex flex-col items-center pt-6 pb-6">
					<div className="w-full grid gap-4 mt-4">
						<img
							className="mx-auto rounded-full overflow-hidden border-4 border-white"
							height="200"
							src="/placeholder.svg"
							style={{
								aspectRatio: "200/200",
								objectFit: "cover",
							}}
							width="200"
						/>
					</div>
				</div>
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
								data-test-id="firstname"
								id="firstname"
								placeholder="Tyler"
								type="text"
								name={zo.fields.firstName()}
								value={firstName}
								onChange={(e) => setFirstName(e.target.value)}
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
								data-test-id="lastname"
								id="lastname"
								placeholder="Durden"
								type="text"
								name={zo.fields.lastName()}
								value={lastName}
								onChange={(e) => setLastName(e.target.value)}
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

					<button
						data-test-id="save"
						type="submit"
						className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
						disabled={disabled}
					>
						Save
						<BottomGradient />
					</button>
				</Form>
				<div className="flex justify-center p-4">
					<Form method="delete">
						<Button
							className="w-full"
							variant="destructive"
							type="submit"
							data-test-id="delete-account"
						>
							Delete Profile
						</Button>
						<input type="hidden" name="email" value={email} />
					</Form>
				</div>
			</div>
		</DialogDrawer>
	);
}
