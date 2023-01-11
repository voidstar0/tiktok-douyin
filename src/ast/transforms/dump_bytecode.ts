import * as parser from "@babel/parser";
import * as t from '@babel/types';
import traverse from '@babel/traverse';
import generate from "@babel/generator";

export function dumpBytecode(ast: parser.ParseResult<t.File>) {
    traverse(ast, {
        CallExpression(path) {
          const { node } = path;
          const args = node.arguments;
          
          if (args.length != 3) return;
          
          const [bytecode, obj, undef] = args;
          
          if (!t.isStringLiteral(bytecode)) return;
          if (!t.isObjectExpression(obj)) return;
          if (!t.isUnaryExpression(undef)) return;

          console.log(bytecode.value);
        }
    })
}