import { RAM, DISK, TIMEOUT } from "./constants";
import { VERSION } from "remotion";

export const speculateFunctionName = () => {
	return `remotion-render-${VERSION.replace(
		/\./g,
		"-",
	)}-mem${RAM}mb-disk${DISK}mb-${TIMEOUT}sec`;
};
