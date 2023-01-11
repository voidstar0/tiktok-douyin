/**
 * TODO: Change this later. This class is meant to represent the VM's stack.
 * It's not meant to be a generic stack. It's just a placeholder for now.
 */
export class Stack {
  stack: unknown[];
  constructor() {
    this.stack = [];
  }
  push(value: unknown) {
    this.stack.push(value);
  }
  pop() {
    return this.stack.pop();
  }
  peek() {
    return this.stack[this.stack.length - 1];
  }
  get length() {
    return this.stack.length;
  }
  get(index: number) {
    return this.stack[index];
  }
  set(index: number, value: unknown) {
    this.stack[index] = value;
  }
  clear() {
    this.stack = [];
  }
  toString() {
    return this.stack.toString();
  }
}