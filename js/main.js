let weekIndex = 0

let nounchunks, words
let data

queue()
    .defer(d3.csv, 'data/vis-noun-data.csv')
    .defer(d3.csv, 'data/vis-word-data.csv')
    .await(main);

function main(error, nounchunks_, words_) {
    if (error) throw error;

    nounchunks = nounchunks_;
    words = words_

    promptSelection()
    wordcloud()

}

function promptSelection() {
    let leftPanel = d3.select("#leftPanel")
        .append("div")
        .text("Prompt questions")
        .attr("class", "p-3")

    let dropdown = leftPanel
        .insert("select", "svg")
        .attr("id", "single")
        .style("display", "block")
        .style("float", "left")
        .on("change", dropdownChange)

    dropdown.selectAll("option")
        .data(words)
        .enter()
        .append("option")
        .attr("class", "option")
        .attr("value", (d,i) => i)
        .html(d => "Prompt " + d.JournalEntryWeek)

    new SlimSelect({
        select: '#single',
    });

    let promptContent = leftPanel
        .append("div")
        .attr("id", "promptContent")
        .html(displayHTML(words[weekIndex].PromptText))

    // Handler for dropdown value change
    function dropdownChange() {
        weekIndex = d3.select(this).property('value')
        console.log(weekIndex)

        promptContent
            .html(displayHTML(words[weekIndex].PromptText))

        wordcloud()
    }

    function displayHTML(string) {
        return string.replace(/\n/g, '<br>')
    }
}

function wordcloud() {
    let raw = words[weekIndex].Words
    data = JSON.parse(raw.split("'").join('"'))
    console.log(data)
}