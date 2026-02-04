type TodoLogs = "objective" | "stack";
export class Todo {
    private todoLists: { [subject: string]: Array<Record<TodoLogs, string>> } = {};

    constructor(private self: BaseScriptComponent){}

    public TODO(objective: string, subject: string = "GENERAL") {
        if (!this.todoLists[subject]) {
            this.todoLists[subject] = [];
        }
        
        this.todoLists[subject].push({objective: objective, stack: "on " + this.fileName()});
    }

    public whatTODO(subject?: string) {
        //Delay to get full list anywhere
        const delay = this.self.createEvent("DelayedCallbackEvent");
        delay.bind(()=>{
            print(this.insertString("┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ━━ ━", "TODO", 3, .2));
            if (subject) {
                print(this.insertString("┃━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ━━ ━", subject, 1, .2));
                print("┃");
                for(const x of this.todoLists[subject]){
                    print("┃  𝇈 " + x.objective + " " + x.stack);
                }
                print("┃");
            } else {
                for (const key in this.todoLists) {
                    print(this.insertString("┃━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ━━ ━", key, 1, .2));
                    print("┃");
                    for(const x of this.todoLists[key]){
                        print("┃  𝇈 " + x.objective + " " + x.stack);
                    }
                    print("┃");
                }
            }
            print("┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ━━ ━");
        })
        delay.reset(0.05);
    }

    private fileName(): string | null {
        const stackTrace = new Error().stack;
        const lines = stackTrace.trim().split("\n").reverse();

        let fileName = null;
        for (const line of lines) {
            // Match anything that ends with .js inside parentheses
            const match = line.match(/\(([^)]+\.js):\d+\)/);
            if (match) {
                fileName = match[1];
                break;
            }
        }
        if (fileName.endsWith("_c.js")) {
            fileName = fileName.replace("_c.js", ".ts");
        }
        return fileName;
    }

    private insertString(original: string, insert: string, repeat = 1, gap = 0) {
        let insertionLen = insert.length;
        const originalLen = original.length;

        gap = Math.round(originalLen * gap);

        let blockWidth = repeat * insertionLen + (repeat - 1) * gap;
        if(insertionLen >= originalLen - 1){
            insert = insert.slice(0, originalLen - 4) + "..";
            repeat = 1
            gap = 0;
            insertionLen = insert.length;
            blockWidth = repeat * insertionLen + (repeat - 1) * gap;
        }

        let insertionStart = Math.floor((originalLen - blockWidth) / 2);

        let result = original;
        for (let i = 0; i < repeat; i++) {
            const pos = insertionStart + i * (insert.length + gap);

            result =
                result.slice(0, pos) +
                insert +
                result.slice(pos + insertionLen);
        }

        return result;
    }
}