/**
 * Shared Stagehand setup and teardown utilities.
 * 
 * Provides helper functions to initialize Stagehand in LOCAL mode
 * and a simple test runner with colored console output.
 */
import "dotenv/config";
import { Stagehand } from "@browserbasehq/stagehand";
import { config } from "../stagehand.config";

export interface TestContext {
    stagehand: Stagehand;
    page: Awaited<ReturnType<Stagehand["context"]["pages"]>>[0];
}

/**
 * Initialize Stagehand in LOCAL mode with Chrome.
 * Returns both the stagehand instance and the first page.
 */
export async function initStagehand(): Promise<TestContext> {
    const stagehand = new Stagehand({
        env: "LOCAL",
        model: config.model,
        verbose: 0,
        localBrowserLaunchOptions: {
            headless: config.headless,
            viewport: config.viewport,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
            ],
        },
    });

    await stagehand.init();

    const page = stagehand.context.pages()[0];
    return { stagehand, page };
}

/**
 * Close Stagehand and cleanup browser resources.
 */
export async function closeStagehand(stagehand: Stagehand): Promise<void> {
    try {
        await stagehand.close();
    } catch {
        // Swallow errors during cleanup
    }
}

// ─── Simple Test Runner ──────────────────────────────────────────

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";

interface TestResult {
    name: string;
    passed: boolean;
    error?: string;
    durationMs: number;
}

/**
 * Run a suite of named test functions with setup/teardown.
 */
export async function runTestSuite(
    suiteName: string,
    tests: Record<string, (ctx: TestContext) => Promise<void>>
): Promise<void> {
    console.log(`\n${BOLD}${CYAN}═══ ${suiteName} ═══${RESET}\n`);

    const results: TestResult[] = [];
    let ctx: TestContext | null = null;

    try {
        ctx = await initStagehand();
        console.log(`${GREEN}✓${RESET} Stagehand initialized (LOCAL mode)\n`);
    } catch (err) {
        console.error(`${RED}✗ Failed to initialize Stagehand:${RESET}`, err);
        process.exit(1);
    }

    for (const [name, testFn] of Object.entries(tests)) {
        const start = Date.now();
        try {
            await testFn(ctx);
            const duration = Date.now() - start;
            results.push({ name, passed: true, durationMs: duration });
            console.log(`  ${GREEN}✓${RESET} ${name} ${YELLOW}(${duration}ms)${RESET}`);
        } catch (err) {
            const duration = Date.now() - start;
            const errorMsg = err instanceof Error ? err.message : String(err);
            results.push({ name, passed: false, error: errorMsg, durationMs: duration });
            console.log(`  ${RED}✗${RESET} ${name} ${YELLOW}(${duration}ms)${RESET}`);
            console.log(`    ${RED}${errorMsg}${RESET}`);
        }
    }

    // Cleanup
    if (ctx) {
        await closeStagehand(ctx.stagehand);
    }

    // Summary
    const passed = results.filter((r) => r.passed).length;
    const failed = results.filter((r) => !r.passed).length;
    const total = results.length;

    console.log(`\n${BOLD}${CYAN}── Results ──${RESET}`);
    console.log(`  Total:  ${total}`);
    console.log(`  ${GREEN}Passed: ${passed}${RESET}`);
    if (failed > 0) {
        console.log(`  ${RED}Failed: ${failed}${RESET}`);
    }
    console.log();

    if (failed > 0) {
        process.exit(1);
    }
}

/**
 * Simple assertion helper.
 */
export function assert(condition: boolean, message: string): void {
    if (!condition) {
        throw new Error(`Assertion failed: ${message}`);
    }
}
