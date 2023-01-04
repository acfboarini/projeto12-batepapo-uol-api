

export function organizaMensagens(messages, user, limit = null) {
  messages = filtraMensagens(messages, user);
  messages = ordenaMensagens(messages);
  if (limit) {
    return limitaMensagens(messages, limit);
  }
  return messages;
}

function filtraMensagens(messages, user) {
  let filter_messages = [];
  messages.forEach(message => {
    if (message.to !== "Todos") {
      if (message.to === user || message.from === user) {
        filter_messages.push(message);
      }
    } else {
      filter_messages.push(message);
    }
  });
  return filter_messages;
}

function ordenaMensagens(messages) {
  return messages.sort(function (a, b) {
    if (a.time > b.time) {
      return -1;
    }
    if (a.time < b.time) {
      return 1;
    }
    return 0;
  });
}

function limitaMensagens(messages, limit) {
  const limited_messages = [];
  for (let i = 0; i < messages.length; i++) {
    if (i < limit) {
      limited_messages.push(messages[i]);
    }
  }
  return limited_messages;
}

