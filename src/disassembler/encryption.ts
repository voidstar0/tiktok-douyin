import { readOpcode } from "./opcode";
import { fromHex } from "./util";

type DecodeOptions = {
  payload: string;
  dataLocation: number;
  stringCount: number;
  key: number;
};

export function decryptStrings({payload, dataLocation, stringCount, key}: DecodeOptions): string[] {
  let instructionPointer = dataLocation;
  const strings: string[] = [];
  for (let i = 0; i < stringCount; ++i) {
    const [opcodeLength, stringLength] = readOpcode(payload, instructionPointer);
    instructionPointer += 2 * opcodeLength;
    let stringBuffer = '';
    for(let curCharIdx = 0; curCharIdx < stringLength; ++curCharIdx) {
      const [opcodeLength, encryptedChar] = readOpcode(payload, instructionPointer);
      stringBuffer += String.fromCharCode(key ^ encryptedChar);
      instructionPointer += 2 * opcodeLength;
    }
    strings.push(stringBuffer);
  }
  return strings;
}

export function buildKey(payload: string): number {
  let key = 0;
  for (let i = 0; i < 4; i++) {
    key += (3 & fromHex(payload.slice(24 + 2 * i, 26 + 2 * i))) << 2 * i;
  }
  return key;
}