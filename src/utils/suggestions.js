const SUGGEST_ENDPOINT = "https://inputtools.google.com/request";

export const fetchTeluguSuggestions = async (romanText, signal) => {
  if (!romanText) return [];
  const query = new URLSearchParams({
    text: romanText,
    itc: "te-t-i0-und",
  });
  const response = await fetch(`${SUGGEST_ENDPOINT}?${query.toString()}`, {
    method: "GET",
    signal,
  });
  if (!response.ok) {
    throw new Error("Suggestion request failed");
  }
  const data = await response.json();
  if (!Array.isArray(data) || data[0] !== "SUCCESS") return [];
  const payload = data[1]?.[0];
  const suggestions = Array.isArray(payload?.[1]) ? payload[1] : [];
  return suggestions.filter(Boolean);
};
