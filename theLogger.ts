// import { LogArguments, Settings, PrintModes, Logger } from "./logger";
// import { daTable } from "./daTable";
// import { Todo } from "./todo";
// import { ProcessLogger, ProgressSet, StickyDebug } from "./processLogger";

// interface loggerOptions {
//     printNote?: string;
//     printGroups?: Array<string>,
//     objectProperties?: string,
// }

// declare global {
//     namespace globalThis {
//         interface loggerOptions {
//             printNote?: string;
//             printGroups?: Array<string>;
//             objectProperties?: string;
//         }

//         interface ProcessLogOptions {
//             min?: number, 
//             max?: number, 
//             barLength?: number, 
//         }

//         type ProgressSet = [
//             label: string,
//             value: number,
//             min: number,
//             max: number,
//         ]

//         type sarcasmDegree = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
//         type style = 0 | 1 | 2 | 3 ;

//         function print(printLog: any, options?: loggerOptions): void;
//         function printDelimeter(title?: string, size?: number, repeat?: number, gap?: number): void;
//         function printAsk(question: string, sarcasm?: sarcasmDegree): void;
//         function printAsTable(tableArr: Array<Array<any>>, padding?: number, colSpanArr?: Array<Array<number>>, style?: style): void;
//         function TODO(objective: string, subject?: string): void;
//         function whatTODO(subject?: string): void;
//         function printProcess(label: string, value: number, options?:ProcessLogOptions, log?: boolean): string;
//         function printProcessSet(value: Array<ProgressSet>, barLength?: number, log?: boolean): string;
//         function printProcessRecord(value: Record<string, number>, options?:ProcessLogOptions, log?: boolean): string;

//         var PulseDebug: typeof StickyDebug;
//     }
// }

// @component
// export class theLogger extends BaseScriptComponent{
    
//     @input
//     readonly transparentMaterial: Material;
    
//     // @input
//     // readonly chatGpt: RemoteServiceModule;

//     @input
//     readonly fontType: Font;
    
//     @input
//     @widget(
//         new ComboBoxWidget([
//             new ComboBoxItem("No log", "NONE"),
//             new ComboBoxItem("Default", "DEFAULT"),
//             new ComboBoxItem("Search Properties", "PROPS"),
//             new ComboBoxItem("Search Recursive", "DEEP"),
//         ])
//     )
//     readonly printMode: string = "DEFAULT";

//     @input
//     readonly logToScreen: boolean = true;
    
//     @input
//     readonly printStack: boolean;

//     @input
//     readonly printGroups: Array<string>;

//     private camera: Camera;
//     private text: Text;
//     private transform: ScreenTransform;
//     private touchTransform: ScreenTransform;
//     private touchArea: Image; 
//     private interaction: InteractionComponent;
//     private update: UpdateEvent = null;
//     private logger: Logger = null;
//     private todo: Todo = null;

//     onAwake() {
//         if(this.logToScreen) this.setupScreenLogger();

//         // Initial settings
//         const loggerSettings = new Settings();
//             loggerSettings.originalPrint = print;
//             loggerSettings.groupFilters = this.printGroups;
//             loggerSettings.showStack = this.printStack;
//             loggerSettings.stack = new Error().stack;
//             loggerSettings.logToScreen = this.logToScreen;
//             loggerSettings.printMode = PrintModes[this.printMode];

//         // Instantiate logger
//         this.logger = new Logger(loggerSettings);
//         this.todo = new Todo(this);

//         // Inject logger to original print()
//         globalThis.print = (...args: any[]) => {this.theLogger.apply(this, args)};
//         // globalThis.printAsk = (question: string, sarcasm: number = 10) => this.apiRequest(question, sarcasm).then((x)=>print(JSON.parse(x.body).choices[0].message.content));
//         globalThis.printAsTable = (tableArr: Array<Array<any>>, padding: number = 0, colSpanArr: Array<Array<number>> = [], style: number = 0) => {
//             const table = new daTable(tableArr, colSpanArr, style);
//             table.padding = padding;
//             table.printTable();
//         };

//         globalThis.TODO = this.todo.TODO.bind(this.todo);
//         globalThis.whatTODO = this.todo.whatTODO.bind(this.todo);

//         globalThis.printDelimeter = (title = "", size = 100, repeat = 1, gap = 0) => {
//             print(this.insertString("━".repeat(size), title, repeat, gap));
//         }

//         globalThis.printProcess = (label: string, value: number, {min = 0, max = 1, barLength = 10}={}, log = true) => {
//             const out = ProcessLogger.drawProgress(label, value, min, max, barLength);
//             if(log) print(out);
//             return out;
//         };
//         globalThis.printProcessSet = (value: Array<ProgressSet>, barLength = 10, log = true) => {
//             const out = ProcessLogger.drawProgressSet(value, barLength);
//             if(log) print(out);
//             return out;
//         }
//         globalThis.printProcessRecord = (value: Record<string, number>, {min = 0, max = 1, barLength = 10}={}, log = true) => {
//             const out = ProcessLogger.drawProgressRecord(value, min, max, barLength);
//             if(log) print(out);
//             return out;
//         }

//         globalThis.PulseDebug = StickyDebug;
//     }

//     private theLogger(
//         printLog: any,
//         options: loggerOptions,
//     ) {
//         const log = new LogArguments();
//             log.log = printLog;
//             log.callstack = new Error().stack;
//             log.note = options?.printNote || "";
//             log.groupIds = options?.printGroups || [];
//             log.properties = options?.objectProperties || "";

//         this.logger.log(log);

//         if(this.logToScreen && this.logger.logs.length > 0) {
//             this.logScreen(this.logger.logs, this.transform, this.text, this.interaction);
//         }
//     };

//     private logScreen(
//         logs: Array<string>,
//         transform: ScreenTransform,
//         text: Text,
//         interaction: InteractionComponent
//     ) {
//         this.camera.enabled = true;

//         let v = vec2.zero();
//         let start = vec2.zero();
//         let touch = vec2.zero();
//         let visible = true;
//         let velocity = vec2.zero();
//         let isTouching = false;
//         let previousY = 0;

//         text.text = "";
//         logs = logs.slice(-500);
//         if (visible) text.text += "\n>>>\t" + logs.join("\n>>>\t");

//         transform.anchors.setCenter(v);
//         interaction.isFilteredByDepth = false;

//         interaction.onTap.add(() => {
//             if (!visible) {
//                 visible = true;
//                 v.x = 0;
//                 transform.anchors.setCenter(v);
//                 text.enabled = true;
//                 this.touchTransform.anchors.setCenter(new vec2(0, 0));
//                 this.transparentMaterial.mainPass.baseColor = new vec4(0.0, 0.0, 0.0, 0.9);
//             }
//         });

//         interaction.onTouchStart.add((e) => {
//             isTouching = true;
//             start = transform.anchors.getCenter();
//             touch = e.position;
//             previousY = e.position.y;
//         });

//         interaction.onTouchMove.add((e) => {
//             if (!visible) return;

//             const dx = e.position.x - touch.x;
//             const dy = e.position.y - touch.y;
//             const dyFrame = e.position.y - previousY;

            
//             if (dx < -0.3 && Math.abs(dx) > Math.abs(dy)) {
//                 visible = false;
//                 v = transform.anchors.getCenter();
//                 v.x = -2;
//                 transform.anchors.setCenter(v);
//                 text.enabled = false;
//                 this.touchTransform.anchors.setCenter(new vec2(-1.9, 0));
//                 this.transparentMaterial.mainPass.baseColor = new vec4(0.0, 0.0, 0.0, 0.6);
//                 return;
//             }
            
//             velocity.y = (touch.y - e.position.y) * 2; 
            
//             v.y = start.y + velocity.y;
//             transform.anchors.setCenter(v);
//             if(Math.abs(dyFrame) < 0.05) {
//                 velocity.y = 0;
//             }

//             previousY = e.position.y;
//         });

//         interaction.onTouchEnd.add(() => {
//             isTouching = false;
//         });

//         this.update.bind(() => {
//             if (!visible || isTouching) return;

//             v.y += velocity.y;
//             velocity.y *= 0.95;

//             if (Math.abs(velocity.y) < 0.01) {
//                 velocity.y = 0;
//             }

//             transform.anchors.setCenter(v);
//         });
//     };

//     private setupScreenLogger(){
//         // Setup scene
//         const camera = this.createSceneComponent(this.sceneObject, "_camera", [
//             "Camera",
//         ]);
//         const fullFrame = this.createSceneComponent(camera.Object, "_full", [
//             "ScreenTransform",
//             "ScreenRegionComponent",
//         ]);
//         const safeFrame = this.createSceneComponent(camera.Object, "_safe", [
//             "ScreenTransform",
//             "ScreenRegionComponent",
//         ]);
//         const touchArea = this.createSceneComponent(fullFrame.Object, "_touchArea", [
//             "ScreenTransform", 
//             "Image", 
//             "InteractionComponent",
//         ]);
//         const text = this.createSceneComponent(safeFrame.Object, "_textArea", [
//             "ScreenTransform",
//             "Text",
//         ]);

//         fullFrame.ScreenRegionComponent.region = ScreenRegionType.FullFrame;
//         safeFrame.ScreenRegionComponent.region = ScreenRegionType.SafeRender;
        
//         // Set layers
//         const layer = LayerSet.makeUnique();

//         camera.Object.layer = layer;
//         fullFrame.Object.layer = layer;
//         safeFrame.Object.layer = layer;
//         touchArea.Object.layer = layer;
//         text.Object.layer = layer;

//         // Set camera
//         camera.Camera.enabled = false;
//         camera.Camera.type = Camera.Type.Orthographic;
//         camera.Camera.renderLayer = layer;
//         camera.Camera.renderTarget = global.scene.liveTarget;
//         camera.Camera.renderOrder = 200;

//         // Set touch area
//         touchArea.Image.stretchMode = StretchMode.Stretch;
//         touchArea.Image.mainMaterial = this.transparentMaterial;
//         this.transparentMaterial.mainPass.baseColor = new vec4(0.0, 0.0, 0.0, 0.9);

//         // Set text
//         text.Text.textFill.color = new vec4(0.07, 0.58, 0.07, 1.0);
//         text.Text.size = 20;
//         text.Text.font = this.fontType;
//         text.Text.horizontalOverflow = HorizontalOverflow.Wrap;
//         text.Text.horizontalAlignment = HorizontalAlignment.Left;
//         text.Text.verticalAlignment = VerticalAlignment.Bottom;

//         //
//         this.camera = camera.Camera;
//         this.transform = text.ScreenTransform;
//         this.touchTransform = touchArea.ScreenTransform;
//         this.touchArea = touchArea.Image;
//         this.interaction = touchArea.InteractionComponent;
//         this.text = text.Text;
//         this.update = this.createEvent("UpdateEvent");
//     }

//     // private async apiRequest(err: string, sarcasm: number = 10){
//     //     const req = RemoteApiRequest.create();
//     //     req.endpoint = "completions";
//     //     req.body = JSON.stringify({
//     //         messages: [
//     //             {
//     //                 role: "developer",
//     //                 content: `Answer the user's questions about Lens Studio and its api or Javascript and Typescript languages in general. 
//     //                 Question may consist of code blocks or error messages only. 
//     //                 Be sarcastic, non-apolegetic and mean but also show possible solutions. 
//     //                 Your sarcasm level is ${sarcasm} out of 10. 
//     //                 Don't mention magic.
//     //                 Don't start wih 'Oh', and 'Wow'.`,
//     //             },
//     //             {
//     //                 role: "user",
//     //                 content: `${err}`,
//     //             },
//     //         ],
//     //     });

//     //     // const response: Record<string, any> = await new Promise((resolve) => {
//     //     //     this.chatGpt.performApiRequest(req, resolve)
//     //     // });

//     //     return {
//     //         statusCode: response.statusCode,
//     //         metadata: response.metadata,
//     //         body: response.body
//     //     };
//     // }

//     private createSceneComponent(
//         root: SceneObject, 
//         objectName: string, 
//         componentNames: Array<keyof ComponentNameMap>, 
//         override: boolean = false
//     ) : Record<string, any> {
//         let sceneComponent = root;
//         if(!override) {
//             sceneComponent = global.scene.createSceneObject(objectName);
//             sceneComponent.setParent(root);
//         }

//         const components = {};
//         for(const n of componentNames) {
//             components[n.replace(/^(Component\.|Physics\.)/, "")] = sceneComponent.createComponent(n);
//         }
//         components["Object"] = sceneComponent;

//         return components;
//     }

//     private insertString(original: string, insert: string, repeat = 1, gap = 0) {
//         let insertionLen = insert.length;
//         const originalLen = original.length;

//         gap = Math.round(originalLen * gap);

//         let blockWidth = repeat * insertionLen + (repeat - 1) * gap;
//         // if(insertionLen >= originalLen - 1){
//         //     insert = insert.slice(0, originalLen - 4) + "..";
//         //     repeat = 1
//         //     gap = 0;
//         //     insertionLen = insert.length;
//         //     blockWidth = repeat * insertionLen + (repeat - 1) * gap;
//         // }

//         let insertionStart = Math.floor((originalLen - blockWidth) / 2);

//         let result = original;
//         for (let i = 0; i < repeat; i++) {
//             const pos = insertionStart + i * (insert.length + gap);
//             result = result.slice(0, pos) + insert + result.slice(pos + insertionLen);
//         }

//         return result;
//     }
// }