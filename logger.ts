interface MethodDescription {
    method: string;
    arguments: Array<any>;
    isFunction: boolean;
}

export class LogArguments {
        log: any = {};
        callstack: string = "";
        note: string = "";
        groupIds: Array<string> = [];
        properties: string = "";
}

export class Settings {
        printMode: number = 1;
        groupFilters: Array<string> = [];
        discard: string = "";
        stack: string = "";
        showErrors: boolean = false;
        showStack: boolean = false;
        logToScreen: boolean = false;
        originalPrint: (...args: Array<any>) => void = function(){};
}

export enum PrintModes{
    NONE,       // Suppress all output
    DEFAULT,    // Default print behaviour
    PROPS,      // Print enumerable properties (shallow search)
    DEEP      // Print nested properties (deep search)
}

export class Logger {
    public logs: Array<string>;
    private settings: Settings;
    private source: string | null;

    constructor(settings: Settings) {
        this.settings = settings;
        this.logs = [];
        this.source = this.extractSourceName(settings.stack, true);

        if (this.settings.groupFilters.length === 0) {
            this.settings.groupFilters = ["_any"];
        } else {
            this.print("🗿 FILTERED BY GROUPS!", true);
        }
    }

    public log(log: LogArguments) {
        if (this.settings.printMode === PrintModes.NONE) return;

        log.groupIds.push("_any");
        const idCheck = log.groupIds.some((x) =>
            this.settings.groupFilters.includes(x)
        );

        if (!idCheck) return;

        const propertyRegex = 
            /\.(?=(?:[^()]*\([^()]*\))*[^()]*$)(?![^\']*\'(?:[^()]*\([^()]*\))*[^()]*$)(?![^\"]*\"(?:[^()]*\([^()]*\))*[^()]*$)/;
        const methods = log.properties
            ? log.properties.split(propertyRegex)
            : null;
        const methodConstructions = methods
            ? methods.map((x) => this.parseStringOfFunction(x))
            : null;

        const stackFormatted = this.settings.showStack
            ? " ➜\n" + this.filterStack(log.callstack)
            : "";

        log.note = log.note.replace(
            "~source",
            this.extractSourceName(log.callstack)
        );
        log.note = log.note.replace("~groupIds", `[${log.groupIds}]`);
        log.note = log.note.replace("~properties", `[${methods}]`);
        const noteFormatted = log.note.length > 0 ? log.note + " - " : "";

        switch (this.settings.printMode) {
            case PrintModes.DEFAULT:
                const property = this.callProperties(
                    String(log.log),
                    methodConstructions
                );
                const formatted = `${noteFormatted}${property}${stackFormatted}`;
                this.print(formatted);
                break;
            case PrintModes.PROPS:
                if (this.settings.showStack) this.print(stackFormatted, true);

                if(
                    typeof log.log === "string" ||
                    typeof log.log === "number" ||
                    typeof log.log === "boolean" ||
                    log.log === undefined
                ){
                    const property = this.callProperties(
                        String(log.log),
                        methodConstructions
                    );
                    const formatted = `${noteFormatted}${property}${stackFormatted}`;
                    this.print(formatted);
                } else {
                    for (const i in log.log) {
                        const property = this.callProperties(
                            String(log.log[i]),
                            methodConstructions
                        );
                        const formatted = `${noteFormatted}${i} - ${property}`;
                        this.print(formatted);
                    }
                }
                break;
            case PrintModes.DEEP:
                if (this.settings.showStack) this.print(stackFormatted, true);

                if(
                    typeof log.log === "string" ||
                    typeof log.log === "number" ||
                    typeof log.log === "boolean" ||
                    log.log === undefined
                ){
                    const property = this.callProperties(
                        String(log.log),
                        methodConstructions
                    );
                    const formatted = `${noteFormatted}${property}${stackFormatted}`;
                    this.print(formatted);
                } else {
                    this.inspectRecursive(log.log, 0, new Set());
                }
                break;
        }
    }

    private inspectRecursive(
        item: Record<string, any>,
        depth: number = 0,
        visited: Set<Record<string, any>> = new Set(),
        indent: string = "  "
    ) {
        if (visited.has(item)) {
            this.print(indent.repeat(depth) + `Circular reference detected`);
            return;
        }
        visited.add(item);

        for (const i in item) {
            try {
                if (
                    typeof item[i] !== "object" ||
                    item[i] === null ||
                    depth > 4
                ) {
                    this.print(indent.repeat(depth) + `${i} - ${item[i]}`);
                    continue;
                }

                this.print(indent.repeat(depth) + `${i} - {`);
                this.inspectRecursive(item[i], depth + 1, visited);
                this.print(indent.repeat(depth) + "}");
            } catch (err) {
                this.print(indent.repeat(depth) + `$${i} - ERROR: ${err}`);
            }
        }
    }

    private callProperties(
        logItem: any = null,
        methodConstructions: Array<MethodDescription> | null = null
    ) {
        if (!methodConstructions) return logItem;

        let errorPin = "";
        try {
            for (const c of methodConstructions) {
                errorPin = c.method;

                if (c.isFunction) {
                    logItem = logItem[c.method](...c.arguments);
                } else {
                    logItem = logItem[c.method];
                }
            }

            return logItem;
        } catch (error) {
            return `${error}${errorPin !== "" ? " on " : ""}${errorPin}`;
        }
    }

    private parseStringOfFunction(input: string = "") {
        const regex = /^(\w+)\s*\(/; // String followed by paranthesis or space
        const methodMatch = input.match(regex);

        if (!methodMatch)
            return { method: input, arguments: [], isFunction: false };

        const method = methodMatch[1];
        let methodArgs = input.slice(methodMatch[0].length, -1).trim();

        if (methodArgs === "")
            return { method, arguments: [], isFunction: true };

        methodArgs = "[" + methodArgs.replace(/'/g, '"') + "]";

        let args;
        try {
            args = JSON.parse(methodArgs);
        } catch (e) {
            throw new Error("Failed to parse arguments");
        }

        return { method, arguments: args, isFunction: true };
    }

    private extractSourceName(stack: string = "", initial: boolean = false) {
        const validExtensions = [".js", ".ts"];
        const lines = stack.split("\n").filter(Boolean);
        let latestScript = null;

        for (const line of lines) {
            if (!initial && line.includes(this.source)) continue;

            const match = line.match(/\((.*?)\)/); // Inside of the paranthesis
            if (!match || !match[1]) continue;

            const path = match[1].split(":")[0];
            if (validExtensions.some((x) => path.toLowerCase().includes(x))) {
                latestScript = path;
                break;
            }
        }

        return latestScript;
    }

    private filterStack(stack: string = "", separator: string = "\n") {
        const lines = stack.split("\n").filter(Boolean);
        const filteredLines = [];

        for (const line of lines) {
            if (
                line.includes(this.source) ||
                line.includes("at apply (native)")
            )
                continue;
            filteredLines.push(line);
        }

        return filteredLines.join(separator);
    }

    private print(log: string = "", defaultPrint: boolean = false) {
        this.settings.originalPrint(log);
        if (defaultPrint) return;
        this.logs.push(log);
    }
}