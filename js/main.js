let weekIndex = 0

let nounchunks, words
let data
let init

queue()
    .defer(d3.csv, 'data/vis-noun-data.csv')
    .defer(d3.csv, 'data/vis-word-data.csv')
    .await(main);

function main(error, nounchunks_, words_) {
    if (error) throw error;

    nounchunks = nounchunks_;
    words = words_

    promptSelection()
    getWordcloud()

}

function promptSelection() {
    let leftPanel = d3.select("#leftPanel")
        .append("div")
        .text("Prompt questions")
        .attr("class", "p-3")
        .attr("id", "leftWrapper")

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

    // set init value

    let promptContent = leftPanel
        .append("div")
        .attr("id", "promptContent")
        .html(displayHTML(words[weekIndex].PromptText))

    // document.getElementsByClassName("placeholder")[0].innerText = "Prompt " + (weekIndex + 1)
    //
    // // reverse selected + modify current
    // var aTags = document.getElementsByClassName("ss-option-selected");
    // var found;
    //
    // for (var i = 0; i < aTags.length; i++) {
    //     if (aTags[i].textContent == "Prompt 1") {
    //         found = aTags[i];
    //         found.className = "ss-option option"
    //         break;
    //     }
    // }
    //
    // var aTags2 = document.getElementsByClassName("ss-option");
    // var searchText2 = "Prompt " +  (weekIndex + 1);
    // var found2;
    //
    // for (var i = 0; i < aTags2.length; i++) {
    //     if (aTags2[i].textContent == searchText2) {
    //         found2 = aTags2[i];
    //         found2.className += " ss-disabled ss-option-selected"
    //         break;
    //     }
    // }

    // Handler for dropdown value change
    function dropdownChange() {
        weekIndex = d3.select(this).property('value')
        console.log(weekIndex)

        promptContent
            .html(displayHTML(words[weekIndex].PromptText))

        getWordcloud()
    }

    function displayHTML(string) {
        return string.replace(/\n/g, '<br>')
    }
}

function getWordcloud() {
    let width = document.getElementById('leftWrapper').offsetWidth, height = 500;

    const wordtype = ["VERB", "NOUN", "ADJ"]
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
    const removeList = ["%", "d", "-"]

    if (!init){
         d3.select("#leftWrapper")
            .append("svg")
             .attr("id", "svg")
            .attr("width", width)
            .attr("height", height)
        init = true
    }

    let svg = d3.select("#svg")

    svg.selectAll("*").remove()

    const opacScale = d3.scaleLinear()
        .domain([0,30])
        .range([1,1])

    const randomRotate = d3.scaleLinear()
        .domain([0,1])
        .range([-20,20]);

    // legend
    var legend = svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "start")
        .selectAll("g")
        .data(wordtype)
        .enter().append("g")
        .attr("transform", function(d, i) { return "translate(-60," + (20+ i * 20) + ")"; });

    legend.append("circle")
        .attr("cx", width - 25)
        .attr("cy", 10)
        .attr("r", 8)
        .attr("height", 15)
        .attr("fill",  d => colorWord(d))
        .attr("stroke-width",2)

    legend.append("text")
        .attr("x", width - 10)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .attr("font-size", "13px")
        .text((d,i) => wordtype[i].toLowerCase())

    // process data

    let raw = JSON.parse(words[weekIndex].Words.split("'").join('"'))

    data = d3.keys(raw)
        .filter(d => !removeList.includes(d))
        .filter(d => raw[d].count != 1)
        .map(d => {
        return {
            text: modify(d),
            frequency: raw[d].count,
            type: raw[d].type,
        }
    })

    const wordScale = d3.scaleLinear()
        .domain(d3.extent(data, function(d) { return d.frequency; }))
        .range([15,70])

    wordCloud(data)

    function wordCloud(data) {
        d3.layout.cloud()
            .size([width,height])
            .words(data)
            .rotate(()=>randomRotate(Math.random()))
            .fontSize(d=>wordScale(d.frequency))
            .on("end",draw)
            .start();
    }

    function draw(words) {
        const wordG = svg.append("g")
            .attr("id","wordCloudG")
            .attr("transform","translate("+ (width/2) + "," + (height/2) + ")");

        wordG.selectAll("text")
            .data(words)
            .enter()
            .append("text")
            .style("font-size",d=>d.size +"px")
            .style("fill", d => colorWord(d.type))
            .style("font-family", "serif")
            .attr("text-anchor","middle")
            .attr("transform",d=>("translate(" + [d.x,d.y] +")rotate(" + d.rotate + ")"))
            .text(d=>d.text === "r" ? "R" : d.text)
    }
    function colorWord(type) {
        if (type === "NOUN"){
            return "rgb(31, 119, 180)"
        }
        else if (type === "VERB"){
            return "rgb(255, 127, 14)"
        }
        else return "rgb(44, 160, 44)"
    }
    function modify(word) {
        if (word === "datum"){
            return "data"
        }
        else if (word === "r"){
            return "R"
        }
        else return word
    }

}