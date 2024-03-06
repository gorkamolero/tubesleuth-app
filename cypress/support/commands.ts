import { faker } from "@faker-js/faker";

console.log(Cypress.env("SERVER_URL"));

const fullEnv = {
	...process.env,
	SERVER_URL: process.env.SERVER_URL || "http://localhost:8000",
};

declare global {
	namespace Cypress {
		interface Chainable {
			/**
			 * Logs in with a random user. Yields the user and adds an alias to the user
			 *
			 * @returns {typeof createAccount}
			 * @memberof Chainable
			 * @example
			 *    cy.createAccount()
			 * @example
			 *    cy.createAccount({ email: 'whatever@example.com', password: 'password' })
			 */
			createAccount: typeof createAccount;

			/**
			 * Deletes the current @user
			 *
			 * @returns {typeof cleanupUser}
			 * @memberof Chainable
			 * @example
			 *    cy.cleanupUser()
			 * @example
			 *    cy.cleanupUser({ email: 'whatever@example.com' })
			 */
			cleanupUser: typeof cleanupUser;
		}
	}
}

let envPrefix = `dotenv --`;
envPrefix = "";

function createAccount({
	email = faker.internet.email({
		provider: "example.com",
	}),
	password = faker.internet.password(),
}: {
	email?: string;
	password?: string;
} = {}) {
	cy.exec(
		`${envPrefix} npx tsx --tsconfig ./cypress/tsconfig.json ./cypress/support/create-user.ts "${email}" "${password}"`,
		{
			env: fullEnv,
		},
	);
	cy.then(() => ({ email, password })).as("user");
}

function cleanupUser({ email }: { email?: string } = {}) {
	if (email) {
		deleteUserByEmail(email);
	} else {
		cy.get("@user").then((user) => {
			const email = (user as { email?: string }).email;
			if (email) {
				deleteUserByEmail(email);
			}
		});
	}
	cy.clearCookie("__session");
}

function deleteUserByEmail(email: string) {
	cy.exec(
		`${envPrefix} npx tsx --tsconfig ./cypress/tsconfig.json ./cypress/support/delete-user.ts "${email}"`,
		{
			env: fullEnv,
		},
	);
	cy.clearCookie("__session");
}
export function registerCommands() {
	Cypress.Commands.add("createAccount", createAccount);
	Cypress.Commands.add("cleanupUser", cleanupUser);
}

/*
eslint
  @typescript-eslint/no-namespace: "off",
*/
