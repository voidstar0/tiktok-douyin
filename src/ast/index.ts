import generate from '@babel/generator';
import { parse } from "@babel/parser";
import { readFileSync, writeFileSync } from 'fs';
import { collapseBinaryExpressions, convertPropertyToDot, dumpBytecode, dumpStrings, expandTernary } from "./transforms";

const code = readFileSync('YOUR_INPUT_SCRIPT.js', 'utf-8');

function deobfuscate(code: string) {
    // parse code and get ast
    const ast = parse(code);
    
    // ast transformations
    // dumpBytecode(ast);
    // convertPropertyToDot(ast);
    // collapseBinaryExpressions(ast);
    expandTernary(ast);
    // dumpStrings(ast);
    // save output to file
    writeFileSync('YOUR_OUTPUT_SCRIPT.js', generate(ast).code);
}

deobfuscate(code);