function toHttpError(error) {
  const message = error instanceof Error ? error.message : 'Internal error';
  return { error: message };
}

module.exports = { toHttpError };
