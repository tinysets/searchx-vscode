export interface IDocInfo {
    fileAbsPath: string
    filePath: string
    doc: string
    docLines: IDocLine[]
}

export interface IDocLine {
    oriText: string
    text: string
    line: number
    pos: number
    tokens: IToken[]
}

export interface IToken {
    text: string
    pos: number
    end: number
}

export enum KeywordType {
    Inc = 0,
    Fzf = 1,
}

export interface Keyword {
    type: KeywordType
    keyword: string
}

export interface KeywordShot {
    line: number
    pos: number
    end: number
}

export interface LineKeywordShot {
    line: number
    shots: KeywordShot[]
}

export type KeywordShotComb = KeywordShot[]

export interface KeywordShotCombExt {
    lineStart: number
    lineEnd: number
    posStart: number
    posEnd: number
    dis: number
    comb: KeywordShotComb
}

export interface WindowKeywordCombs {
    windowStart: number
    windowEnd: number
    combs: KeywordShotCombExt[]
}

export interface QueryArgs {
    dir: string
    search: string
    ignoreList: string[]
    includeList: string[]
    fzfList: string[]
    fullSearch: boolean
    caseSensitive: boolean
    forward: boolean
    windowSize: number
}

export interface QueryResultLines {
    [key: number]: string
}

export interface IIsFullSearch {
    fullSearch: boolean
}

export interface QueryResult extends IIsFullSearch {
    filePath: string
    lineStart: number
    lineEnd: number
    posStart: number
    posEnd: number
    lines: QueryResultLines
    shots: KeywordShot[]
}

export interface QueryResultFullSearch extends IIsFullSearch {
    filePath: string
    lineStart: number
    lineEnd: number
    posStart: number
    posEnd: number
    startLineText: string
    posStartAtLine: number
    posEndAtLine: number
}

