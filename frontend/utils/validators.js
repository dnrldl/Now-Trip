// 이메일 검증
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) ? '' : '올바른 이메일을 입력해주세요.';
};

// 비밀번호 검증
export const validatePassword = (password) => {
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[~!@#$%^&*()+|=])[A-Za-z\d~!@#$%^&*()+|=]{7,16}$/;
  return passwordRegex.test(password)
    ? ''
    : '비밀번호는 영문, 숫자, 특수문자를 포함한 7~16자여야 합니다.';
};

// 이름 검증
export const validateName = (name) => {
  const nameRegex = /^[a-zA-Z가-힣\s]{2,15}$/;
  return nameRegex.test(name)
    ? ''
    : '이름은 영문, 한글, 공백 포함 2글자부터 15글자까지 가능합니다.';
};

// 닉네임 검증
export const validateNickname = (nickname) => {
  const nicknameRegex = /^[a-zA-Z가-힣\s]{2,15}$/;
  return nicknameRegex.test(nickname)
    ? ''
    : '닉네임은 영문, 한글, 공백 포함 2글자부터 15글자까지 가능합니다.';
};

// 전화번호 검증
export const validatePhoneNumber = (phoneNumber) => {
  const phoneRegex =
    /^(?:\+82-?1[0-9]{1}-?[0-9]{3,4}-?[0-9]{4}|0[1-9]{1}[0-9]{1}-?[0-9]{3,4}-?[0-9]{4})$/;
  return phoneRegex.test(phoneNumber) ? '' : '정확한 전화번호를 입력해주세요.';
};

// 전체 입력값 검증
export const validateInputs = (userData) => {
  const { email, password, name, nickname, phoneNumber } = userData;

  const emailError = validateEmail(email);
  if (emailError) return { isValid: false, message: emailError };

  const passwordError = validatePassword(password);
  if (passwordError) return { isValid: false, message: passwordError };

  const nameError = validateName(name);
  if (nameError) return { isValid: false, message: nameError };

  const nicknameError = validateNickname(nickname);
  if (nicknameError) return { isValid: false, message: nicknameError };

  const phoneError = validatePhoneNumber(phoneNumber);
  if (phoneError) return { isValid: false, message: phoneError };

  return { isValid: true, message: '' };
};
