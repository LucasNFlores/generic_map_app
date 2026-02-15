/**
 * E2E Tests: Auth Login Page
 *
 * Tests the login page (/auth/login) which has email/password
 * fields, a login button, forgot password link, and sign-up link.
 */
import { runTestSuite, assert, type TestContext } from "../utils/stagehand-setup";
import { config } from "../stagehand.config";
import { z } from "zod";

runTestSuite("Auth Login Page", {
    async "should render the login form with title"(ctx: TestContext) {
        await ctx.page.goto(`${config.baseUrl}/auth/login`);
        await ctx.page.waitForLoadState("domcontentloaded");

        const formInfo = await ctx.stagehand.extract(
            "Extract the main title and description from the login form card",
            z.object({
                title: z.string().describe("The card title text"),
                description: z.string().describe("The card description text"),
            })
        );
        assert(
            formInfo.title.toLowerCase().includes("login"),
            `Expected 'Login' title, got: ${formInfo.title}`
        );
    },

    async "should have email and password input fields"(ctx: TestContext) {
        await ctx.page.goto(`${config.baseUrl}/auth/login`);
        await ctx.page.waitForLoadState("domcontentloaded");

        const fields = await ctx.stagehand.observe(
            "Find the email input field and the password input field"
        );
        assert(
            fields.length >= 2,
            `Expected at least 2 input fields, found: ${fields.length}`
        );
    },

    async "should have a Login submit button"(ctx: TestContext) {
        await ctx.page.goto(`${config.baseUrl}/auth/login`);
        await ctx.page.waitForLoadState("domcontentloaded");

        const buttons = await ctx.stagehand.observe(
            "Find the Login submit button"
        );
        assert(buttons.length > 0, "Should find a Login submit button");
    },

    async "should have a forgot password link"(ctx: TestContext) {
        await ctx.page.goto(`${config.baseUrl}/auth/login`);
        await ctx.page.waitForLoadState("domcontentloaded");

        const links = await ctx.stagehand.observe(
            "Find the '¿Olvidaste tu contraseña?' or forgot password link"
        );
        assert(links.length > 0, "Should find a forgot password link");
    },

    async "should have a sign-up link"(ctx: TestContext) {
        await ctx.page.goto(`${config.baseUrl}/auth/login`);
        await ctx.page.waitForLoadState("domcontentloaded");

        const links = await ctx.stagehand.observe(
            "Find the 'Registrarse' or sign-up link"
        );
        assert(links.length > 0, "Should find a 'Registrarse' sign-up link");
    },

    async "should show error on invalid credentials"(ctx: TestContext) {
        await ctx.page.goto(`${config.baseUrl}/auth/login`);
        await ctx.page.waitForLoadState("domcontentloaded");

        // Fill in fake credentials
        await ctx.stagehand.act("Type 'fake@test.com' into the email field");
        await ctx.stagehand.act("Type 'wrongpassword123' into the password field");
        await ctx.stagehand.act("Click the Login button");

        // Wait a bit for the error to appear
        await new Promise((r) => setTimeout(r, 2000));

        const errorText = await ctx.stagehand.extract(
            "Extract any error message shown on the page",
            z.object({
                errorMessage: z.string().describe("The error message text, or empty if none"),
            })
        );
        assert(
            errorText.errorMessage.length > 0,
            "Should display an error message for invalid credentials"
        );
    },
});
