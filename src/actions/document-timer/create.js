export default function setTime(counter) {
  return {
    type: 'DOCUMENT_TIMER', counter,
  };
}
