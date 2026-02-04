export type ProgressSet = [
    label: string,
    value: number,
    min: number,
    max: number,
]

export namespace ProcessLogger {
    /**
     * @param {ProgressSet} set - Array of progress definitions:[label, value, min, max]
     * @param {number} barLength - Total length of each progress bar (default: 10)
     * @returns A progress bars
     */
    export function drawProgressSet(set: Array<ProgressSet>, barLength: number = 10){
        let result = "";
        const len = set.length;
        for(let i = 0; i < len; i++){
            result += drawProgress(set[i][0], set[i][1], set[i][2], set[i][3], barLength) + (i !== len - 1 ? "\n" : "");
        }
        return result;
    }

    /**
     * Object keys are used as labels, and all values share the same
     * `min` and `max` range.
     *
     * @param obj - Record mapping labels to numeric values
     * @param min - Minimum expected value (default: 0)
     * @param max - Maximum expected value (default: 1)
     * @param barLength - Total length of each progress bar (default: 10)
     * @returns A progress bars
     */
    export function drawProgressRecord(obj: Record<string, number>, min: number = 0, max: number = 1, barLength: number = 10){
        let result = "";
        const keys = Object.keys(obj);
        const len = keys.length;
        for(let i = 0; i < len; i++){
            result += drawProgress(keys[i], obj[keys[i]], min, max, barLength) + (i !== len - 1 ? "\n" : "");
        }
        return result;
    }

    /**
     * Draws a single progress bar
     *
     * - Positive  🟢
     * - Negative  🔴
     * - Empty space  ⚫️
     *
     * @param label
     * @param value
     * @param min
     * @param max
     * @param barLength
     * @returns A progress bar
     */
    export function drawProgress(label: string, value: number, min: number = 0, max: number = 1, barLength: number = 10) {
        const fixedVal = value.toFixed(2);
        
        const filled = Math.round(MathUtils.remap(value, min, max, 0, 1) * barLength);
        const absFilled = Math.abs(filled);
        const sign = filled < 0 ? "🔴" : "🟢";
        const bar = sign.repeat(Math.min(absFilled, barLength)) + "⚫️".repeat(Math.max(0, barLength - absFilled));
    
        return `${bar} ${fixedVal} - ${label}`;
    }
}

export type LogStatus = "info" | "warn" | "error";
type DebugRule<T> = {
    when: (value: T) => boolean;
    format: (value: T) => string;
    weight?: number;
    status?: LogStatus;
    expireMs?: number;
};
type DebugState = {
    text: string;
    status: LogStatus;
    timestamp: number;
    expireMs?: number;
};


/**
 * A rule-based, time-aware debug
 *
 * `StickyDebug` lets you describe *when* a value is interesting,
 * *how* it should be displayed, and *how long* it should stay visible.
 *
 * - **Rule**: Defines a condition and a formatter
 * - **State**: Last matched rule output taht persists
 * - **Weight**: Controls rule priority
 * - **Expiration**: How long a state remains visible
 *
 * @typeParam T - A type describing the debug input
 *
 * @example \n
 * ```ts
 * type PlayerDebug = {
 *   isShooting: boolean;
 *   ammo: number;
 * };
 *
 * const debug = new StickyDebug<PlayerDebug>();
 *
 * // Shooting state
 * debug.register("isShooting", {
 *   when: v => v === true,
 *   format: () => "SHOOTING",
 *   status: "warn",
 *   expireMs: 300
 * });
 *
 * // Ammo empty (higher priority)
 * debug.register("ammo", {
 *   when: v => v === 0,
 *   format: () => "NO AMMO",
 *   status: "error",
 *   weight: 10,
 * });
 *
 * // Ammo low
 * debug.register("ammo", {
 *   when: v => v < 5,
 *   format: v => `LOW AMMO (${v})`,
 *   status: "warn",
 * });
 *
 * // Normal ammo display
 * debug.register("ammo", {
 *   when: v => v >= 5,
 *   format: v => `Ammo: ${v}`,
 *   status: "info",
 * });
 *
 * // In your update / tick loop
 * const output = debug.update({
 *   isShooting: player.isShooting,
 *   ammo: player.ammo
 * });
 *
 * console.log(output);
 * ```
 *
 * Example output:
 * ```
 * isShooting: 🟡 SHOOTING (0.1s)
 * ammo: 🔴 NO AMMO (2.4s)
 * ```
 */
export class StickyDebug<T extends Record<string, any>> {
    private state: Record<string, DebugState> = {};
    private rules: Partial<Record<keyof T, DebugRule<any>[]>> = {};

    /**
     * Registers a debug rule for a key
     *
     * Later matching rules override earlier ones.
     *
     * @param key - Key of the tracked value
     * @param rule - Rule definition
     */
    register<K extends keyof T>(
        key: K,
        rule: DebugRule<T[K]>,
    ) {
        if (!this.rules[key]) {
            this.rules[key] = [];
        }

        this.rules[key]!.push(rule);
        this.rules[key]!.sort(
            (a, b) => (a.weight ?? 0) - (b.weight ?? 0)
        );

    }

    /**
     * Updates the debug state using current values
     *
     * Should be called in UpdateEvent
     *
     * @param values - Current values to evaluate
     * @param t - Current time in ms
     * @returns Debug text
     */
    update(values: T, t: number = getTime() * 1000): string {
        const lines: string[] = [];

        for (const key in values) {
            const value = values[key];
            const rules = this.rules[key];

            if (!this.state[key]) {
                this.state[key] = {
                    text: "-",
                    status: "info",
                    timestamp: t
                };
            }

            const state = this.state[key];

            if (state.expireMs !== undefined && t - state.timestamp > state.expireMs) {
                state.text = "-";
                state.expireMs = undefined;
            }

            if (rules) {
                for (const rule of rules) {
                    if (rule.when(value)) {
                        state.text = rule.format(value);
                        state.status = rule.status ?? "info";
                        state.timestamp = t;
                        state.expireMs = rule.expireMs;
                    }
                }
            }

            const ageSec = ((t - state.timestamp) / 1000).toFixed(1);
            lines.push(
                `${key}: ${colorize(state.text, state.status)} (${ageSec}s)`
            );
        }

        return lines.join("\n");
    }

    /**
     * Reset
     *
     * @param key - Optional key to reset; resets all if skipped
     */
    reset(key?: keyof T) {
        if (key) delete this.state[key as string];
        else this.state = {};
    }
}

function colorize(text: string, status: LogStatus): string {
    switch (status) {
        case "info":  return `🟢 ${text}`;
        case "warn":  return `🟡 ${text}`;
        case "error": return `🔴 ${text}`;
    }
}