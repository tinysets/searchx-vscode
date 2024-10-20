import { atom, getDefaultStore } from "jotai";
import { reactive } from "vue";
import { DisplayFileResult, DisplayResult } from "../types";


let patternAtom = atom('')
let store = getDefaultStore()

const vueStore = reactive({
	expandGlobal: true,
	pattern: "",
	includeFile: "",
	excludeFile: "",
	fzfFile: "",
	caseSensitive: false,
	fullSearch: false,
	forward: true,
	windowSize: 1,
	searching: false,
	showOptions: true,
	expandedGlobal: true,
	grouped: [] as DisplayFileResult[],
	activeItem: null as any
})


function activeFile(data: DisplayFileResult) {
	vueStore.activeItem = data
}


function activeItem(match: DisplayResult) {
	vueStore.activeItem = match
}


function setSearching(value: boolean) {
	vueStore.searching = value
}

let searchOptions = [
	'pattern',
	'includeFile',
	'excludeFile',
	'fzfFile',
	'caseSensitive',
	'fullSearch',
	'forward',
	'windowSize',
]

store.sub(patternAtom, () => {
	let pattern = store.get(patternAtom)
	vueStore.pattern = pattern
})

export {
	store,
	vueStore,
	searchOptions,
	setSearching,
	activeItem,
	activeFile,
	patternAtom,
}