import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { ModeToggle } from "~/components/mode-toggle";

import { LogoutButton, getAuthSession } from "~/modules/auth";

export async function loader({ request }: LoaderFunctionArgs) {
	const { email } = (await getAuthSession(request)) || {};

	return json({ email });
}

export default function Index() {
	const { email } = useLoaderData<typeof loader>();
	const { t } = useTranslation(["common", "auth"]);
	return (
		<main className="relative min-h-screen bg-background sm:flex sm:items-center sm:justify-center">
			<ModeToggle />
			<div className="relative sm:pb-16 sm:pt-8">
				<div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
					<div className="relative shadow-xl sm:overflow-hidden sm:rounded-2xl">
						<div className="absolute inset-0">
							<img
								className="h-full w-full object-cover"
								src="https://plus.unsplash.com/premium_photo-1678990345549-6a35a77883d5?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
								alt="Sonic Youth On Stage"
							/>
							<div className="absolute inset-0 bg-[color:rgba(254,204,27,0.5)] mix-blend-multiply" />
						</div>
						<div className="relative bg-black/50 px-4 pb-8 pt-16 sm:px-6 sm:pb-14 sm:pt-24 lg:px-8 lg:pb-20 lg:pt-32">
							<h1 className="space-x-8 text-center text-6xl font-extrabold tracking-tight sm:text-8xl lg:text-9xl">
								<span className="uppercase text-yellow-500 drop-shadow-md">
									Tubesleuth
								</span>
							</h1>
							<div className="mx-auto mt-10 max-w-sm sm:flex sm:max-w-none sm:justify-center">
								{email ? (
									<div className="flex space-x-4 items-center">
										<Link
											to="/home"
											className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-3 text-base font-medium text-yellow-700 shadow-sm hover:bg-yellow-50 sm:px-8"
										>
											Come in
										</Link>
										<LogoutButton />
									</div>
								) : (
									<div className="space-y-4">
										<div className="space-y-4 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5 sm:space-y-0">
											<Link
												data-test-id="join"
												to="/join"
												className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-3 text-base font-medium text-yellow-700 shadow-sm hover:bg-yellow-50 sm:px-8"
											>
												{t("register.action", {
													ns: "auth",
												})}
											</Link>
											<Link
												data-test-id="login"
												to="/login"
												className="flex items-center justify-center rounded-md bg-yellow-500 px-4 py-3 font-medium text-white hover:bg-yellow-600  "
											>
												{t("login.action", {
													ns: "auth",
												})}
											</Link>
										</div>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
