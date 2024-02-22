const urlParams = new URLSearchParams(window.location.search);

export const isInDebug = urlParams.get('debug') === "true";
const slug = urlParams.get('slug');

document.getElementById("toggle-debug-link")!
    .setAttribute("href", `?debug=${(!isInDebug).toString()}&slug=${slug}`);
