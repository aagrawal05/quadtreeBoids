let profilerData = [];
let initialPopulation = 1000;
let endPopulation = 10000;
let populationStep = 1000;
let population = initialPopulation;

let maxDepth = 0;
let endMaxDepth = 15;
let trial = 0;
let trials = 10;
let framesPerTrial = 3000;

function setup(){
	initBoids(population, maxDepth, false);
}

function draw(){
	start = performance.now();
	updateBoids(false);
	end = performance.now();
	profilerData.push(end - start);
	// console.log("TIME: " + (end - start) + "ms");
	if(profilerData.length > framesPerTrial){
		saveAs(new Blob([JSON.stringify(profilerData)], {type: "text/plain;charset=utf-8"}), "profilerDataMd"+maxDepth+".json");
		profilerData=[];
		maxDepth++;
		if(maxDepth > endMaxDepth)
			noLoop();
		initBoids(population, maxDepth, false);
	}
}
