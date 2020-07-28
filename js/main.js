main()
function main(){
    let weekIndex = 0

    let records, words
    let data
    let initsvg, initTable
    let selectedWord = "@@", selectedType = ""

    queue()
        .defer(d3.csv, 'data/vis-noun-data.csv')
        .defer(d3.csv, 'data/vis-word-data.csv')
        .defer(d3.json, 'data/lemma.json')
        .await(run);

    function run(error, records_, words_, lemma_) {
        if (error) throw error;

        records = records_;
        words = words_;

        console.log(lemma_)

        promptSelection()
        getWordcloud()
        displayTable()

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

        // document.getElementsByClassName("placeholder")[0].innerText = "Prompt " + (+weekIndex + 1)
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
        // var searchText2 = "Prompt " +  (+weekIndex + 1);
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
                .html(displayHTML(words[+weekIndex].PromptText))

            getWordcloud()
            displayTable()
        }

    }

    function getWordcloud() {
        let width = document.getElementById('leftWrapper').offsetWidth, height = 500;

        const wordtype = ["VERB", "NOUN", "ADJ"]
        const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
        const removeList = ["%", "d", "-"]

        if (!initsvg){
            d3.select("#leftWrapper")
                .append("svg")
                .attr("id", "svg")
                .attr("width", width)
                .attr("height", height)
            initsvg = true
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
            .attr("transform", function(d, i) { return "translate(-60," + (10+ i * 20) + ")"; });

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
                .style("cursor", "pointer")
                .on("click", function (d) {
                    selectedWord = d.text
                    selectedType = d.type
                    console.log(d)
                    displayTable()
                })
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

    function displayTable() {
        const titles = ["#", "Topic", "Full text"]

        if (!initTable){
            let rightPanel = d3.select("#rightPanel")
                .append("div")
                .text("Details into answers")
                .attr("class", "p-3")
                .attr("id", "rightWrapper")

            let tableIn = rightPanel
                .append("div")
                .attr("id", "table-wrapper")
                .style("height", (window.innerHeight -120) + "px")
                .attr("class", "table-responsive")
                .append("table")
                .attr("class", "table mt-2")
                // .style("table-layout", "fixed")

            tableIn.append('thead').append('tr')
                .selectAll('th')
                .data(titles).enter()
                .append('th')
                .style("width", (d,i) => {
                    if (i == 0) return "5%"
                    else if (i == 1) return "30%"
                    else return "65%"
                })
                .attr("class", "th-data")
                .text(d => d)

            tableIn.append('tbody').attr("id", "tb");
            initTable = true
        }

        let table = d3.select("table")
        table.select("tbody").selectAll("*").remove()

        let filteredData = records.filter(d => d.JournalEntryWeek == (+weekIndex+1).toString())
        console.log(filteredData)

        filteredData.forEach(function (row, index) {
            console.log(row)
            return $("#tb").append('<tr>' +
                '<td >' + (index+1) + '</td>' +
                '<td >' + hightlight(removeDuplicates(row.Nounchunks)) + '</td>' +
                '<td style="color: #535353">' + displayHTML(hightlight(row.ResponseText)) + '</td>' +

                '</tr>');
        });


        function removeDuplicates(string) {
            let obj = {}
            let a = string.split(",")
            a.filter(e => e.length > 0).forEach(d => {
                obj[d] = true
            })
            return d3.keys(obj).join(", ")
        }

        function hightlight(string) {
            var replace = " " + selectedWord;
            var re = new RegExp(replace,"g");

            let str = string.replace(re, '<span style="font-weight: bold; text-decoration: underline; color:' + colorWord(selectedType) + '">' + replace + '</span>')
            console.log(str)
            return str
        }
    }

    function colorWord(type) {
        if (type === "NOUN"){
            return "#1F77B4"
        }
        else if (type === "VERB"){
            return "#FF7F0E"
        }
        else return "#2CA02C"
    }

    function displayHTML(string) {
        return string.replace(/\n/g, '<br>')
    }
}
