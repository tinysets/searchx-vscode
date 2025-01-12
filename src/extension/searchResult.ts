import { DisplayFileResult, DisplayResult, SearchQuery, WithId } from '../common/types'
import { onSearchResultChanged } from './callbacks';

function byFilePath(a: DisplayFileResult, b: DisplayFileResult) {
	return a.filePath.localeCompare(b.filePath)
}

class DisplayResults {
	id: number = -1;
	groupsMap = new Map<string, DisplayFileResult>()
	groupsArr: DisplayFileResult[] = []
	constructor(id: number) {
		this.id = id
	}

	private syncToArr() {
		const groups = this.groupsMap
		this.groupsArr = [...groups.values()].sort(byFilePath)
	}

	add(displayResults: DisplayResult[]) {
		const groups = this.groupsMap
		for (const match of displayResults) {
			if (!groups.has(match.fileAbsPath)) {
				groups.set(match.fileAbsPath, {
					fileAbsPath: match.fileAbsPath,
					filePath: match.filePath,
					language: match.language,
					expanded: true,
					results: []
				})
			}
			groups.get(match.fileAbsPath)!.results.push(match)
		}
		this.syncToArr()
		onSearchResultChanged()
	}

	clear() {
		this.groupsMap.clear()
		this.syncToArr()
		onSearchResultChanged()
	}

	dismissOneFile(fileAbsPath: string) {
		const groups = this.groupsMap
		groups.delete(fileAbsPath)
		this.syncToArr()
		onSearchResultChanged()
	}

	dismissOneMatch(fileAbsPath: string, uid: number) {
		const groups = this.groupsMap
		const group = groups.get(fileAbsPath)
		if (!group) {
			return
		}
		let results = group.results;
		let matchIndex = group.results.findIndex(r => r.uid === uid);
		if (matchIndex >= 0 && matchIndex < results.length)
			results.splice(matchIndex, 1)
		if (results.length === 0) {
			this.dismissOneFile(fileAbsPath)
		} else {
			this.syncToArr()
			onSearchResultChanged()
		}
	}
}


export let cacheResults: DisplayResults;
export function onSearchResult(query: WithId<SearchQuery>, displayResults: DisplayResult[]) {
	if (!cacheResults || cacheResults.id !== query.id) {
		cacheResults = new DisplayResults(query.id);
	}
	cacheResults.add(displayResults)
}
