import type { LoaderFunctionArgs} from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";

import { DialogDrawer } from "~/components/DialogDrawer";
import { requireAuthSession } from "~/modules/auth";
import { fullLeiaPix } from "~/utils/testFunctions/leiaPix";

export async function loader({ request }: LoaderFunctionArgs) {
	const { userId, email } = await requireAuthSession(request);

	const leiaPixResult = (await fullLeiaPix({
		disparityURL: process.env.ORIGINAL_DISPARITY_URL,
	})) as {
		getDisparityPresignedUrl: string;
		getAnimPresignedUrl: string;
	};

	const { getDisparityPresignedUrl, getAnimPresignedUrl } = leiaPixResult;

	return json({
		email,
		userId,
		getDisparityPresignedUrl,
		getAnimPresignedUrl,
	});
}

export default function Test() {
	const { getAnimPresignedUrl } = useLoaderData<typeof loader>();

	const navigate = useNavigate();
	return (
		<DialogDrawer
			open
			title="Animations test"
			onClose={() => navigate("/videos/")}
		>
			<div
				className="h-[1920] w-[1080]"
				style={{ aspectRatio: "9 / 16" }}
			>
				<video className="size-full" controls loop>
					<source src={getAnimPresignedUrl} type="video/mp4" />
					Your browser does not support the video tag.
				</video>
			</div>
		</DialogDrawer>
	);
}
