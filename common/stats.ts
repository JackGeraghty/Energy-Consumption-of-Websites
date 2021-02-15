function mean(data: Array<number>): number {
    let mean = 0;
    for (let item of data) {
        mean += item;
    }
    return mean / data.length;
}

function variance(data: Array<number>, mean: number): number {
    let sum = 0;
    for (let item of data) {
        sum += Math.pow(item - mean, 2);
    }
    return sum / data.length;
}

export function buildMapResult(data: Array<number>): Map<string, number> {
    let resultMap: Map<string, number> = new Map();
    let avg = mean(data);
    let v = variance(data, avg);
    let stddev = Math.sqrt(v);
    resultMap.set("mean", avg);
    resultMap.set("variance", v);
    resultMap.set("stddev", stddev);
    return resultMap;
}