let lemma

queue()
    .defer(d3.json, 'data/lemma.json')
    .await(run);

function run(error, lemma_) {
    if (error) throw error;
    lemma = lemma_
}

// function highlightLemmaSingle(selectedWord, selectedType) {
//     if (selectedWord.length < 0) return  // empty string
//
//     let lemmas = lemma[selectedWord] ? lemma[selectedWord]: [selectedWord] // get additional if dictionary isn't
//     // enough
//
//     var instance = new Mark(document.querySelector("table"));
//     instance.mark(lemmas, {
//         "wildcards": "withSpaces",
//         "ignoreJoiners": true,
//         "acrossElements": true,
//         "accuracy": {
//             "value": "exactly",
//             "limiters": [
//                 " ",
//                 ".",
//                 "\"",
//                 "'",
//                 "]",
//                 "[",
//                 "}",
//                 "{",
//                 ")",
//                 "(",
//                 "–",
//                 "-",
//                 ":",
//                 ";",
//                 "?",
//                 "!",
//                 ",",
//                 "/",
//             ]
//         },
//     });
//
//     d3.selectAll("mark")
//         .style("background", hexaChangeRGB(colorWord(selectedType), 0.4))
//         .classed("highlight", true)
//         // .html(selectedWord + '<span>' + selectedType + '</span>')
// }

function highlightLemma(selectedWord) {
    if (selectedWord.length < 0) return  // empty string

    if (document.getElementsByTagName('td').length === 1) return
    let lemmas = lemma[selectedWord] ? lemma[selectedWord] : [selectedWord] // get additional if dictionary isn't
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
        .style("background", function () {
            return hexaChangeRGB(colorWord(getTypeByText(wordQueue, superObj[this.innerHTML.split("<")[0].toLowerCase()])), 0.3)
        })
        .classed("highlight", true)
        .html(function () {
            let item = superObj[this.innerHTML.split("<")[0].toLowerCase()]
            return this.innerHTML.split("<")[0] + '<span style="color: ' + colorWord(getTypeByText(wordQueue, item)) + '">' + getTypeByText(wordQueue, item) + '</span>'
        })
}

function getTypeByText(object, value) {
    return Object.keys(object).find(key => object[key].includes(value));
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

