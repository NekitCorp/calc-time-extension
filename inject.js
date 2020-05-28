function createObserver() {
    const observer = new MutationObserver(function (mutationsList) {
        for (const mutation of mutationsList) {
            for (const addedNode of mutation.addedNodes) {
                if (addedNode.classList && addedNode.classList.contains("innerContentContainer")) {
                    const contentTag = addedNode.querySelector(".contentTagText");

                    if (contentTag) {
                        console.log(contentTag.innerText);
                        getTotalTime();
                    }
                }
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

function getSeconds(str) {
    let seconds = 0;
    const days = str.match(/(\d+)\s*d/);
    const hours = str.match(/(\d+)\s*h/);
    const minutes = str.match(/(\d+)\s*m/);

    if (days) {
        seconds += parseInt(days[1]) * 86400;
    }

    if (hours) {
        seconds += parseInt(hours[1]) * 3600;
    }

    if (minutes) {
        seconds += parseInt(minutes[1]) * 60;
    }

    return seconds;
}

function getTotalTime() {
    const tags = [...document.querySelectorAll(".contentTagText")].map((el) => el.innerText);
    return tags.reduce((acc, val) => acc + getSeconds(val), 0);
}

chrome.extension.sendMessage({}, function (response) {
    const readyStateCheckInterval = setInterval(function () {
        if (document.readyState === "complete") {
            clearInterval(readyStateCheckInterval);

            // ----------------------------------------------------------
            // This part of the script triggers when page is done loading
            createObserver();
            // ----------------------------------------------------------
        }
    }, 10);
});
