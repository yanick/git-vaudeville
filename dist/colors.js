"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
exports.default = {
    inexistent: chalk_1.default.keyword('grey'),
    dir: chalk_1.default.keyword('blue'),
    phase: chalk_1.default.green,
    script: chalk_1.default.keyword('darkblue'),
};
