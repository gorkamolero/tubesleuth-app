import { useEffect } from "react";

import type {
	LinksFunction,
	LoaderFunction,
	MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	isRouteErrorResponse,
	useLoaderData,
	useRouteError,
} from "@remix-run/react";
import { clsx } from "clsx";
import { useTranslation } from "react-i18next";
import { useChangeLanguage } from "remix-i18next";
import {
	PreventFlashOnWrongTheme,
	ThemeProvider,
	useTheme,
} from "remix-themes";
import { getToast } from "remix-toast";
import { Toaster, toast as notify } from "sonner";

import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "~/components/ui/resizable";
import { i18nextServer } from "~/integrations/i18n";
import { cn } from "~/lib/utils";

import { Sidebar } from "./components/Sidebar";
import { TooltipProvider } from "./components/ui/tooltip";
import useLocalStorage from "./hooks/use-local-storage";
import {
	getAuthSession,
	themeSessionResolver,
} from "./modules/auth/session.server";
import tailwindStylesheetUrl from "./tailwind.css";
import { getBrowserEnv } from "./utils/env";



export const links: LinksFunction = () => [
	{
		rel: "stylesheet preload prefetch",
		href: tailwindStylesheetUrl,
		as: "style",
	},
	{
		rel: "preconnect",
		href: "https://fonts.googleapis.com",
	},
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous",
	},
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap",
	},
];

export const meta: MetaFunction = () => [
	{ title: "Tubesleuth" },
	{ name: "description", content: "Create videos" },
];

export const loader: LoaderFunction = async ({ request }) => {
	const locale = await i18nextServer.getLocale(request);
	const { getTheme } = await themeSessionResolver(request);
	const authSession = await getAuthSession(request);

	const { toast, headers } = await getToast(request);

	const isLoggedIn = !!authSession;

	return json(
		{
			toast,
			isLoggedIn,
			locale,
			theme: getTheme(),
			env: getBrowserEnv(),
		},
		{
			headers,
		},
	);
};

const defaultLayout = [245, 800];
const defaultCollapsed = false;

export function ErrorBoundary() {
	const error = useRouteError();
	return (
		<html>
			<head>
				<title>Oh no!</title>
				<Meta />
				<Links />
			</head>
			<body>
				{isRouteErrorResponse(error) ? (
					<div>
						<h1>
							{error.status} {error.statusText}
						</h1>
						<p>{error.data}</p>
					</div>
				) : error instanceof Error ? (
					<div>
						<h1>Error</h1>
						<p>{error.message}</p>
						<p>The stack trace is:</p>
						<pre>{error.stack}</pre>
					</div>
				) : (
					<h1>Unknown error</h1>
				)}

				<Scripts />
			</body>
		</html>
	);
}

export function App() {
	const {
		isLoggedIn,
		env,
		locale,
		theme: datatheme,
		toast,
	} = useLoaderData<typeof loader>();
	const [theme] = useTheme();

	const { i18n } = useTranslation();
	const [isCollapsed, setIsCollapsed] = useLocalStorage(
		"collapsed",
		defaultCollapsed,
	);
	const [panelSizes, setPanelSizes] = useLocalStorage(
		"panelSizes",
		defaultLayout,
	);
	const sidebarPanelSizes = panelSizes[0];
	const mainPanelSizes = panelSizes[1];

	useChangeLanguage(locale);

	useEffect(() => {
		if (toast?.type === "error") {
			notify.error(toast.message);
		}
		if (toast?.type === "success") {
			notify.success(toast.message);
		}
	}, [toast]);

	return (
		<html lang={locale} dir={i18n.dir()} className={clsx(theme, "h-full")}>
			<head>
				<meta charSet="utf-8" />
				<meta
					name="viewport"
					content="width=device-width,initial-scale=1.0,maximum-scale=1.0"
				/>
				<Meta />
				<PreventFlashOnWrongTheme ssrTheme={Boolean(datatheme)} />
				<Links />
			</head>
			<body className="flex h-full">
				<TooltipProvider>
					<Toaster richColors />
					{!isLoggedIn ? (
						<div className="flex h-screen w-screen items-center justify-center">
							<Outlet />
						</div>
					) : (
						<ResizablePanelGroup
							direction="horizontal"
							onLayout={(sizes: number[]) => {
								setPanelSizes(sizes);
							}}
							className="flex h-full items-stretch"
						>
							<ResizablePanel
								defaultSize={sidebarPanelSizes}
								collapsedSize={4}
								collapsible={true}
								minSize={15}
								maxSize={20}
								onCollapse={() => {
									setIsCollapsed(true);
								}}
								onExpand={() => {
									setIsCollapsed(false);
								}}
								className={cn(
									isCollapsed &&
										"min-w-[50px] transition-all duration-300 ease-in-out",
								)}
							>
								<Sidebar isCollapsed={isCollapsed} />
							</ResizablePanel>

							<ResizableHandle withHandle />

							<ResizablePanel
								minSize={30}
								defaultSize={mainPanelSizes}
							>
								<div className="flex h-screen flex-1 flex-col">
									<Outlet />
									<ScrollRestoration />
									<LiveReload />
								</div>
							</ResizablePanel>
						</ResizablePanelGroup>
					)}
				</TooltipProvider>
				<script
					dangerouslySetInnerHTML={{
						__html: `window.env = ${JSON.stringify(env)}`,
					}}
				/>
				<Scripts />
			</body>
		</html>
	);
}

export default function AppWithProviders() {
	const data = useLoaderData<typeof loader>();
	return (
		<ThemeProvider
			specifiedTheme={data.theme}
			themeAction="/action/set-theme"
		>
			<App />
		</ThemeProvider>
	);
}
