declare module "tailwindcss/lib/util/flattenColorPalette" {
	const flattenColorPalette: (
		palette: Record<string, any>,
	) => Record<string, string>;
	export default flattenColorPalette;
}
