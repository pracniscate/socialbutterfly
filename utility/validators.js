// determine if the string is empty
const isEmpty = string => {
  if (string.trim() === "") return true;
  else return false;
};

// check if email is valid
const isEmail = email => {
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(regEx)) return true;
  else return false;
};

exports.validateSignupData = data => {
  let errors = {};

  // if email is blank
  if (isEmpty(data.email)) {
    errors.email = "must not be empty";
  } else if (!isEmail(data.email)) {
    errors.email = "must be a valid address";
  }

  // if password is blank
  if (isEmpty(data.password)) errors.password = "must not be empty";
  // do passwords match?
  if (data.password !== data.confirmPassword)
    errors.confirmPassword = "passwords must match";
  // if handle is blank
  if (isEmpty(data.handle)) errors.handle = "must not be empty";

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  };
};

exports.validateLoginData = data => {
  let errors = {};

  if (isEmpty(user.email)) errors.email = "must not be empty";
  if (isEmpty(user.password)) errors.password = "must not be empty";

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  };
};
