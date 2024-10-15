import { atom, getDefaultStore } from "jotai";

const store = getDefaultStore()

let patternAtom = atom("")
let includeFileAtom = atom("")
let excludeFileAtom = atom("")
let fzfFileAtom = atom("")
let caseSensitiveAtom = atom(false)
let fullSearchAtom = atom(false)
let forwardAtom = atom(true)
let windowSizeAtom = atom(1)
let searchingAtom = atom(false)
let showOptionsAtom = atom(true)

function setSearching(value: boolean) {
	store.set(searchingAtom, value)
}

let searchOptions = {
	pattern: patternAtom,
	includeFile: includeFileAtom,
	excludeFile: excludeFileAtom,
	fzfFile: fzfFileAtom,
	caseSensitive: caseSensitiveAtom,
	fullSearch: fullSearchAtom,
	forward: forwardAtom,
	windowSize: windowSizeAtom,
} as any


export {
	store,
	searchOptions,
	patternAtom,
	includeFileAtom,
	excludeFileAtom,
	fzfFileAtom,
	caseSensitiveAtom,
	fullSearchAtom,
	forwardAtom,
	windowSizeAtom,
	searchingAtom,
	showOptionsAtom,
	setSearching,
}