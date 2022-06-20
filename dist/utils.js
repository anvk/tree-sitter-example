"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripQuotesInString = exports.notEmpty = void 0;
// Function that returns true if an element is not null or undefined
function notEmpty(value) {
    return value !== null && value !== undefined;
}
exports.notEmpty = notEmpty;
// Function that will remove single and double quotes within a string
function stripQuotesInString(argText) {
    return argText.replace(/['"]+/g, '');
}
exports.stripQuotesInString = stripQuotesInString;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsb0VBQW9FO0FBQ3BFLFNBQWdCLFFBQVEsQ0FBSSxLQUEyQjtJQUNuRCxPQUFPLEtBQUssS0FBSyxJQUFJLElBQUksS0FBSyxLQUFLLFNBQVMsQ0FBQztBQUNqRCxDQUFDO0FBRkQsNEJBRUM7QUFFRCxxRUFBcUU7QUFDckUsU0FBZ0IsbUJBQW1CLENBQUMsT0FBZTtJQUMvQyxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3pDLENBQUM7QUFGRCxrREFFQyJ9