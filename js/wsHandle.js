let currentWord, records, sentenceRecords;
let word_
// const selectedField = ["CourseID", "CourseName", "JournalEntryWeek", "StudentId", "YearQuarter", "Sentence"]

const selectedField = ["JournalEntryWeek", "StudentId", "YearQuarter", "Sentence"]

const wsPanel = {width: 1090, height: 600}

let svg = d3.select("#wsPanel").append('svg')
    .attr("width", wsPanel.width)
    .attr("height", wsPanel.height)

let wsDetail = d3.select("body").append('div')
    .style("display", "block")
    .attr("class", "m-3 mt-5")
    .attr("width", (+wsPanel.width) + "px")
    .attr("height", (+window.innerHeight - wsPanel.height) + "px")
    .attr("id", "tablediv")


queue()
    .defer(d3.csv, 'data/vis-noun-data.csv')
    .defer(d3.csv, "data/vis-word-data.csv")
    .await(loadData);

function loadData(error, records_, word__) {
    if (error) throw error;
    records = records_

    word_ = word__
    const removeList = ["%", "d", "-", "thing", "will"]
    const wordtype = ["VERB", "NOUN", "ADJ"]
    // console.log(data)

    let arr = word_.map((entry, weekIndex) => {
        let obj = {}
        let raw = JSON.parse(entry.Words.split("'").join('"'))
        let row = d3.keys(raw)
            .filter(d => !removeList.includes(d))
            .filter(d => raw[d].count != 1)
            .map(d => {
                return {
                    text: modify(d),
                    frequency: raw[d].count,
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
        if (word === "datum") {
            return "data"
        } else if (word === "r") {
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
}

function promptSelection() {
    let weekIndex = 0

    let leftPanel = d3.select("#referBox")
        .append("div")
        // .attr("class", "p-1")
        // .style("left", (wsPanel.width) + "px")
        .style("width", (window.innerWidth - wsPanel.width - 30) + "px")
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
        .attr("value", (d,i) => i)
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
        console.log(weekIndex)

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
        rec["ResponseText"]
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

function pullDataFromTextSelection(item) {
    let dataset = ((sentenceRecords
        .filter(d => d.Sentence.includes(item.text))))
    drawTable(flattenArray(dataset))
    highlightLemma(item.text, item.topic)
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
