import { Link } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";

export default function Home() {
	return (
		<div className="flex h-screen flex-col items-center justify-center space-y-4">
			<h1 className="mb-4 text-4xl font-bold ">Welcome</h1>
			<div className="flex gap-8">
				<Card className="min-h-72 transform transition duration-500 hover:scale-102 hover:shadow-xl">
					<Button asChild>
						<Link className="p-4 h-full" to="/channel/new">
							Create new channel
						</Link>
					</Button>
				</Card>
				<Card className="min-h-72 transform transition duration-500 hover:scale-102 hover:shadow-xl">
					<Button asChild>
						<Link className="p-4 h-full" to="/video/new">
							Create new short
						</Link>
					</Button>
				</Card>
			</div>
		</div>
	);
}
