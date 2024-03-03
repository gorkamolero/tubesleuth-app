import {
	useLoaderData,
	json,
	redirect,
	Form,
	useNavigation,
} from "@remix-run/react";
import { ActionFunction, LoaderFunctionArgs } from "@remix-run/node";
import { createIdea } from "~/modules/ideas";
import { requireAuthSession } from "~/modules/auth";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { z } from "zod";
import { parseFormAny, useZorm } from "react-zorm";
import { assertIsPost, isFormProcessing, notFound } from "~/utils";
import { Input } from "~/components/ui/input";

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
	const idea = await createIdea({
		description,
		userId: authSession.userId,
	});

	return redirect(`/idea/${idea.id}`);
};

export default function NewIdea() {
	const zo = useZorm("NewIdeaForm", NewIdeaFormSchema);
	const navigation = useNavigation();
	const disabled = isFormProcessing(navigation.state);

	return (
		<div className="flex flex-col items-center justify-center h-screen">
			<h1 className="text-2xl font-bold mb-4">Create a New Idea</h1>
			<Form
				ref={zo.ref}
				method="post"
				className="space-y-6 w-full max-w-md"
			>
				<div>
					<Textarea
						id="description"
						name={zo.fields.description()}
						placeholder="Describe your idea, in much detail as possible"
					/>
				</div>
				<Button type="submit" disabled={disabled}>
					Create Idea
				</Button>
			</Form>
		</div>
	);
}
