export const generateConfirmationCode = ( length = 25, characters =
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'): string => {
 
  let token = '';
  for (let i = 0; i < length; i++) {
    token += characters[Math.floor(Math.random() * characters.length)];
  }
  return token;
};


export const generateRandomDateString = (): string => {
  const str = (new Date().getTime()).toString(36) + Math.random().toString(36).slice(2);
  return str;
}

export const getUniqueCode = (): string => {
 return  generateConfirmationCode(6,generateRandomDateString());
}