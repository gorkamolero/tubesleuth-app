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
	useLoaderData,
} from "@remix-run/react";
import clsx from "clsx";
import {
	PreventFlashOnWrongTheme,
	ThemeProvider,
	useTheme,
} from "remix-themes";
import { useTranslation } from "react-i18next";
import { useChangeLanguage } from "remix-i18next";

import { i18nextServer } from "~/integrations/i18n";

import tailwindStylesheetUrl from "./tailwind.css";
import { getBrowserEnv } from "./utils/env";

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

export function App() {
	const { env, locale, theme: datatheme } = useLoaderData<typeof loader>();
	const { i18n } = useTranslation();

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
			<body className="h-full">
				<Outlet />
				<ScrollRestoration />
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
