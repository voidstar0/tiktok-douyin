const { readFileSync } = require('fs');

const bytecodes = readFileSync('./scripts/bytecodes.txt', 'utf-8').split('\n');

function readOpcode(bytecode, instructionPointer) {
  var opcode = parseInt(bytecode.slice(instructionPointer, instructionPointer + 2), 16);
  if (opcode >>> 7 == 0) {
    return [1, opcode];
  } else if (opcode >>> 6 == 2) {
    opcode = (63 & opcode) << 8
    return [2, opcode += parseInt(bytecode.slice(instructionPointer + 2, instructionPointer + 4), 16)]
  } else {
    opcode = (63 & opcode) << 16;
    return [3, opcode += parseInt(bytecode.slice(instructionPointer + 2, instructionPointer + 6), 16)]
  }
}

function printStrings(bytecode) {
  console.log(bytecode);
  let key = 0;
  for (let i = 0; i < 4; ++i) {
    const lastTwoBits = 3 & parseInt(bytecode.slice(24 + 2 * i, 26 + 2 * i), 16)
    key += lastTwoBits << 2 * i;
  }
  var _0x3457df = 1860;
  var counter = 0;
  var _0x192127 = 2 * parseInt(bytecode.slice(48, 56), 16);
  // strings loop
  var _0xb73a84 = _0x192127 + 56,
          _0x7bc90b = parseInt(bytecode.slice(_0xb73a84, _0xb73a84 + 4), 16);
  
  for (_0xb73a84 += 4, _0x4d05d5 = 0; _0x4d05d5 < _0x7bc90b; ++_0x4d05d5) {
    var _0x300f0b = readOpcode(bytecode, _0xb73a84);
    _0xb73a84 += 2 * _0x300f0b[0];
  
    for (var _0x16dd23 = '', _0x3aa0ce = 0; _0x3aa0ce < _0x300f0b[1]; ++_0x3aa0ce) {
      var _0x2bc2f9 = readOpcode(bytecode, _0xb73a84);
  
      _0x16dd23 += String.fromCharCode(key ^ _0x2bc2f9[1]), _0xb73a84 += 2 * _0x2bc2f9[0];
    }
  
    console.log(_0x16dd23, _0x4d05d5);
  }
}

bytecodes.forEach(b => printStrings(b));