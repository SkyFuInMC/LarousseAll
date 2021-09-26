"use strict";
import { DOMParser, Element } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
// Larousse simple access: https://www.larousse.fr/dictionnaires/francais${lang}/${term}
// Larousse word query redirect: https://www.larousse.fr/dictionnaires/rechercher?q=${term}&l=francais${lang}

let langMap = {
	"fr": "",
	"en": "-anglais",
	"cn": "-chinois"
}, lang = "en";

let Word = function (word, defs) {
	this.word = word;
	this.defs = defs;
};
class WordDefinitions extends Array {};
let WordDefinition = function (type, meaning, translate) {
	this.type = type;
	this.meaning = meaning;
	this.translate = translate;
};
class WordSuggest extends Array {};

let webParse;
{
	let domParser = new DOMParser();
	webParse = function (str) {
		return domParser.parseFromString(str, "text/html");
	};
};

let queryAccess = async function (term) {
	let result;
	let domQuery = await fetch(`https://www.larousse.fr/dictionnaires/francais${langMap[lang]}/${term}`);
	let domText = await domQuery.text();
	let domDoc = webParse(domText);
	let isSuggestion = domDoc.querySelector("section.corrector > h1")?.innerText == "Suggestions proposées par le correcteur";
	if (isSuggestion) {
		let suggs = Array.from(domDoc.querySelectorAll("section.corrector > ul > li")),
		sugg = "";
 		result = new WordSuggest();;
		suggs.forEach((e) => {
			sugg += ", " + e.innerText;
			result.push(e.innerText);
		});
		sugg = sugg.replace(", ", "");
		console.warn(`Word ${term} has ${suggs.length} suggestions: ${sugg}.`);
	} else {
		let realWord = "", intermURL = decodeURIComponent(domQuery.url.replace("https://", "")).split("/");
		for (let c = intermURL.length - 1; c >= 0; c --) {
			if (!realWord) {
				if (intermURL[c] != parseInt(intermURL[c]).toString()) {
					realWord = intermURL[c];
				};
			};
		};
		result = new Word(realWord, new WordDefinitions());
		let wordType = domDoc.querySelector(".ZoneGram > span").innerText.replace("  Conjugaison", "");
		console.log(`\n## ${realWord} (${wordType})`);
		Array.from(domDoc.querySelectorAll(".ZoneSemantique2 > li")).forEach((e) => {
			let indic = e.querySelector(".Indicateur")?.innerText;
			let tradu = "";
			Array.from(e.querySelectorAll(".Traduction")).forEach((e) => {
				tradu += ", " + e.innerText.replace(" Conjugaison ", "").replace(",", "").trimStart();
			});
			tradu = tradu.replace(", ", "");
			let domai = e.querySelector(".IndicateurDomaine")?.innerText.trim();
			result.defs.push(new WordDefinition(wordType, indic, tradu));
			let resultT = "* ";
			if (domai) {resultT += "(" + domai + ") "};
			if (indic) {resultT += indic + " "};
			if (tradu) {resultT += "(English: " + tradu + ")"};
			console.log(resultT);
			console.error(resultT);
		});
	};
	//console.log(`Result from ${domQuery.url}`);
	console.error(result);
	return result;
};

console.log("_Generated via LarousseAll by SkyFuInMC_\n");

let txtPool = await Deno.readTextFile("words.txt");
if (txtPool.length > 0) {
	txtPool.split("\n").forEach((e) => {
		if (e.trim().length > 0) {
			console.error(`Now loading: ${e}`);
			queryAccess(e);
		};
	});
};
