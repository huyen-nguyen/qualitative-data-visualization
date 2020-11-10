const wordtype = ["VERB", "NOUN", "ADJ"]

function colorWord(type) {
    if (type === "NOUN"){
        return "#1F77B4"
    }
    else if (type === "VERB"){
        return "#FF7F0E"
    }
    else return "#2CA02C"
}

queue()
    .defer(d3.csv, 'data/prompt.csv')
    .await(run);

let questionsArr
function run(error, records) {
    if (error) throw error;
    questionsArr = expandSentence(records)
}

function expandSentence(records) {
    let arr = [];
    records.forEach(rec => {
        rec["PromptText"]
            .match(/.*?[.!?)](\s+|$)/g).map(d => d.trim())
            .forEach(d => {
                let temp = (({CourseID,CourseName,JournalEntryWeek,PromptText}) =>
                    ({CourseID,CourseName,JournalEntryWeek,PromptText}))(rec)
                temp.Sentence = d
                // arr.push(temp) // all
                arr.push(d)
            })
    })
    return arr
}