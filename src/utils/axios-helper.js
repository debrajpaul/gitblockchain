import axios from "axios";
function get(url, config) {
  return axios
    .get(url, config)
    .then(r => r.data)
    .catch(e => {
      return Promise.reject(e);
    });
}
function post(url, body, config) {
  return axios
    .post(url, body)
    .then(r => r.data)
    .catch(e => {
      return Promise.reject(e);
    });
}
export default {
  get,
  post
};
