const DELAY = ms => new Promise(resolve => setTimeout(resolve, ms));


var _error = (message, delay, description) => {
    document.getElementById("loading").classList.add("d-none");
    var _error = document.getElementById("error");
    _error.innerText = message;
    _error.classList.remove("d-none");
    if (description) _error.setAttribute("title", description);
    if (delay) DELAY(delay).then(window.close);
};

var _inject = () => chrome.tabs.executeScript(null, {
    file: "scripts/script.js"
}, (results) => {
    if (chrome.runtime.lastError || !results || !results.length) return;
    if (results[0] !== true) chrome.tabs.insertCSS(null, {file: "styles/video.css"});
});

document.addEventListener("readystatechange", event => { 

    if (event.target.readyState === "interactive") {

        _inject();

    } else if (event.target.readyState === "complete") {

        cameras.load().then(cameras => {
            if (cameras === false) {
                _error("No cameras detected on this system!", 4000);
            } else if (cameras === null) {
                _error("It wasn't possible to find your camera.", 4000);
            } else if (cameras.length >= 1) {
                chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                    var activeTab = tabs[0];
                    if (/chrome:/i.test(activeTab.url)) {
                        _error("Unfortunately, it is not possible to overlay a camera on system pages!", 4000);
                    } else {
                        chrome.tabs.sendMessage(activeTab.id, {
                                "action": "show",
                                "multiple": cameras.length > 1
                            }, (response) => {
                                if (response) {
                                    if (response.reply) {
                                        DELAY(2500).then(window.close);
                                    } else if (response.reply === false) {
                                        _error("Permission to use Camera was not granted.", 2000);
                                    }
                                } else {
                                    _error("It wasn't possible to overlay your camera.", 10000, chrome.runtime.lastError);
                                }
                                
                            });
                    }
                    
                  });
            }
        });

    }

});