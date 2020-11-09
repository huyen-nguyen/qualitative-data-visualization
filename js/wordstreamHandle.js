let currentWord, lemma, records, sentenceRecords;

const selectedField = ["CourseID", "CourseName", "JournalEntryWeek", "StudentId", "YearQuarter", "sentence"]

const wsPanel = {width: 1100, height: 600}

let svg = d3.select("body").append('svg')
    .attr("width", wsPanel.width)
    .attr("height", wsPanel.height)

let wsDetail = d3.select("body").append('div')
    .style("display", "block")
    .attr("class", "m-3 mt-5")
    .attr("width", (+wsPanel.width) + "px")
    .attr("height", (+window.innerHeight - wsPanel.height) + "px")
    .attr("id", "tablediv")
// .append("table")
// .attr("class", "display")
// .attr("id", "contentTable")

let tablediv = d3.select('#tablediv');
tablediv.selectAll('*').remove();
let table = tablediv
    .append('table')
    .attr("class", "display");

queue()
    .defer(d3.csv, 'data/vis-noun-data.csv')
    .defer(d3.csv, "data/vis-word-data.csv")
    .defer(d3.json, 'data/lemma.json')
    .await(loadData);

function loadData(error, records_, word_, lemma_) {
    if (error) throw error;
    lemma = lemma_
    records = records_

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

    wordstream(svg, arr, config)
    wsHandle();
    sentenceRecords = expandSentence(records)

    console.log(sentenceRecords)

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

function wsHandle() {
    var dataSet = [
        ["Tiger Nixon", "System Architect", "Edinburgh", "5421", "2011/04/25", "$320,800"],
        ["Garrett Winters", "Accountant", "Tokyo", "8422", "2011/07/25", "$170,750"],
        ["Ashton Cox", "Junior Technical Author", "San Francisco", "1562", "2009/01/12", "$86,000"],
        ["Cedric Kelly", "Senior Javascript Developer", "Edinburgh", "6224", "2012/03/29", "$433,060"],
        ["Airi Satou", "Accountant", "Tokyo", "5407", "2008/11/28", "$162,700"],
        ["Brielle Williamson", "Integration Specialist", "New York", "4804", "2012/12/02", "$372,000"],
        ["Herrod Chandler", "Sales Assistant", "San Francisco", "9608", "2012/08/06", "$137,500"],
        ["Rhona Davidson", "Integration Specialist", "Tokyo", "6200", "2010/10/14", "$327,900"],
        ["Colleen Hurst", "Javascript Developer", "San Francisco", "2360", "2009/09/15", "$205,500"],
        ["Sonya Frost", "Software Engineer", "Edinburgh", "1667", "2008/12/13", "$103,600"],
        ["Jena Gaines", "Office Manager", "London", "3814", "2008/12/19", "$90,560"],
        ["Quinn Flynn", "Support Lead", "Edinburgh", "9497", "2013/03/03", "$342,000"],
        ["Charde Marshall", "Regional Director", "San Francisco", "6741", "2008/10/16", "$470,600"],
        ["Haley Kennedy", "Senior Marketing Designer", "London", "3597", "2012/12/18", "$313,500"],
        ["Tatyana Fitzpatrick", "Regional Director", "London", "1965", "2010/03/17", "$385,750"],
        ["Michael Silva", "Marketing Designer", "London", "1581", "2012/11/27", "$198,500"],
        ["Paul Byrd", "Chief Financial Officer (CFO)", "New York", "3059", "2010/06/09", "$725,000"],
        ["Gloria Little", "Systems Administrator", "New York", "1721", "2009/04/10", "$237,500"],
        ["Bradley Greer", "Software Engineer", "London", "2558", "2012/10/13", "$132,000"],
        ["Dai Rios", "Personnel Lead", "Edinburgh", "2290", "2012/09/26", "$217,500"],
        ["Jenette Caldwell", "Development Lead", "New York", "1937", "2011/09/03", "$345,000"],
        ["Yuri Berry", "Chief Marketing Officer (CMO)", "New York", "6154", "2009/06/25", "$675,000"],
        ["Caesar Vance", "Pre-Sales Support", "New York", "8330", "2011/12/12", "$106,450"],
        ["Doris Wilder", "Sales Assistant", "Sydney", "3023", "2010/09/20", "$85,600"],
        ["Angelica Ramos", "Chief Executive Officer (CEO)", "London", "5797", "2009/10/09", "$1,200,000"],
        ["Gavin Joyce", "Developer", "Edinburgh", "8822", "2010/12/22", "$92,575"],
        ["Jennifer Chang", "Regional Director", "Singapore", "9239", "2010/11/14", "$357,650"],
        ["Brenden Wagner", "Software Engineer", "San Francisco", "1314", "2011/06/07", "$206,850"],
        ["Fiona Green", "Chief Operating Officer (COO)", "San Francisco", "2947", "2010/03/11", "$850,000"],
        ["Shou Itou", "Regional Marketing", "Tokyo", "8899", "2011/08/14", "$163,000"],
        ["Michelle House", "Integration Specialist", "Sydney", "2769", "2011/06/02", "$95,400"],
        ["Suki Burks", "Developer", "London", "6832", "2009/10/22", "$114,500"],
        ["Prescott Bartlett", "Technical Author", "London", "3606", "2011/05/07", "$145,000"],
        ["Gavin Cortez", "Team Leader", "San Francisco", "2860", "2008/10/26", "$235,500"],
        ["Martena Mccray", "Post-Sales support", "Edinburgh", "8240", "2011/03/09", "$324,050"],
        ["Unity Butler", "Marketing Designer", "San Francisco", "5384", "2009/12/09", "$85,675"]
    ];

    $(table.node()).DataTable({
        data: dataSet,
        columns: [
            {title: "CourseID"},
            {title: "CourseName"},
            {title: "JournalEntryWeek"},
            {title: "Student#"},
            {title: "YearQuarter"},
            {title: "Content"}
        ],
        "pageLength": 100,
        "deferRender": true,
    });
}

function ObjToArray(arrayofobj) {
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

function titlize() {
    return selectedField.map(d => {
        return {
            title: d
        }
    })
}

$.fn.dataTable.ext.search.push(
    function (settings, data, dataIndex) {
        var min = new Date($('#min_time').val());
        var max = new Date($('#max_time').val());
        var age = new Date(data[0]); // use data for the age column

        if ((isNaN(min.getTime()) && isNaN(max.getTime())) ||
            (isNaN(min.getTime()) && age <= max) ||
            (min <= age && isNaN(max.getTime())) ||
            (min <= age && age <= max)) {
            return true;
        }
        return false;
    }
);