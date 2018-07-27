export function success(message, obj = {}) {
  obj.success = true;
  obj.message = message;
  return obj;
}

export function fail(message, obj = {}) {
  obj.success = false;
  obj.message = message;
  return obj;
}
