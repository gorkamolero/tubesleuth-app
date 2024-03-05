import { Label } from "~/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectValue,
	SelectTrigger,
} from "~/components/ui/select";
import { VOICEMODELS } from "~/database/enums";
import { capitalize } from "~/lib/utils";

export const VoiceOverSelect = ({ name }: { name: string }) => (
		<div className="grid w-full gap-2">
			<Label htmlFor="voicemodel" className="mb-2 block">
				Voice Model
			</Label>
			<Select name={name}>
				<SelectTrigger className="w-full min-w-[180px]">
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
