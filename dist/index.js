"use strict";
/**
 * Claude Code Plugin Marketplace - Entry Point
 *
 * This is the main entry point for the marketplace scaffold.
 * Currently provides basic exports for future expansion.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MARKETPLACE_INFO = exports.VERSION = void 0;
__exportStar(require("./types"), exports);
/**
 * Marketplace version
 */
exports.VERSION = '0.1.0';
/**
 * Basic marketplace info
 */
exports.MARKETPLACE_INFO = {
    name: 'my-claude-code-plugins',
    description: 'Community marketplace for Claude Code plugins',
    version: exports.VERSION,
};
//# sourceMappingURL=index.js.map