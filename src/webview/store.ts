import { reactive } from "vue";
import { DisplayFileResult, DisplayResult } from "../types";


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

let searchOptionsToSave = [
	'includeFile',
	'excludeFile',
	'fzfFile',
	'caseSensitive',
	'fullSearch',
	'forward',
	'windowSize',
	'showOptions',
]

export {
	vueStore,
	searchOptions,
	searchOptionsToSave,
	setSearching,
	activeItem,
	activeFile,
}