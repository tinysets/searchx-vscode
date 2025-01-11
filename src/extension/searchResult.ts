import { DisplayFileResult, DisplayResult, SearchQuery, WithId } from '../common/types'

function byFilePath(a: DisplayFileResult, b: DisplayFileResult) {
	return a.filePath.localeCompare(b.filePath)
}

class DisplayResults {
	query: WithId<SearchQuery> = null!;
	groupsMap = new Map<string, DisplayFileResult>()
	groupsArr: DisplayFileResult[] = []
	constructor(query: WithId<SearchQuery>) {
		this.query = query
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
	}
	clear() {
		this.groupsMap.clear()
		this.syncToArr()
	}

	dismissOneFile(fileAbsPath: string) {
		const groups = this.groupsMap
		groups.delete(fileAbsPath)
		this.syncToArr()
	}

	dismissOneMatch(fileAbsPath: string, matchIndex: number) {
		const groups = this.groupsMap
		const group = groups.get(fileAbsPath)
		if (!group) {
			return
		}
		let results = group.results;
		if (matchIndex >= 0 && matchIndex < results.length)
			results.splice(matchIndex, 1)
		if (results.length === 0) {
			this.dismissOneFile(fileAbsPath)
		} else {
			this.syncToArr()
		}
	}
}


let cacheResults: DisplayResults;
export function onSearchResult(query: WithId<SearchQuery>, displayResults: DisplayResult[]) {
	if (!cacheResults || cacheResults.query.id !== query.id) {
		cacheResults = new DisplayResults(query);
	}
	cacheResults.add(displayResults)
}
