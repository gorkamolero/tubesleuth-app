export function loader() {
	return new Response("Not Found", {
		status: 404,
	});
}

export default function NotFoundPage() {
	return (
		<div className="items-top relative flex min-h-screen justify-center bg-gray-100 dark:bg-gray-900 sm:items-center sm:pt-0">
			<div className="mx-auto max-w-xl sm:px-6 lg:px-8">
				<div className="flex items-center pt-8 sm:justify-start sm:pt-0">
					<div className="border-r border-gray-400 px-4 text-lg tracking-wider text-gray-500">
						404
					</div>
					<div className="ml-4 text-lg uppercase tracking-wider text-gray-500">
						Not Found
					</div>
				</div>
			</div>
		</div>
	);
}
