"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cn = cn;
var clsx_1 = require("clsx");
var tailwind_merge_1 = require("tailwind-merge");
/**
 * A utility function for conditionally joining CSS class names together.
 * It uses `clsx` to handle various input types and `tailwind-merge` to resolve
 * Tailwind CSS conflicts by merging conflicting classes.
 *
 * @param inputs - An array of class values, which can be strings, objects,
 *                 arrays, or `undefined`/`null` values. Falsy values are ignored.
 * @returns A single string containing the merged and de-conflicted CSS class names.
 */
function cn() {
    var inputs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        inputs[_i] = arguments[_i];
    }
    var result = (0, tailwind_merge_1.twMerge)((0, clsx_1.clsx)(inputs));
    console.log("cn('a', undefined, ['b']) result:", cn('a', undefined, ['b'])); // Temporary test snippet
    return result;
}
