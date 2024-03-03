import { VOICEMODELS } from "~/database/enums";
import { Label } from "~/components/ui/label";
import { capitalize } from "~/lib/utils";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectValue,
	SelectTrigger,
} from "~/components/ui/select";

export const VoiceOverSelect = ({ name }: { name: string }) => {
	return (
		<div className="grid gap-2 w-full">
			<Label htmlFor="voicemodel" className="mb-2 block">
				Voice Model
			</Label>
			<Select name={name}>
				<SelectTrigger className="min-w-[180px] w-full">
					<SelectValue placeholder="Voice model" />
				</SelectTrigger>

				<SelectContent>
					{Object.entries(VOICEMODELS).map(([key, value]) => (
						<SelectItem key={key} value={value}>
							{capitalize(value)}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
};
