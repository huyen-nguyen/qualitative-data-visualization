let lemma
queue()
    .defer(d3.json, 'data/lemma.json')
    .await(run);

function run(error, lemma_) {
    if (error) throw error;
    lemma = lemma_
}

function highlightLemma(selectedWord, selectedType) {
    let lemmas = lemma[selectedWord]
    if (!lemmas) return


    var instance = new Mark(document.querySelector("table"));
    instance.mark(selectedWord, {
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
                ","
            ]
        },
    });

    d3.selectAll("mark")
        .style("background", hexaChangeRGB(colorWord(selectedType), 0.4))
        .classed("highlight", true)
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

