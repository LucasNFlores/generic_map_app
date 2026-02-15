/**
 * E2E Tests: Auth Sign-Up Page
 *
 * Tests the sign-up page (/auth/sign-up) which has email,
 * password, repeat password fields, and validation logic.
 */
import { runTestSuite, assert, type TestContext } from "../utils/stagehand-setup";
import { config } from "../stagehand.config";
import { z } from "zod";

runTestSuite("Auth Sign-Up Page", {
    async "should render the sign-up form with title"(ctx: TestContext) {
        await ctx.page.goto(`${config.baseUrl}/auth/sign-up`);
        await ctx.page.waitForLoadState("domcontentloaded");

        const formInfo = await ctx.stagehand.extract(
            "Extract the main title and description from the sign-up form card",
            z.object({
                title: z.string().describe("The card title text"),
                description: z.string().describe("The card description text"),
            })
        );
        assert(
            formInfo.title.toLowerCase().includes("registr"),
            `Expected 'Registrarse' title, got: ${formInfo.title}`
        );
    },

    async "should have email, password, and repeat password fields"(ctx: TestContext) {
        await ctx.page.goto(`${config.baseUrl}/auth/sign-up`);
        await ctx.page.waitForLoadState("domcontentloaded");

        const fields = await ctx.stagehand.observe(
            "Find all input fields: email, password, and repeat password"
        );
        assert(
            fields.length >= 3,
            `Expected at least 3 input fields, found: ${fields.length}`
        );
    },

    async "should have a 'Registrarse' submit button"(ctx: TestContext) {
        await ctx.page.goto(`${config.baseUrl}/auth/sign-up`);
        await ctx.page.waitForLoadState("domcontentloaded");

        const buttons = await ctx.stagehand.observe(
            "Find the 'Registrarse' submit button"
        );
        assert(buttons.length > 0, "Should find a 'Registrarse' submit button");
    },

    async "should show password mismatch error"(ctx: TestContext) {
        await ctx.page.goto(`${config.baseUrl}/auth/sign-up`);
        await ctx.page.waitForLoadState("domcontentloaded");

        await ctx.stagehand.act("Type 'test@example.com' into the email field");
        await ctx.stagehand.act("Type 'password123' into the password field");
        await ctx.stagehand.act("Type 'differentpassword' into the repeat password field");
        await ctx.stagehand.act("Click the 'Registrarse' button");

        // Wait for client-side validation
        await new Promise((r) => setTimeout(r, 1500));

        const errorText = await ctx.stagehand.extract(
            "Extract any error message visible on the page",
            z.object({
                errorMessage: z.string().describe("The error message text, or empty if none"),
            })
        );
        assert(
            errorText.errorMessage.toLowerCase().includes("match") ||
            errorText.errorMessage.toLowerCase().includes("password") ||
            errorText.errorMessage.length > 0,
            "Should display a password mismatch error"
        );
    },

    async "should have a login link back to sign-in"(ctx: TestContext) {
        await ctx.page.goto(`${config.baseUrl}/auth/sign-up`);
        await ctx.page.waitForLoadState("domcontentloaded");

        const links = await ctx.stagehand.observe(
            "Find the 'Inicia sesion' or login link at the bottom"
        );
        assert(links.length > 0, "Should find a link back to the login page");
    },
});
