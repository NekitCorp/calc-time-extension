const HIGHLIGHT_COLOR = "#13cbd3";
const COUNTER_ID = "cte-counter";

function createObserver() {
    const observer = new MutationObserver(function (mutationsList) {
        for (const mutation of mutationsList) {
            for (const addedNode of mutation.addedNodes) {
                if (addedNode.classList && addedNode.classList.contains("innerContentContainer")) {
                    const contentTag = addedNode.querySelector(".contentTagText");

                    if (contentTag) {
                        highlight();
                        renderTotalTime();
                    }
                }
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

function getSeconds(str) {
    // Test to fit string
    const regExp = /^#(\d+(d|h|m|s))+$/;
    if (!regExp.test(str)) {
        return 0;
    }

    let totalSeconds = 0;

    const days = str.match(/(\d+)\s*d/);
    const hours = str.match(/(\d+)\s*h/);
    const minutes = str.match(/(\d+)\s*m/);
    const seconds = str.match(/(\d+)\s*s/);

    if (days) {
        totalSeconds += parseInt(days[1]) * 86400;
    }

    if (hours) {
        totalSeconds += parseInt(hours[1]) * 3600;
    }

    if (minutes) {
        totalSeconds += parseInt(minutes[1]) * 60;
    }

    if (seconds) {
        totalSeconds += parseInt(seconds[1]);
    }

    return totalSeconds;
}

function renderTotalTime() {
    // Try fine scroller
    const scroller = document.querySelector(".scroller");

    if (!scroller) {
        return;
    }

    // Calculate total time
    const tags = [...document.querySelectorAll(".contentTag")].map((el) => el.innerText);
    let totalSeconds = tags.reduce((acc, val) => acc + getSeconds(val), 0);

    const days = Math.floor(totalSeconds / 86400);
    if (days > 0) {
        totalSeconds -= days * 86400;
    }

    const hours = Math.floor(totalSeconds / 3600);
    if (hours > 0) {
        totalSeconds -= hours * 3600;
    }

    const minutes = Math.floor(totalSeconds / 60);
    if (minutes > 0) {
        totalSeconds -= minutes * 60;
    }

    const seconds = totalSeconds;

    const totalHtml =
        "Total time: <b>" +
        (days > 0 ? days + "d " : "") +
        (hours > 0 ? hours + "h " : "") +
        (minutes > 0 ? minutes + "m " : "") +
        (seconds > 0 ? seconds + "s" : "") +
        "</b>";

    // Try find already added counter
    const counter = document.getElementById(COUNTER_ID);

    if (counter) {
        counter.innerHTML = totalHtml;
    } else {
        const div = document.createElement("div");

        div.innerHTML = totalHtml;
        div.id = COUNTER_ID;
        div.style.paddingLeft = 23 + "px";

        scroller.appendChild(div);
    }
}

function highlight() {
    const tags = document.querySelectorAll(".contentTag");

    for (const tag of tags) {
        if (getSeconds(tag.innerText) > 0) {
            tag.style.outline = `1px dashed ${HIGHLIGHT_COLOR}`;
        }
    }
}

chrome.extension.sendMessage({}, function (response) {
    const readyStateCheckInterval = setInterval(function () {
        if (document.readyState === "complete") {
            clearInterval(readyStateCheckInterval);

            // ----------------------------------------------------------
            // This part of the script triggers when page is done loading
            highlight();
            renderTotalTime();

            createObserver();
            // ----------------------------------------------------------
        }
    }, 10);
});
