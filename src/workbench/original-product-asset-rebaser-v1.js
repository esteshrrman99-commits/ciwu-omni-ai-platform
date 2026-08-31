'use strict';

function isExternal(value='') {
  return (
    /^https?:\/\//i.test(value) ||
    /^\/\//.test(value) ||
    /^data:/i.test(value) ||
    /^mailto:/i.test(value) ||
    /^tel:/i.test(value) ||
    /^javascript:/i.test(value) ||
    value.startsWith('#')
  );
}

function isApi(value='') {
  return (
    value.startsWith('/api/') ||
    value.startsWith('api/')
  );
}

function isAsset(value='') {
  const clean=value.split(/[?#]/)[0];

  return /\.(?:css|js|mjs|png|jpe?g|gif|webp|svg|ico|woff2?|ttf|map)$/i
    .test(clean);
}

function rebaseValue(
  value,
  prefix='/original-platform-v1/'
) {
  if (
    !value ||
    isExternal(value) ||
    isApi(value) ||
    !isAsset(value)
  ) {
    return value;
  }

  const suffix=
    value.startsWith('/')
      ? value.slice(1)
      : value.replace(/^\.\//,'');

  return prefix+suffix;
}

function rebaseHtml(
  html,
  prefix='/original-platform-v1/'
) {
  return String(html).replace(
    /\b(src|href)=("([^"]*)"|'([^']*)')/gi,
    (whole,attr,quoted,doubleValue,singleValue)=>{
      const quote=
        quoted.startsWith('"')
          ? '"'
          : "'";

      const value=
        doubleValue !== undefined
          ? doubleValue
          : singleValue;

      return (
        attr+
        '='+quote+
        rebaseValue(value,prefix)+
        quote
      );
    }
  );
}

module.exports={
  isExternal,
  isApi,
  isAsset,
  rebaseValue,
  rebaseHtml
};
