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
	grouped: [] as DisplayFileResult[]
})


function activeFile(data: DisplayFileResult) {
	if (data.active === true)
		return
	for (const element of vueStore.grouped) {
		element.active = false
	}
	data.active = true
	clearFileItem();
}

function clearFile() {
	for (const element of vueStore.grouped) {
		element.active = false
	}
}

function clearFileItem() {
	for (const element of vueStore.grouped) {
		for (const item of element.results) {
			item.active = false
		}
	}
}

function activeItem(match: DisplayResult) {
	if (match.active === true)
		return
	for (const element of vueStore.grouped) {
		for (const item of element.results) {
			item.active = false
		}
	}
	match.active = true
	clearFile()
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


export {
	vueStore,
	searchOptions,
	setSearching,
	activeItem,
	activeFile,
}