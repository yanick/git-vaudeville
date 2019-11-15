"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hook_1 = __importDefault(require("./hook"));
test("name and type", () => {
    const hook = new hook_1.default("/foo/bar/pre-commit/flabah");
    expect(hook.name).toEqual("flabah");
    expect(hook.type).toEqual("pre-commit");
});
