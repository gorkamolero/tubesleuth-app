import type { ActionFunction, LoaderFunctionArgs } from "@remix-run/node";
import {
	useLoaderData,
	json,
	redirect,
	Form,
	useNavigation,
	useNavigate,
} from "@remix-run/react";
import { LightbulbIcon } from "lucide-react";
import { parseFormAny, useZorm } from "react-zorm";
import { z } from "zod";

import { DialogDrawer } from "~/components/DialogDrawer";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea-gradient";
import { requireAuthSession } from "~/modules/auth";
import { createIdea } from "~/modules/ideas";
import { assertIsPost, isFormProcessing, notFound } from "~/utils";


export async function loader({ request }: LoaderFunctionArgs) {
	const { email } = await requireAuthSession(request);

	return json({ email });
}

export const NewIdeaFormSchema = z.object({
	description: z.string().min(1, "Description is required"),
});

export const action: ActionFunction = async ({ request }) => {
	assertIsPost(request);
	const authSession = await requireAuthSession(request);
	const formData = await request.formData();
	const result = await NewIdeaFormSchema.safeParseAsync(
		parseFormAny(formData),
	);

	if (!result.success) {
		return json({ errors: result.error }, { status: 400 });
	}

	const { description } = result.data;
	await createIdea({
		description,
		userId: authSession.userId,
	});

	return redirect(`/ideas/`);
};

export default function NewIdea() {
	const zo = useZorm("NewIdeaForm", NewIdeaFormSchema);
	const navigation = useNavigation();
	const disabled = isFormProcessing(navigation.state);

	const navigate = useNavigate();

	return (
		<DialogDrawer open onClose={() => navigate("/ideas/")}>
			<Form
				ref={zo.ref}
				method="post"
				className="w-full max-w-md space-y-6"
			>
				<Textarea
					id="description"
					name={zo.fields.description()}
					placeholder="Describe your idea, in much detail as possible"
				/>

				<div className="flex justify-end">
					<Button type="submit" disabled={disabled}>
						<LightbulbIcon className="mr-2 size-4" />
						Create Idea
					</Button>
				</div>
			</Form>
		</DialogDrawer>
	);
}
