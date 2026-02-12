export class Oscilloscope{    
    private valueArr: Array<number> = [];
    private vecArr: Array<vec4> = [];

    constructor(
        private material: Material,
        private yScale: number = 1,
        private center: number = 0
    ){
        this.material.mainPass.xEnd = this.center;
        this.material.mainPass.mag = this.yScale;
    }

    set value(value: number){
        if(this.valueArr.length > 128) this.valueArr.shift()
            this.valueArr.push(value);

            const x = this.valueArr.slice(0, 32);
            const y = this.valueArr.slice(32, 64);
            const z = this.valueArr.slice(64, 96);
            const w = this.valueArr.slice(96, 128);

            this.vecArr = x.map((e, i) => new vec4(e, y[i] ?? 0, z[i] ?? 0, w[i] ?? 0));

            // [vec4]
            this.material.mainPass.arr = this.vecArr;
            this.material.mainPass.dynArrLen = this.valueArr.length;
    }
}
