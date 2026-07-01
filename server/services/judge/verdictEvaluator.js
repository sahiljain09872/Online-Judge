/**
 * Compare actual output to expected output.
 * Rules:
 *   1. Trim trailing whitespace from each line
 *   2. Remove trailing empty lines
 *   3. Compare line by line (case-sensitive)
 */
function compareOutput(actual, expected) {
  const sanitize = (str) => {
    if (!str) return '';
    return str
      .split('\\n')
      .map(line => line.trimEnd())
      // Remove empty lines at the end
      .join('\\n')
      .replace(/\\n+$/, '');
  };

  const actualSanitized = sanitize(actual);
  const expectedSanitized = sanitize(expected);

  return actualSanitized === expectedSanitized;
}

module.exports = {
  compareOutput
};
