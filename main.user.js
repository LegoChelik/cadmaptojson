// ==UserScript==
// @name         Get cadastral object
// @version      1.0.1
// @description  Сохраняет информацию о выбранном объекте Публичной кадастровой карты
// @author       MAZUTA
// @downloadURL  https://github.com/LegoChelik/cadmaptojson/raw/main/main.user.js
// @updateURL    https://github.com/LegoChelik/cadmaptojson/raw/main/main.user.js
// @match        https://map.nca.by/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=nca.by
// @unwrap
// ==/UserScript==

const originalFetch = window.fetch;

async function readStream(r) {
    let reader = r.getReader();
    let txt = "";

    while (true) {
        const { value, done } = await reader.read();

        if (value == null) {
            break;
        }

            txt += new TextDecoder().decode(value);
    }
    reader.releaseLock();
    return txt;
}

window.requestInterceptor = args => args;

window.responseInterceptor = response => {
    if (!response.url.includes('service=wfs')) return;
    const r = response.body;
    let t = readStream(r).then(streamData => streamData);
    return t;
};

window.fetch = async (...args) => {
    args = window.requestInterceptor(args);
    let response = await originalFetch(...args);
    let r = await window.responseInterceptor(response.clone());
    if (r) {
        var a = document.createElement("a");
        a.href = window.URL.createObjectURL(new Blob([r], {type: "text/plain"}));
        let jsoned = JSON.parse(r);
        let objectId = jsoned.features[0].properties.object_id;
        let name = objectId ? objectId : 'object';
        a.download = name+'.json';
        a.click();
    }
    return response;
};
