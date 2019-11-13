"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const run_1 = __importDefault(require("./run"));
test("failing hook aborts the chain", async () => {
    const spy = jest.fn();
    const vaud = {
        hooks: {
            "pre-commit": [{ run: () => Promise.reject(new Error()) }, { run: spy }]
        }
    };
    await expect(run_1.default(vaud, "pre-commit", [], { stdin: "" })).rejects.toThrow();
    expect(spy).not.toHaveBeenCalled();
});
