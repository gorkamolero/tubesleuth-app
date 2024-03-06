import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirectWithSuccess } from "remix-toast";
import { BackgroundBeams } from "~/components/ui/background-beams";

import { requireAuthSession } from "~/modules/auth";
import { getInvitation } from "~/modules/invitations";

export async function loader({ request }: LoaderFunctionArgs) {
	const authSession = await requireAuthSession(request);

	const invitation = await getInvitation(authSession.email);

	if (invitation) {
		return redirectWithSuccess("/", "Welcome!");
	}

	return null;
}

export default function Invitations() {
	return (
		<div className="h-screen w-full rounded-md bg-neutral-950 relative flex flex-col items-center justify-center antialiased">
			<div className="max-w-2xl mx-auto p-4">
				<h1 className="relative z-10 text-4xl md:text-7xl  bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600  text-center font-sans font-bold">
					Join us
				</h1>
				<p></p>
				<p className="text-neutral-500 max-w-lg mx-auto my-2 text-sm text-center relative z-10">
					Welcome to Tubesleuth. You will need an invitation to join
					us. <br />
					Please contact us at your convenience.
				</p>
			</div>
			<BackgroundBeams />
		</div>
	);
}
