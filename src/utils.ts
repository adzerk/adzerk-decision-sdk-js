export const removeUndefinedAndBlocklisted = (
  obj: any,
  blocklist: Array<string> = []
): any => {
  if (Array.isArray(obj)) {
    return obj.map(o => removeUndefinedAndBlocklisted(o));
  }

  return typeof obj !== 'object'
    ? obj
    : Object.keys(obj).reduce((acc: any, key: string) => {
        if (blocklist.includes(key) || obj[key] == undefined) {
          return acc;
        }

        return typeof obj[key] === 'object'
          ? ((acc[key] = removeUndefinedAndBlocklisted(obj[key], blocklist)),
            acc)
          : ((acc[key] = obj[key]), acc);
      }, {});
};
