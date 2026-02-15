/**
 * E2E Tests: Homepage
 *
 * Tests the public-facing homepage (/) which displays
 * a read-only map with a floating header pill for guests.
 */
import { runTestSuite, assert, type TestContext } from "../utils/stagehand-setup";
import { config } from "../stagehand.config";

runTestSuite("Homepage", {
    async "should load the homepage successfully"(ctx: TestContext) {
        await ctx.page.goto(config.baseUrl);
        await ctx.page.waitForLoadState("domcontentloaded");

        const title = await ctx.page.title();
        assert(typeof title === "string", "Page should have a title");
    },

    async "should display the GenericMap branding in header"(ctx: TestContext) {
        await ctx.page.goto(config.baseUrl);
        await ctx.page.waitForLoadState("domcontentloaded");

        const branding = await ctx.stagehand.extract(
            "Extract the main brand name shown in the header/navigation bar"
        );
        assert(
            JSON.stringify(branding).toLowerCase().includes("genericmap"),
            `Expected 'GenericMap' branding, got: ${JSON.stringify(branding)}`
        );
    },

    async "should show 'Iniciar sesión' login button for guests"(ctx: TestContext) {
        await ctx.page.goto(config.baseUrl);
        await ctx.page.waitForLoadState("domcontentloaded");

        const actions = await ctx.stagehand.observe(
            "Find the login or 'Iniciar sesión' button"
        );
        assert(
            actions.length > 0,
            "Should find a login button on the homepage"
        );
    },

    async "should have a theme switcher component"(ctx: TestContext) {
        await ctx.page.goto(config.baseUrl);
        await ctx.page.waitForLoadState("domcontentloaded");
        // Wait for client-side hydration (ThemeSwitcher mounts after useEffect)
        await new Promise((r) => setTimeout(r, 1500));

        const themeSwitcher = await ctx.stagehand.observe(
            "Find a small icon button (with a sun, moon, or laptop icon) used for switching themes, located in the header bar next to the login button"
        );
        assert(
            themeSwitcher.length > 0,
            "Should find a theme switcher icon button on the homepage"
        );
    },
});
