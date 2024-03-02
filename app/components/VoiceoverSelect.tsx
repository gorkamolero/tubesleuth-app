import { VOICEMODELS } from "~/database/enums";
import { Label } from "./ui/label";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectValue,
	SelectTrigger,
} from "~/components/ui/select";

export const VoiceOverSelect = ({ name }: { name: string }) => {
	return (
		<div>
			<Label htmlFor="voicemodel" className="mb-2 block">
				Voice Model
			</Label>
			<Select name={name}>
				<SelectTrigger className="w-[180px]">
					<SelectValue placeholder="Voice model" />
				</SelectTrigger>

				<SelectContent>
					{Object.entries(VOICEMODELS).map(([key, value]) => (
						<SelectItem key={key} value={value}>
							{key}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
};
