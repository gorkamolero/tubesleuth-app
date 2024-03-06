import { faker } from "@faker-js/faker";

describe("smoke tests", () => {
	it("should allow you to register and login", () => {
		cy.exec("whoami");

		const loginForm = {
			email: faker.internet
				.email({
					provider: "example.com",
				})
				.toLowerCase(),
			password: faker.internet.password(),
			firstName: faker.person.firstName(),
			lastName: faker.person.lastName(),
		};
		cy.then(() => ({ email: loginForm.email })).as("user");

		cy.visit("/");

		cy.findByText("Sign up").click();

		cy.findByTestId("firstname").type(loginForm.firstName);
		cy.findByTestId("lastname").type(loginForm.lastName);
		cy.findByTestId("email").type(loginForm.email);
		cy.findByTestId("password").type(loginForm.password);
		cy.findByTestId("create-account").click();

		cy.findByText("Tubesleuth");

		cy.findByTestId("logout").click();
		cy.findByTestId("login");

		cy.cleanupUser({ email: loginForm.email });
	});

	it("should allow you to make an idea", () => {
		const testIdea = {
			description: faker.lorem.sentences(1),
		};
		const credentials = {
			firstName: faker.person.firstName(),
			lastName: faker.person.lastName(),
			email: faker.internet.email({
				provider: "example.com",
			}),
			password: faker.internet.password(),
		};

		cy.log("Create account with", credentials);
		cy.createAccount(credentials);
		cy.visit("/");
		cy.findByTestId("login").click();

		cy.findByTestId("email").type(credentials.email);
		cy.findByTestId("password").type(credentials.password);
		cy.findByTestId("login").click();

		cy.findByText("Welcome to Tubesleuth");

		cy.findByRole("link", { name: /\Create new idea/i }).click();

		cy.findByRole("textbox", { name: /description/i }).type(
			testIdea.description,
		);
		cy.findByTestId("create-idea").click();

		const el = cy.findByText(testIdea.description);
		// find a button inside that says "edit"
		el.parent().findByRole("button", { name: /edit/i }).click();

		cy.findByTestId("delete-idea").click();

		cy.findByTestId("logout").click();
		cy.findByTestId("login");

		cy.cleanupUser({ email: credentials.email });
	});
});
