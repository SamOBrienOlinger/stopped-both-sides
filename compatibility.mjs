// Keep property checks available in browsers that predate Object.hasOwn.
export const hasOwn=(object,key)=>Object.prototype.hasOwnProperty.call(object,key);
