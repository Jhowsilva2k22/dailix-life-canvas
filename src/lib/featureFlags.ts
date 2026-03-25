/**
 * Central feature flags for the Dailix product.
 *
 * OPEN_ACCESS_MODE — when `true` every authenticated user gets full
 * (founder-level) access. The entire payment / upgrade infrastructure
 * stays intact in the codebase; only the runtime gating is bypassed.
 *
 * To re-enable monetisation, simply flip this flag back to `false`.
 */

export const OPEN_ACCESS_MODE = true;
