export function validatePostParticipantBody(data) {
  const { name } = data;
  if (name && name !== "") {
    return true;
  }
  return false;
}

export function validateMessageBody(data) {
  const { to, text, type } = data;

  if (!to) return false;
  if (!text) return false;
  if (type !== "private_message" && type !== "message") return false;

  return true;
}

export function validateMessageHeader(data, participants) {
  const { user } = data;
  if (!user || user == "") return false;

  const isParticipant = participants.find(participant => participant.name === user);
  return isParticipant;
}