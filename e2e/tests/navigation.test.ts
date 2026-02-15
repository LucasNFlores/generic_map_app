/**
 * E2E Tests: Navigation Flows
 *
 * Tests guest-user navigation flows between pages:
 * homepage → login, login → sign-up, sign-up → login,
 * and protected route redirect behavior.
 */
import { runTestSuite, assert, type TestContext } from "../utils/stagehand-setup";
import { config } from "../stagehand.config";

runTestSuite("Navigation Flows", {
    async "should navigate from homepage to login via 'Iniciar sesión'"(ctx: TestContext) {
        await ctx.page.goto(config.baseUrl);
        await ctx.page.waitForLoadState("domcontentloaded");

        await ctx.stagehand.act("Click the 'Iniciar sesión' button");

        // Wait for navigation
        await new Promise((r) => setTimeout(r, 2000));

        const currentUrl = ctx.page.url();
        assert(
            currentUrl.includes("/auth/login"),
            `Expected URL to include '/auth/login', got: ${currentUrl}`
        );
    },

    async "should navigate from login to sign-up via 'Registrarse'"(ctx: TestContext) {
        await ctx.page.goto(`${config.baseUrl}/auth/login`);
        await ctx.page.waitForLoadState("domcontentloaded");

        await ctx.stagehand.act("Click the 'Registrarse' link");

        // Wait for navigation
        await new Promise((r) => setTimeout(r, 2000));

        const currentUrl = ctx.page.url();
        assert(
            currentUrl.includes("/auth/sign-up"),
            `Expected URL to include '/auth/sign-up', got: ${currentUrl}`
        );
    },

    async "should navigate from sign-up back to login via 'Inicia sesion'"(ctx: TestContext) {
        await ctx.page.goto(`${config.baseUrl}/auth/sign-up`);
        await ctx.page.waitForLoadState("domcontentloaded");

        await ctx.stagehand.act("Click the 'Inicia sesion' link");

        // Wait for navigation
        await new Promise((r) => setTimeout(r, 2000));

        const currentUrl = ctx.page.url();
        assert(
            currentUrl.includes("/auth/login"),
            `Expected URL to include '/auth/login', got: ${currentUrl}`
        );
    },

    async "should redirect /protected/map to login for unauthenticated users"(ctx: TestContext) {
        await ctx.page.goto(`${config.baseUrl}/protected/map`);

        // Wait for redirect
        await new Promise((r) => setTimeout(r, 3000));

        const currentUrl = ctx.page.url();
        assert(
            currentUrl.includes("/auth/login"),
            `Expected redirect to login, got: ${currentUrl}`
        );
    },

    async "should redirect /protected/admin to login for unauthenticated users"(ctx: TestContext) {
        await ctx.page.goto(`${config.baseUrl}/protected/admin`);

        // Wait for redirect
        await new Promise((r) => setTimeout(r, 3000));

        const currentUrl = ctx.page.url();
        assert(
            currentUrl.includes("/auth/login"),
            `Expected redirect to login, got: ${currentUrl}`
        );
    },
});
