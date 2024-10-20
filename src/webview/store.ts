import { reactive } from "vue";

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
})


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
}