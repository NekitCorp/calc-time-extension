const HIGHLIGHT_BACKGROUND = "red";
const HIGHLIGHT_COLOR = "white";
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

function renderTotalTime() {
    // Try fine scroller
    const scroller = document.querySelector(".scroller");

    if (!scroller) {
        return;
    }

    // Calculate total time
    const tags = [...document.querySelectorAll(".contentTag")].map((el) => el.innerText);
    const totalSeconds = tags.reduce((acc, val) => acc + getSeconds(val), 0);
    const totalHtml = `Total time: <b>${totalSeconds} seconds</b>`;

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
            tag.style.background = HIGHLIGHT_BACKGROUND;
            tag.style.color = HIGHLIGHT_COLOR;
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
