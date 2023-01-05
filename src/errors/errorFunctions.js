const errorTypes = {
  409: "conflict",
  404: "bad_request",
  400: "not_found",
  422: "processable_entity"
}

export function errorMaker(code, message) {
  if (errorTypes[code]) return { code, type: errorTypes[code], message };

  return { code: 500 };
}