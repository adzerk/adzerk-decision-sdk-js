export const removeUndefinedAndBlocklisted = (
  obj: any,
  blocklist: Array<string> = []
): any => {
  Object.keys(obj).reduce((acc: any, key: string) => {
    if (blocklist.includes(key)) {
      return acc;
    }
    if (obj[key] == undefined) {
      return acc;
    }
    return typeof obj[key] === 'object' && !Array.isArray(obj[key])
      ? ((acc[key] = removeUndefinedAndBlocklisted(obj[key], blocklist)), acc)
      : ((acc[key] = obj[key]), acc);
  }, {});
};
