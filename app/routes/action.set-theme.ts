import { createThemeAction } from "remix-themes";

import { themeSessionResolver } from "~/modules/auth/session.server";

export const action = createThemeAction(themeSessionResolver);
