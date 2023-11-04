"use strict";

const toRelativeURL = (input) => {
  try {
    const url = new URL(input);
    const relativePathWithQueryParams = url.pathname + url.search;
    return relativePathWithQueryParams;
  } catch (error) {
    return "/";
  }
};

const urlParams = new URLSearchParams(window.location.search);
const originUrl = urlParams.get('originUrl');

if (originUrl) {
  const relativeURL = toRelativeURL(originUrl);
  window.location.assign(relativeURL);
}

