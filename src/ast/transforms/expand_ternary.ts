import { ParseResult } from "@babel/parser";
import { File, expressionStatement, blockStatement, returnStatement, ifStatement } from '@babel/types';
import traverse from '@babel/traverse';

// TODO: Fix this properly because it only handles very specific cases
// where the ternary isn't used for returns, etc..
export function expandTernary(ast: ParseResult<File>) {
    traverse(ast, {
        ConditionalExpression(path) {
          const { consequent, alternate } = path.node;

          const consequentExpStatement = expressionStatement(consequent);
          const consequentBlock = blockStatement([consequentExpStatement]);
          
          const alternateExpStatement = expressionStatement(alternate);
          const alternateBlock = blockStatement([alternateExpStatement]);
          
          path.parentPath.replaceWith(ifStatement(path.node.test, consequentBlock, alternateBlock));
          path.skip();
        }
    })
}