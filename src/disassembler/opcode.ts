import { Stack } from "./stack";
import { fromHex } from "./util";

export function readOpcode(bytecode: string, instructionPointer: number) {
  var opcode = fromHex(bytecode.slice(instructionPointer, instructionPointer + 2));
  if (opcode >>> 7 == 0) {
    return [1, opcode];
  } else if (opcode >>> 6 == 2) {
    opcode = (63 & opcode) << 8
    return [2, opcode += fromHex(bytecode.slice(instructionPointer + 2, instructionPointer + 4))]
  } else {
    opcode = (63 & opcode) << 16;
    return [3, opcode += fromHex(bytecode.slice(instructionPointer + 2, instructionPointer + 6))]
  }
}

export class Opcode {
  mnemonic: string;
  code: number[];
  operandCount: number;
  callback: (stack: Stack, ...args: unknown[]) => void;

  constructor(mnemonic: string, code: number[], callback: (stack: Stack, ...args: unknown[]) => void) {
    this.mnemonic = mnemonic;
    this.code = code;
    this.operandCount = callback.length - 1;
    this.callback = callback;
  }
}

// TODO: Implement all the opcodes & come up with better mnemonics for them
export const opcodes: Opcode[] = [
  new Opcode("LOAD32", [5], (stack, byte1, byte2, byte3, byte4) => {
    let value = (byte1 as number << 8);
    value += byte2 as number << 8;
    value += byte3 as number << 8;
    value += byte4 as number;
    stack.push(value);
    console.log("LOAD32", value);
  }),
  new Opcode("STORE_SUBROUTINE", [59], (stack, operand1) => {
    const ip = operand1;
    console.log("STORE_SUBROUTINE", ip);
  }),
  new Opcode("UNKNOWN_20", [20], (stack, operand1) => {
    console.log("UNKNOWN_20", operand1);
  }),
  new Opcode("BIPUSH", [3], (stack, operand1) => {
    console.log("BIPUSH", operand1 as number << 24 >> 24);
  }),
  new Opcode("ACONST_UNDEFINED", [8, 9, 10], (stack) => {
    console.log("ACONST_UNDEFINED");
  }),
  new Opcode("ACONST_UNDEFINED", [13], (stack) => {
    console.log("NEW_OBJECT");
  }),
  new Opcode("LOAD", [22], (stack, property, object, value) => {
      console.log("LOAD", property, object, value);
  }),
  new Opcode("ADD", [24], (stack) => {
    console.log("ADD");
  }),
  new Opcode("SUB", [25], (stack) => {
    console.log("SUB");
  }),
  new Opcode("MUL", [26], (stack) => {
    console.log("MUL");
  }),
  new Opcode("DIV", [27], (stack) => {
    console.log("DIV");
  }),
  new Opcode("MOD", [28], (stack) => {
    console.log("MOD");
  }),
  new Opcode("NEG", [29, 30, 31], (stack) => {
    console.log("NEG");
  }),
];

export function findOpcode(opcode: number) {
  return opcodes.find((op) => op.code.find(op => op === opcode));
}