/**
 * Stagehand E2E Test Configuration
 * 
 * Centralizes all config for running Stagehand tests
 * against the local Next.js dev server.
 */

export const config = {
    /** Base URL of the running dev server */
    baseUrl: process.env.E2E_BASE_URL || "http://localhost:3000",

    /** Default model for AI-powered operations */
    model: "google/gemini-2.5-pro" as const,

    /** Default timeout for act/extract/observe (ms) */
    defaultTimeout: 30_000,

    /** Browser viewport */
    viewport: {
        width: 1280,
        height: 720,
    },

    /** Run headless by default, set E2E_HEADLESS=false to see browser */
    headless: process.env.E2E_HEADLESS !== "false",
};
