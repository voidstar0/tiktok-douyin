import { buildKey, decryptStrings } from "./encryption";
import { MAGIC_1, MAGIC_2 } from "./magic";
import { fromHex } from "./util";
import { findOpcode } from "./opcode";
import { Stack } from "./stack";

function loadProgram(program: string, instructionPointer: number): number[] {
  const bytecode: number[] = [];
  for (let i = 56; i < instructionPointer + 56; i += 2) {
    bytecode.push(fromHex(program.slice(i, i + 2)));
  }
  return bytecode;
}

class VirtualMachine {
  #payload: string;
  #program: number[] = [];
  #instructionPointer: number = -1;
  #stack: Stack;
  #key: number = 0;

  constructor(payload: string) {
    this.#payload = payload;
    this.#stack = new Stack();
  }

  *decodeOpcodes(program: number[]) {
    while (this.#instructionPointer <= program.length) {
      yield program[this.#instructionPointer++];
    }
  }

  decodeOpcode(opcode: number) {
    const op = findOpcode(opcode);
    if (!op) {
      throw new Error("invalid opcode: " + opcode);
    }

    const operands: unknown[] = [];
    for (let i = 0; i < op.operandCount; i++) {
      operands.push(this.decodeOpcodes(this.#program).next().value);
    }
    op.callback(this.#stack, ...operands);
  }

  run() {
    const magicValue1 = fromHex(this.#payload.slice(0, 8));
    const magicValue2 = fromHex(this.#payload.slice(8, 16));

    if (magicValue1 != MAGIC_1 || magicValue2 != MAGIC_2)
      throw new Error("bad bytecode: magic values not found");

    if (fromHex(this.#payload.slice(16, 18)) !== 0)
      throw new Error("bad bytecode: no separator found after magic values");

    this.#key = buildKey(this.#payload);
    const codeStartLocation = fromHex(this.#payload.slice(32, 40));
    this.#instructionPointer = 2 * fromHex(this.#payload.slice(48, 56));
    const stringDataLocation = this.#instructionPointer + 56;
    const stringCount = fromHex(this.#payload.slice(stringDataLocation, stringDataLocation + 4));
    const strings = decryptStrings({
      payload: this.#payload,
      dataLocation: stringDataLocation + 4,
      stringCount,
      key: this.#key
    });

    console.log(strings);

    this.#program = loadProgram(this.#payload, this.#instructionPointer);
    this.#instructionPointer = codeStartLocation;
    let gen = this.decodeOpcodes(this.#program);
    let nextVal = gen.next().value;
    while (nextVal) {
      this.decodeOpcode(nextVal);
      nextVal = gen.next().value;
    }
  }
}

// const program = process.argv[2];
const program = "484e4f4a403f5243000f0d08f22f8ed8000001a0b4f524b3000001bb11010103002547007803011d14010111020907000007000144021400011102001200024a12000343001400021100024a12000411000143011400031100034700403e0004140005413d00361100030300134a12000507000607000743024a1200050700080700074302140004021102011100044301035b2a470005030114010141110101030125470002004201420211010243004700020842030103062b1400021102071200091100020300292e4700090011000115000a084211020244001400031102034a12000b11000307000c0d050000017d3c000e000d4303491102044a12000e07000f11000343024911020533000611020512001033000911020512001012001147001f0011000115000a11020712000911000112000a03062b2f110207070009354902110206430047004b110205330023110205120012110205120013190364293400101102051200141102051200151903642947001f0011000115000a11020712000911000112000a03062b2f110207070009354908420011020115000a11040712000911020112000a03062b2f11040707000935490700074205000000003b00140002050000008e3b011401080300140001084200160d4d465c41434b7201724a057200024947095b5d4b5c6f494b405a0b5a416241594b5c6d4f5d4b05434f5a4d46075c4b5e424f4d4b074d465c41434b01000100074b40584d414a4b084a4b4c5b49494b5c0e4a4b4847404b7e5c415e4b5c5a5702474a03494b5a0447404841020b4d074d41405d41424b0748475c4b4c5b490a415b5a4b5c79474a5a460a4740404b5c79474a5a460b415b5a4b5c664b4749465a0b4740404b5c664b4749465a";
const vm = new VirtualMachine(program);
vm.run();