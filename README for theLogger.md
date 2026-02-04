# theLogger for Lens Studio
<img src="https://images.ctfassets.net/ub38vssza5h3/7FynBv68WKAHYYAe7XQhlk/dfa0ebd5e13c3bdd5b0f34345e65170f/LS.png" width="100" height="100" alt="Lens Studio">

This extends the print() function of LS. You can log to your console and screen, ask questions to ChatGPT, make TODO lists, draw tables from arrays.

## Features
-   **Multiple Print Modes**:
    -   `No Log`: Suppress all output
    -   `Default`: Standard print output
	-   `Search Properties`: Inspect object properties (shallow)
    -   `Search Recursive`: Recursive object inspection (up to 5 levels deep)
        
-   **Group Filtering**: Filter logs by tags/groups
    
-   **Stack Traces**: Optional call stack information
    
-   **Interactive Screen Logging**: Visual logging overlay in Lens Preview
    - Scroll through logs
    - Swipe left to hide log panel
    - Tap nudge to show again
	   
-   **Method Chaining**:
	```js
	print(obstacles, { objectProperties: "position.normalize()" });
    // prints every obstacles normalized position
	```
-   **AI Support**: No login is required; this utilizes the LS module for the Chat GPT API. 

-  **TODO Application**: Save your tasks and display them in the console.

-  **Print Tables**: Quickly print tables using 2D arrays.

-  **Sticky Debug on Updete**: Instead of constantly printing raw values every frame, `PulseDebug` keeps the *last meaningful state* on screen.


## Installation
1. Add theLogger component to your Lens Studio project
2. Place it top in scene hierarchy
3. Configure inputs
4. Start logging

PS. The theLogger is written in TypeScript and implemented globally, enhancing autocompletions for TypeScript while providing no completions in JavaScript.

## Configuration Options
| Parameter | Type | Values | Default |
|-----------|------|--------|---------|
| `Print Mode` | Dropdown | NONE/DEFAULT/PROPS/DEEP | DEFAULT |
| `Log To Screen` | Boolean | true/false | false |
| `Print Groups` | String Array | Any tags | [] |
| `Print Stack` | Boolean | true/false | false |

## Usage Examples
```javascript
//Basic log
print("Game started");

//Advanced log
print(gameObject, {
    printNote: "Player position",
    printGroups: ["player", "debug"],
    objectProperties: "transform.getWorldPosition()"
});
```
**With Arguments**
```js
//With print note:
print("Game started", {printNote:"Note"})
print("Game started", {printNote:"~source"})
print("Game started", {printNote:"~groupIds", printGroups:["state", "debug"]})
print("Game started", {printNote:"~properties", objectProperties: "replace('Game', 'Countdown')"})
//Output: 
//	Note - Game Started
//	main.js - Game Started
//	[state, debug] - Game Started
//	replace('Game', 'Countdown') - Countdown Started
```
**Search Properties**
```javascript
print(obstacles);
//Output:
//	0 - [object object]
//	1 - [object object]
//	2 - [object object]
//	2 - [object object]

//With method chaining:
print(obstacles, {
  objectProperties: "getTransform().getWorldPosition()" 
});
//Output:
//	0 - vec3()
//	1 - vec3()
//	2 - vec3()
//	3 - vec3()
```
**Recursive Search:**
```js
print(obstacles);
//Output:
//	0 - {
//		name - Obstacle 0
//		getTransform - function(){}
//		onEnabled - {
//			...
//			add - function(){}
//			...
//		}
//	}
//	1 - {
//		name - Obstacle 1
//		getTransform - function(){}
//		onEnabled - {
//			...
//			add - function(){}
//			...
//		}
//	}
```
**Ask ChatGPT**
```javascript
printAsk("How do i do that?"); //With maximum bully, why not 

printAsk("How do i do that?", 0); //no mean comments

// A better usage
try{
    script.createEvent("BananaEvent")
}catch(e){
    printAsk(e)
    throw new Error(e)
}
```

**TODO Function**
```javascript
TODO("Identify and handle the potential null reference in the class"); // Adds to TODO list
TODO("Implement the merge sort algorithm", "SORTING"); // Adds to TODO list with subject
whatTODO() // Prints TODO list
whatTODO("SORTING") // Prints filtered TODO list
TODO("Develop a custom exception class for handling specific errors"); // This will be included in the output of whatTODO() even though it is executed afterward

// Output:
// ┏━━━━━━━━━━━━━━━━TODO━━━━━━━━━━━━━━━TODO━━━━━━━━━━━━━━━TODO━━━━━━━━━━━━━ ━━ ━
// ┃━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━GENERAL━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ━━ ━
// ┃
// ┃  𝇈 Identify and handle the potential null reference in the class on file.ts
// ┃  𝇈 Develop a custom exception class for handling specific errors on some.js
// ┃
// ┃━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━SORTING━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ━━ ━
// ┃
// ┃  𝇈 Implement the merge sort algorithm on sort.ts
// ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ━━ ━
```

**Print Table**
```javascript

    const mythicalCreatureTable = [
        ["Creature", "Origin", "Abilities", "Favorite Food", "Strength Level"],
        ["Dragon", "Various Cultures", "Fire breathing, Flight", "Goats", 10],
        ["Unicorn", "European Folklore", "Healing, Purity", "Rainbows", 8],
        ["Chimera", "Greek Mythology", "Fire breathing, Regeneration", "Anything", 9],
        ["Mermaid", "Various Cultures", "Swimming, Hypnosis", "Shellfish", 7],
        ["Bigfoot", "North American Folklore", "Stealth, Strength", "Berries", 6]
    ];

    printAsTable(mythicalCreatureTable, 5) // prints table with auto-span with padding of 5
    
    //Output:
    // ┌─────────────┐────────────────────────────┐─────────────────────────────────┐──────────────────┐───────────────────┐
    // │  Creature   │           Origin           │            Abilities            │  Favorite Food   │  Strength Level   │
    // ├─────────────┼────────────────────────────┼─────────────────────────────────┼──────────────────┼───────────────────┤
    // │   Dragon    │      Various Cultures      │     Fire breathing, Flight      │      Goats       │        10         │
    // ├─────────────┼────────────────────────────┼─────────────────────────────────┼──────────────────┼───────────────────┤
    // │   Unicorn   │     European Folklore      │         Healing, Purity         │     Rainbows     │         8         │
    // ├─────────────┼────────────────────────────┼─────────────────────────────────┼──────────────────┼───────────────────┤
    // │   Chimera   │      Greek Mythology       │  Fire breathing, Regeneration   │     Anything     │         9         │
    // ├─────────────┼────────────────────────────┼─────────────────────────────────┼──────────────────┼───────────────────┤
    // │   Mermaid   │      Various Cultures      │       Swimming, Hypnosis        │    Shellfish     │         7         │
    // ├─────────────┼────────────────────────────┼─────────────────────────────────┼──────────────────┼───────────────────┤
    // │   Bigfoot   │  North American Folklore   │        Stealth, Strength        │     Berries      │         6         │
    // └─────────────┘────────────────────────────┘─────────────────────────────────┘──────────────────┘───────────────────┘

    // You can initialize a different array with the same size for the column dimensions of each column
    printAsTable(mythicalCreatureTable, 1, colSpans)

    // You can also change table style
    printAsTable(mythicalCreatureTable, 1, colSpans, 2)
```

**ProcessLogger**

This can display single values, multiple labeled values, or entire records as fixed-length bars, making numeric data easy to visualize in logs or consoles. Positive values are shown in green (🟢), negative values in red (🔴), and empty space in black (⚫️), with optional custom bar lengths and min/max scaling.

Example usage:
```ts
printProcess("Health", 0.7);
printProcessRecord({ Mana: 0.3, Stamina: 0.9 });
printProcessSet([["Ammo", 10, 0, 20], ["SecondaryAmmo", 20, 0, 20]]);
```

```ts
// Progress set array
export type ProgressSet = [
    label: string,
    value: number,
    min: number,
    max: number,
]
```

**PulseDebug**

This one is a small, rule-based, time-aware debugging utility for games, simulations, and real-time systems.

It lets you describe:

- **When** a value becomes interesting
- **How** it should be displayed
- **How long** it should remain visible

Instead of constantly printing raw values every frame, `PulseDebug` keeps the *last meaningful state* on screen until it expires or is replaced by something more important.

```ts
//DEFINE YOUR DEBUG INPUT TYPE
type PlayerDebug = {
  isShooting: boolean;
  ammo: number;
};
//CREATE AN INSTANCE
const debug = new PulseDebug<PlayerDebug>();

//REGISTER RULES
// Shooting state
debug.register("isShooting", {
  when: v => v === true,
  format: () => "SHOOTING",
  status: "warn",
  expireMs: 300
});

// Ammo empty (high priority)
debug.register("ammo", {
  when: v => v === 0,
  format: () => "NO AMMO",
  status: "error",
  weight: 10
});

// Ammo low
debug.register("ammo", {
  when: v => v < 5,
  format: v => `LOW AMMO (${v})`,
  status: "warn"
});

// Normal ammo display
debug.register("ammo", {
  when: v => v >= 5,
  format: v => `Ammo: ${v}`,
  status: "info"
});

//Update every frame
this.createEvent("UpdateEvent").binc(()=>{
    const output = debug.update({
      isShooting: player.isShooting,
      ammo: player.ammo
    });
    
    print(output);
    //isShooting: 🟡 SHOOTING (0.1s)
    //ammo: 🔴 NO AMMO (2.4s)
})
```
```ts
// Register rule structure
type DebugRule<T> = {
    
  when: (value: T) => boolean;
  format: (value: T) => string;
  weight?: number;
  status?: "info" | "warn" | "error";
  expireMs?: number;
};
```
---
<p>*<a href="https://github.com/c42m05/the-Logger">theLogger</a> by <a href="https://c42m05.github.io/">c4205M</a> is licensed under <a href="https://github.com/c4205m/the-Logger/blob/main/LICENSE">GNU GENERAL PUBLIC LICENSE</a>.</p>
