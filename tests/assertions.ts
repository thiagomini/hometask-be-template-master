export const isSubset = (superObj: unknown, subObj: unknown): boolean => {
  if (Array.isArray(subObj) && Array.isArray(superObj)) {
    return subObj.every((ele, idx) => isSubset(superObj[idx], ele));
  }

  const sup = superObj as Record<string, unknown>;
  const sub = subObj as Record<string, unknown>;

  if (sup === sub) return true;

  return Object.keys(sub).every((ele: string) => {
    if (typeof sub[ele] == 'object') {
      return isSubset(
        sup[ele] as Record<string, unknown>,
        sub[ele] as Record<string, unknown>,
      );
    }
    return sub[ele] === sup[ele];
  });
};

export const assertMatches = (actual: unknown, expected: unknown) => {
  if (!isSubset(actual, expected))
    throw Error(
      `subObj:\n${JSON.stringify(expected)}\nis not subset of\n${JSON.stringify(actual)}`,
    );
};
