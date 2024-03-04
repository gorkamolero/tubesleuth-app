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
import { Textarea } from "~/components/ui/textarea-gradient";
import { Button } from "~/components/ui/button";
import { z } from "zod";
import { parseFormAny, useZorm } from "react-zorm";
import { assertIsPost, isFormProcessing, notFound } from "~/utils";
import { DialogDrawer } from "~/components/DialogDrawer";
import { LightbulbIcon } from "lucide-react";

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

	return redirect(`/ideas/`);
};

export default function NewIdea() {
	const zo = useZorm("NewIdeaForm", NewIdeaFormSchema);
	const navigation = useNavigation();
	const disabled = isFormProcessing(navigation.state);

	return (
		<DialogDrawer open>
			<Form
				ref={zo.ref}
				method="post"
				className="space-y-6 w-full max-w-md"
			>
				<Textarea
					id="description"
					name={zo.fields.description()}
					placeholder="Describe your idea, in much detail as possible"
				/>

				<div className="flex justify-end">
					<Button type="submit" disabled={disabled}>
						<LightbulbIcon className="w-4 h-4 mr-2" />
						Create Idea
					</Button>
				</div>
			</Form>
		</DialogDrawer>
	);
}
