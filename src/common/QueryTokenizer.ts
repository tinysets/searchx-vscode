import { createToken, Lexer, CustomPatternMatcherReturn } from "chevrotain";

export enum QueryTokenType {
    Whitespace = 'Whitespace',
    FzfQueryWord = 'FzfQueryWord',
    ExactQueryWord = 'ExactQueryWord',
    IncludeQueryWord = 'IncludeQueryWord'
}

export class QueryTokenizer {

    private lexer: Lexer;
    constructor() {
        const WhitespaceReg = /\s+/y;
        function matchWhitespace(text: string, startOffset: number): CustomPatternMatcherReturn | null {
            let pattern = WhitespaceReg
            pattern.lastIndex = startOffset;
            const found = pattern.test(text);
            if (found === true) {
                return [text.substring(startOffset, pattern.lastIndex)];
            }
            return null;
        }

        const FzfQueryWordReg = /\S+\?(?=\s|$)/y;
        function matchFzfQueryWord(text: string, startOffset: number): CustomPatternMatcherReturn | null {
            let pattern = FzfQueryWordReg
            pattern.lastIndex = startOffset;
            const found = pattern.test(text);
            if (found === true) {
                return [text.substring(startOffset, pattern.lastIndex)];
            }
            return null;
        }

        const ExactQueryWordReg = /\S+\/(?=\s|$)/y;
        function matchExactQueryWord(text: string, startOffset: number): CustomPatternMatcherReturn | null {
            let pattern = ExactQueryWordReg
            pattern.lastIndex = startOffset;
            const found = pattern.test(text);
            if (found === true) {
                return [text.substring(startOffset, pattern.lastIndex)];
            }
            return null;
        }

        const Whitespace = createToken({
            name: QueryTokenType.Whitespace,
            // pattern: /\s+/,
            pattern: matchWhitespace,
            line_breaks: true,
        });
        const IncludeQueryWord = createToken({
            name: QueryTokenType.IncludeQueryWord,
            pattern: /\S+/
        });
        const FzfQueryWord = createToken({
            name: QueryTokenType.FzfQueryWord,
            // pattern: /\S+\?/,
            pattern: matchFzfQueryWord,
            line_breaks: false,
        });
        const ExactQueryWord = createToken({
            name: QueryTokenType.ExactQueryWord,
            // pattern: /\S+\//,
            pattern: matchExactQueryWord,
            line_breaks: false,
        });

        const allTokens = [
            Whitespace,
            FzfQueryWord,
            ExactQueryWord,
            IncludeQueryWord
        ];
        const queryLexer = new Lexer(allTokens);
        this.lexer = queryLexer;
    }

    public tokenizeOri(text: string) {
        let reslult = this.lexer.tokenize(text);
        return reslult;
    }

    public tokenize(text: string) {
        let reslult = this.lexer.tokenize(text);
        if (reslult.errors.length > 0) {
            return [];
        }
        return reslult.tokens.map(token => { return { token: token.image, type: token.tokenType.name } });
    }
}