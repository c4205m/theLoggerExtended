class TableContent {
    cellData: Array<Array<CellContent>> = [];
    cellRows: Array<string> = []
    size: { row: number; col: number };
    padding: number = 0;
}

class CellContent {
    value: string = "";
    span: number = 1;
    length: number = 0;
    colIndex: number = 0;
    rowIndex: number = 0;
}

export class daTable {
    // Reminder to myself: I used "size" when number of item a col or row contains
    //      "count" is for how many row or col table contains

    private daTable: TableContent;
    private ignoreUserSpan: boolean = false;
    private maxColSizes: Array<number> = [];
    private maxRowSize: number = 0;
    private block = [
        {
            forks: ["├", "┬", "┤", "┴"],
            walls: ["│", "─"],
            corners: ["┌", "┐", "┘", "└"],
            plus: "┼"
        },
        {
            forks: ["├", "┬", "┤", "┴"],
            walls: ["│", "─"],
            corners: ["╭", "╮", "╯", "╰"],
            plus: "┼"
        },
        // {
        //     forks: ["┣", "┳", "┫", "┻"],
        //     walls: ["┃", "━"],
        //     corners: ["┏", "┓", "┛", "┗"],
        //     plus: "╋"
        // },
        {
            forks: ["╠", "╦", "╣", "╩"],
            walls: ["║", "═"],
            corners: ["╔", "╗", "╝", "╚"],
            plus: "╬"
        },
        
    ];

    constructor(private content: Array<Array<any>>, private cellSpans: Array<Array<number>> = [], private theme: number = 0){
        this.daTable = new TableContent();

        const maxColSize = Math.max(...content.map(x => x.length));
        const maxRowSize = content.length;

        this.daTable.size = {col: maxColSize, row: maxRowSize};

        if(cellSpans.flat().length !== content.flat().length) {
            if(cellSpans.flat().length) console.warn("'cellSpans' ignored due to wrong data size. Pls make sure it's same size with the content.");
            this.ignoreUserSpan = true;
        }

        for (let y = 0; y < maxRowSize; y++) {
            const colCount = this.content[y].length;
            
            for (let x = 0; x < colCount; x++) {    
                if(!this.ignoreUserSpan) this.maxRowSize = Math.max(cellSpans[y].reduce((a, b) => a + b, 0), this.maxRowSize);

                this.maxColSizes[x] = Math.max(String(content[y][x]).length, this.maxColSizes[x] ?? 0);
            }
        }
    }

    get tableData(){
        this.extractCells();
        return this.daTable;
    }

    set padding(padding: number){
        this.daTable.padding = padding;
    }

    public printTable(){
        this.extractCells();
        for(const line of this.daTable.cellRows){
            print(line);
        }
    }

    private extractCells(){
        const rowCount = this.content.length;

        for (let y = 0; y < rowCount; y++) {
            this.daTable.cellData[y] = [];

            let topLine = "";
            let midLine = "";
            let bottomLine = "";
            
            const colCount = this.content[y].length;

            const topRow = Boolean(this.content[y-1]); 
            const bottomRow = Boolean(this.content[y+1]);
            
            for (let x = 0; x < colCount; x++) {                    
                const currentContent = String(this.content[y][x]);
                
                //
                const cellContent = new CellContent();
                cellContent.value = currentContent;
                cellContent.colIndex = x;
                cellContent.rowIndex = y;
                
                //
                const left = Boolean(this.content[y][x-1]);
                const right = Boolean(this.content[y][x+1]);
                
                //
                
                if(this.ignoreUserSpan) {
                    const span = (1 / colCount) * this.daTable.size.col;

                    const startCol = Math.floor((x / colCount) * this.daTable.size.col);
                    const targetCol = Math.floor(((x + 1) * span));

                    let spanLength = 0;
                    for(let i = startCol; i < targetCol; i++){
                        spanLength += this.maxColSizes[i] + this.daTable.padding;
                    }
                    
                    cellContent.span = null;
                    cellContent.length = spanLength + (x === colCount-1 ? this.daTable.size.col - colCount : 0);  
                } else {
                    cellContent.span = this.cellSpans[y][x];

                    const excess = x === colCount - 1 && cellContent.span !== this.maxRowSize
                            ? this.maxRowSize -
                              this.cellSpans[y].reduce((a, b) => a + b, 0)
                            : 0;
                    cellContent.length = (cellContent.span + excess) * this.daTable.size.col + (x === colCount-1 ? this.daTable.size.col - colCount : 0);  
                }


                //
                topLine += this.makeCell(cellContent, [left, right])[0];
                midLine += this.makeCell(cellContent, [left, right])[1];
                bottomLine += this.makeCell(cellContent, [left, right])[2];
                
                //
                this.daTable.cellData[y][x] = cellContent;
            }   

            if(!topRow) this.daTable.cellRows.push(topLine);
            this.daTable.cellRows.push(midLine);
            this.daTable.cellRows.push(bottomLine);
        }

        this.editCells()
    }

    private editCells(){
        const blocks = this.block[this.theme];
        const rows = this.daTable.cellRows;
        const rowsLen = rows.length;
        for(let y = 0; y < rowsLen; y++){
            if(y % 2 !== 0 || y === 0 || y === rowsLen - 1) continue; //Not yet needs a check

            const line = [...rows[y]];
            const lineLen = line.length;
            for(let x = 0; x < lineLen; x++){
                const left = blocks.walls.includes(line[x-1]);
                const top = Boolean(rows[y-1]) && blocks.walls.includes(rows[y-1][x]); 
                const right = blocks.walls.includes(line[x+1]);
                const bottom = Boolean(rows[y+1]) && blocks.walls.includes(rows[y+1][x]);

                let point = Number(left) + Number(right) + Number(top) + Number(bottom);
                if(point < 3) continue;
                if(point === 4) {line[x] = blocks.plus; continue;}
                [left, top, right, bottom].map(x => !x).forEach((v, i) => {if(v) {line[x] = blocks.forks[i]}})
            }
            this.daTable.cellRows[y] = line.join("");
        }

    }

    private makeCell(cellContent: CellContent, adjecents: [boolean, boolean] = [false, false]) : [string,string,string]{
        const blocks = this.block[this.theme];

        let top = "";
        let str = cellContent.value;
        let bottom = "";

        str =(!adjecents[0] ? blocks.walls[0] : "") + this.insertString(" ".repeat(cellContent.length), str) + blocks.walls[0];

        top = (!adjecents[0] ? blocks.corners[0] : "") + blocks.walls[1].repeat(cellContent.length) + blocks.corners[1];
        bottom = (!adjecents[0] ? blocks.corners[3] : "") + blocks.walls[1].repeat(cellContent.length) + blocks.corners[2];

        return [top, str, bottom];
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