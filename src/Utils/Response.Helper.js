function success(data, promiseId) {
  return { success: data === undefined ? {} : data, promiseId: promiseId };
}

function error(code, message, promiseId) {
  return { error: { code: code, message: message }, promiseId: promiseId };
}

module.exports = { success, error };
