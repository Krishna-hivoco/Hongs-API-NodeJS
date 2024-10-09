const response = (data) => ({
  data,
  error: false,
  errormessage: "",
});
const error = (errormessage) => ({
  data: null,
  error: true,
  errormessage,
});
const responsw = {
  response,
  error,
};


export default responsw;
