const urlParams = new URLSearchParams(window.location.search);

export const isInDebug = urlParams.get('debug') === "true";

document.getElementById("toggle-debug-link")!
    .setAttribute("href", `?debug=${(!isInDebug).toString()}`);
