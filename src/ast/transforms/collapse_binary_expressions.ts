import { ParseResult } from "@babel/parser";
import { File, numericLiteral } from '@babel/types';
import traverse from '@babel/traverse';

// 0x18e9 + 0x1 * 0x89c + -0x2185 * 0x1 -> 0
// TODO: This fails is BinaryExpression is a StringLiteral (e.g. "a" + "b") so we need to check for that
export function collapseBinaryExpressions(ast: ParseResult<File>) {
    traverse(ast, {
        BinaryExpression(path) {
            const { confident, value } = path.evaluate();
            if(!confident) return;

            path.replaceWith(numericLiteral(value));
        }
    })
}