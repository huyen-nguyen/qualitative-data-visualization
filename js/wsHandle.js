let records, word_
// const selectedField = ["CourseID", "CourseName", "JournalEntryWeek", "StudentId", "YearQuarter", "Sentence"]
const removeList = ["%", "d", "-", "thing", "will"]
const wsPanel = {width: (window.innerWidth * 2/3), height: 600}
const selectedField = ["JournalEntryWeek", "StudentId", "YearQuarter", "Sentence"]

queue()
    .defer(d3.csv, 'data/vis-noun-data.csv')
    .defer(d3.csv, "data/vis-word-data.csv")
    .await(loadData);

function loadData(error, records_, word__) {
    if (error) throw error;
    records = records_
    word_ = word__

    let svg = d3.select("#wsPanel").append('svg')
        .attr("width", wsPanel.width)
        .attr("height", wsPanel.height)

    d3.select("body").append('div')
        .style("display", "block")
        .attr("class", "m-3")
        // .attr("width", (+wsPanel.width) + "px")
        .attr("height", (+window.innerHeight - wsPanel.height) + "px")
        .attr("id", "tablediv")

    let arr = word_.map((entry, weekIndex) => {
        let obj = {}
        let raw = JSON.parse(entry.Words.split("'").join('"'))
        let row = d3.keys(raw).filter(d => d !== "datum")
            .filter(d => !removeList.includes(d))
            // .filter(d => raw[d].count > 1)
            .map(d => {
                return {
                    text: modify(d),
                    frequency: d !== "data" ? raw[d].count : raw["data"].count + raw["datum"].count,
                    type: raw[d].type,
                }
            })
            .sort((a, b) => +b.frequency - +a.frequency)

        wordtype.forEach(type => {
            obj[type] = []
            obj[type] = row.filter(d => d.type === type).map(d => {
                return {
                    text: d.text,
                    frequency: d.frequency,
                    topic: type,
                    id: d.text + weekIndex,
                }
            })
        })

        return {
            date: "Week " + entry.JournalEntryWeek,
            words: obj,
        }
    });

    function modify(word) {
        if (word === "r") {
            return "R"
        } else return word
    }

    let config = {
        topWord: 40,
        minFont: 11,
        maxFont: 40,
        tickFont: 12,
        legendFont: 12,
        curve: d3.curveMonotoneX
    };

    promptSelection()
    wordstream(svg, arr, config)
    sentenceRecords = expandSentence(records)
    drawTable(flattenArray(sentenceRecords))
}

function promptSelection() {
    let weekIndex = 0

    let leftPanel = d3.select("#referBox")
        .append("div")
        .attr("class", "pr-2")
        // .style("width", (window.innerWidth - wsPanel.width - 30) + "px")
        .attr("id", "leftWrapper2")

    let dropdown = leftPanel
        .insert("select", "svg")
        .attr("id", "single")
        .style("display", "block")
        .style("float", "left")
        .on("change", dropdownChange)

    dropdown.selectAll("option")
        .data(word_)
        .enter()
        .append("option")
        .attr("class", "option")
        .attr("value", (d, i) => i)
        .html(d => "Week " + d.JournalEntryWeek)

    new SlimSelect({
        select: '#single',
    });

    // set init value

    let promptContent = leftPanel
        .append("div")
        .attr("id", "promptContent")
        .html(displayHTML(word_[weekIndex].PromptText))

    // Handler for dropdown value change
    function dropdownChange() {
        weekIndex = d3.select(this).property('value')

        promptContent
            .html(displayHTML(word_[+weekIndex].PromptText))

    }

    function displayHTML(string) {
        return string.replace(/\n/g, '<br>')
    }
}

function expandSentence(records) {
    let arr = [];
    records.forEach(rec => {
        rec["ResponseOnly"]
            .match(/.*?[.!?](\s+|$)/g).map(d => d.trim())
            .forEach(d => {
                let temp = (({CourseID, CourseName, JournalEntryWeek, PromptText, StudentId, YearQuarter}) =>
                    ({CourseID, CourseName, JournalEntryWeek, PromptText, StudentId, YearQuarter}))(rec)
                temp.Sentence = d
                arr.push(temp)
            })
    })
    return arr
}

function pullDataFromTextSelection() {
    // use wordQueue
    // don't know if "queue" is the right word for it
    let values = Object.values(wordQueue)
    if (values.some(d => d.length > 0)) {
        // something in the queue
        let superArray = values.filter(d => d.length > 0).map(d => lemma[d] ? lemma[d] : [d.toLowerCase()])

        values.filter(d => d.length > 0).forEach(d => {
            let lemmaflat = lemma[d] ? lemma[d] : [d.toLowerCase()]
            lemmaflat.forEach(l => {
                superObj[l] = d;
            })
        })

        let dataset = ((sentenceRecords
            .filter(d => {
                let wordArr = d.Sentence.toLowerCase().split(/[.,\/ -:;!?"'#$%^&*]/).filter(d => d.length > 0)
                return superArray.every(lemmas => wordArr.filter(d => lemmas.includes(d)).length > 0)
            })))

        drawTable(flattenArray(dataset))
        d3.keys(wordQueue).filter(d => !!wordQueue[d]).forEach(item => {
            highlightLemma(wordQueue[item], item)
        })

    } else {
        // no selection
        drawTable(flattenArray(sentenceRecords))
    }
}


// function highlightLemma(selectedWord) {
//     if (selectedWord.length < 0) return  // empty string
//
//     if (document.getElementsByTagName('td').length === 1) return
//     let lemmas = lemma[selectedWord] ? lemma[selectedWord] : [selectedWord] // get additional if dictionary isn't
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
//         .style("background", function () {
//             return hexaChangeRGB(colorWord(getTypeByText(wordQueue, superObj[this.innerHTML.split("<")[0].toLowerCase()])), 0.3)
//         })
//         .classed("highlight", true)
//         .html(function () {
//             return this.innerHTML.split("<")[0] + '<span style="color: ' + colorWord(getTypeByText(wordQueue, superObj[this.innerHTML.split("<")[0].toLowerCase()])) + '">' + getTypeByText(wordQueue, superObj[this.innerHTML.split("<")[0].toLowerCase()]) + '</span>'
//             // return this.innerHTML.split("<")[0] + '<span>' + getTypeByText(wordQueue,superObj[this.innerHTML.split("<")[0].toLowerCase()]) + '</span>'
//
//         })
//
//     // .html(selectedWord + '<span>' + selectedType + '</span>')
// }

function drawTable(dataset) {
    let tablediv = d3.select('#tablediv');
    tablediv.selectAll('*').remove();

    let table = tablediv
        .append('table')
        .attr("class", "display");

    $(table.node()).DataTable({
        data: dataset,
        columns: title(selectedField),
        "pageLength": 25,
        "deferRender": true,
    });

}

function flattenArray(arrayofobj) {
    let arr = [];
    arrayofobj.forEach(d => {
        let itemArr = [];
        selectedField.forEach(f => {
            itemArr.push(d[f])
        })
        arr.push(itemArr)
    })
    return arr;
}

function title() {
    return selectedField.map(d => {
        return {
            title: d === "StudentId" ? "Student#" : d
        }
    })
}
