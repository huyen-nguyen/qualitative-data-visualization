let lemma

queue()
    .defer(d3.json, 'data/lemma.json')
    .await(run);

function run(error, lemma_) {
    if (error) throw error;
    lemma = lemma_
}

function highlightLemma(selectedWord, selectedType) {
    if (selectedWord.length < 0) return  // empty string

    let lemmas = lemma[selectedWord] ? lemma[selectedWord]: [selectedWord] // get additional if dictionary isn't
    // enough

    var instance = new Mark(document.querySelector("table"));
    instance.mark(lemmas, {
        "wildcards": "withSpaces",
        "ignoreJoiners": true,
        "acrossElements": true,
        "accuracy": {
            "value": "exactly",
            "limiters": [
                " ",
                ".",
                "\"",
                "'",
                "]",
                "[",
                "}",
                "{",
                ")",
                "(",
                "–",
                "-",
                ":",
                ";",
                "?",
                "!",
                ",",
                "/",
            ]
        },
    });

    d3.selectAll("mark")
        .style("background", hexaChangeRGB(colorWord(selectedType), 0.4))
        .classed("highlight", true)
        // .html(selectedWord + '<span>' + selectedType + '</span>')
}
function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}
function hexaChangeRGB(hex, alpha) {
    var r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);

    if (alpha) {
        return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
    } else {
        return "rgb(" + r + ", " + g + ", " + b + ")";
    }
}

