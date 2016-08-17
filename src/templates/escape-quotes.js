module.exports = function(str) {
  while (str && str.indexOf('"') !== -1) {
    str = str.replace('"', '&quot;');
  }
  return str;
}