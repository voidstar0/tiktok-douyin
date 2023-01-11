import { ParseResult } from "@babel/parser";
import { File, isIdentifier, isObjectExpression, isStringLiteral, isUnaryExpression } from '@babel/types';
import traverse from '@babel/traverse';


const MAGIC_1 = 1213091658;
const MAGIC_2 = 1077891651;

function toBase10(base16Str: string) {
  return parseInt(base16Str, 16);
}

function buildKey(bytecode: string) {
  let key = 0;
  for (let i = 0; i < 4; i++) {
    key += (3 & toBase10(bytecode.slice(24 + 2 * i, 26 + 2 * i))) << 2 * i;
  }
  return key;
}

function readOpcode(bytecode: string, instructionPointer: number) {
  var opcode = toBase10(bytecode.slice(instructionPointer, instructionPointer + 2));
  if (opcode >>> 7 == 0) {
    return [1, opcode];
  } else if (opcode >>> 6 == 2) {
    opcode = (63 & opcode) << 8
    return [2, opcode += toBase10(bytecode.slice(instructionPointer + 2, instructionPointer + 4))]
  } else {
    opcode = (63 & opcode) << 16;
    return [3, opcode += toBase10(bytecode.slice(instructionPointer + 2, instructionPointer + 6))]
  }
}

function getStringsDecoded(bytecode: string, stringDataLocation: number, stringCount: number, key: number): string[] {
  let instructionPointer = stringDataLocation;
  const strings: string[] = [];
  for (let i = 0; i < stringCount; ++i) {
    const [opcodeLength, stringLength] = readOpcode(bytecode, instructionPointer);
    instructionPointer += 2 * opcodeLength;
    let stringBuffer = '';
    for(let curCharIdx = 0; curCharIdx < stringLength; ++curCharIdx) {
      const [opcodeLength, encryptedChar] = readOpcode(bytecode, instructionPointer);
      stringBuffer += String.fromCharCode(key ^ encryptedChar);
      instructionPointer += 2 * opcodeLength;
    }
    strings.push(stringBuffer);
  }
  return strings;
}

function run(bytecode: string) {
  const magicValue1 = toBase10(bytecode.slice(0, 8));
  const magicValue2 = toBase10(bytecode.slice(8, 16));

  if (magicValue1 != MAGIC_1 || magicValue2 != MAGIC_2)
    throw new Error("bad bytecode: magic values not found");
  
  if (toBase10(bytecode.slice(16, 18)) !== 0)
    throw new Error("bad bytecode: no separator found after magic values");

  const key = buildKey(bytecode);
  const instructionPointer = 2 * toBase10(bytecode.slice(48, 56));
  const stringDataLocation = instructionPointer + 56;
  const stringCount = toBase10(bytecode.slice(stringDataLocation, stringDataLocation + 4));
  const strings = getStringsDecoded(bytecode, stringDataLocation + 4, stringCount, key);
  console.dir(strings, {'maxArrayLength': null});
}

export function dumpStrings(ast: ParseResult<File>) {
    traverse(ast, {
        CallExpression(path) {
          if (!isIdentifier(path.node.callee)) return;
          if (path.node.arguments.length !== 3) return;
          if (!isStringLiteral(path.node.arguments[0])) return;
          if (!isObjectExpression(path.node.arguments[1])) return;
          if (!isUnaryExpression(path.node.arguments[2])) return;

          const bytecode = path.node.arguments[0].value;
          console.log(bytecode);
          run(bytecode);
          console.log();
        }
    })
}