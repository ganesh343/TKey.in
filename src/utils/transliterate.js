import Sanscript from "sanscript";

export const transliterateToTelugu = (input) => {
  if (!input) return "";
  try {
    return Sanscript.t(input, "itrans", "telugu");
  } catch (error) {
    return input;
  }
};
