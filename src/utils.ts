export const removeUndefinedAndBlocklisted = (
  obj: any,
  blocklist: Array<string> = []
): any => {
  return typeof obj !== 'object'
    ? obj
    : Object.keys(obj).reduce((acc: any, key: string) => {
        if (blocklist.includes(key) || obj[key] == undefined) {
          return acc;
        }

        if (Array.isArray(obj[key])) {
          acc[key] = obj[key].map((v: any) => removeUndefinedAndBlocklisted(v));
          return acc;
        }

        return typeof obj[key] === 'object'
          ? ((acc[key] = removeUndefinedAndBlocklisted(obj[key], blocklist)),
            acc)
          : ((acc[key] = obj[key]), acc);
      }, {});
};
