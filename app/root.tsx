import type {
	LinksFunction,
	LoaderFunction,
	MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import {
	Link,
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLoaderData,
} from "@remix-run/react";
import { PreventFlashOnWrongTheme, ThemeProvider } from "remix-themes";
import { useTranslation } from "react-i18next";
import { useChangeLanguage } from "remix-i18next";

import { i18nextServer } from "~/integrations/i18n";

import tailwindStylesheetUrl from "./tailwind.css";
import { getBrowserEnv } from "./utils/env";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "~/components/ui/resizable";
import { Sidebar } from "./components/Sidebar";
import { cn } from "~/lib/utils";
import useLocalStorage from "./hooks/use-local-storage";
import { TooltipProvider } from "./components/ui/tooltip";

export const links: LinksFunction = () => [
	{
		rel: "stylesheet preload prefetch",
		href: tailwindStylesheetUrl,
		as: "style",
	},
];

export const meta: MetaFunction = () => [
	{ title: "Tubesleuth" },
	{ name: "description", content: "Create videos" },
];

export const loader: LoaderFunction = async ({ request }) => {
	const locale = await i18nextServer.getLocale(request);

	return json({
		locale,
		env: getBrowserEnv(),
	});
};

const defaultLayout = [245, 800];
const defaultCollapsed = false;

export function App() {
	const { env, locale, theme: datatheme } = useLoaderData<typeof loader>();

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

	return (
		<html lang={locale} dir={i18n.dir()} className="h-full">
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
					<ResizablePanelGroup
						direction="horizontal"
						onLayout={(sizes: number[]) => {
							setPanelSizes(sizes);
							console.log(sizes);
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
							<div className="flex flex-col flex-1 h-screen">
								<Outlet />
								<ScrollRestoration />
							</div>
						</ResizablePanel>
					</ResizablePanelGroup>
				</TooltipProvider>
				<script
					dangerouslySetInnerHTML={{
						__html: `window.env = ${JSON.stringify(env)}`,
					}}
				/>
				<Scripts />
				<LiveReload />
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
