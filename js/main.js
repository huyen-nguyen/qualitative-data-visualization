main()
function main(){
    let weekIndex = 0

    let records, words
    let data
    let initsvg, initTable
    let selectedWord = "@@", selectedType = ""
    let allchunksObj = {}, allchunks = []
    let wcHeight = 480

    queue()
        .defer(d3.csv, 'data/vis-noun-data.csv')
        .defer(d3.csv, 'data/vis-word-data.csv')
        .await(run);

    function run(error, records_, words_) {
        if (error) throw error;
        records = records_;
        words = words_;

        records.forEach(d => {
            let arr = d.Nounchunks.split(",").filter(e => e.length > 0)
            arr.forEach(e => {
                if (!allchunksObj[e]){
                    allchunksObj[e] = 1
                }
                else {
                    allchunksObj[e] += 1
                }
            })

        })
        promptSelection()
        getWordcloud()
        displayTable()

    }

    function promptSelection() {
        let leftPanel = d3.select("#leftPanel")
            .append("div")
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
            .html(d => "Week " + d.JournalEntryWeek)

        new SlimSelect({
            select: '#single',
        });

        // set init value

        let promptContent = leftPanel
            .append("div")
            .attr("id", "promptContent")
            .style("height", (window.innerHeight - wcHeight - 220) + "px")
            .html(displayHTML(words[weekIndex].PromptText))

        // Handler for dropdown value change
        function dropdownChange() {
            weekIndex = d3.select(this).property('value')

            promptContent
                .html(displayHTML(words[+weekIndex].PromptText))

            getWordcloud()
            displayTable()
        }

    }

    function getWordcloud() {
        let width = document.getElementById('leftWrapper').offsetWidth, height = wcHeight;

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
            .attr("font-size", 9)
            .attr("text-anchor", "start")
            .selectAll("g")
            .data(wordtype)
            .enter().append("g")
            .attr("transform", function(d, i) { return "translate(-" + (width-30)  + ","+ (10+ i * 15) + ")"; });

        legend.append("circle")
            .attr("cx", width - 25)
            .attr("cy", 6)
            .attr("r", 5)
            .attr("fill",  d => colorWord(d))

        legend.append("text")
            .attr("x", width - 15)
            .attr("y", 6)
            .attr("dy", "0.32em")
            .attr("font-size", "12px")
            .text((d,i) => wordtype[i][0].toUpperCase() + wordtype[i].substring(1).toLowerCase())

        // legendNodes.append('text')
        //     .text(d => d[0].toUpperCase() + d.substring(1).toLowerCase())
        //     .attr('font-size', legendFont)
        //     .attr('alignment-baseline', "middle")
        //     .attr("dx", 10);

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
                .font("sans-serif")
                .words(data)
                .rotate(()=>0)
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
                .attr("class", "cloud-text")
                .style("font-size",d=>d.size +"px")
                .style("fill", d => colorWord(d.type))
                .style("font-family", "sans-serif")
                .attr("text-anchor","middle")
                .attr("transform",d=>("translate(" + [d.x,d.y] +")rotate(" + d.rotate + ")"))
                .text(d=>d.text === "r" ? "R" : d.text)
                .style("cursor", "pointer")
                .on("mouseover", function (d) {
                    d3.select(this)
                        .style("stroke-width", "1.5px")
                        .style("stroke",d => colorWord(d.type))
                        // .style("stroke-opacity","0.7")
                })
                .on("mouseout", function (d) {
                    d3.selectAll(".cloud-text")
                        .style("opacity", 1)
                        .style("stroke-width", "0px")
                })
                .on("mouseleave", function(){
                })
                .on("click", function (d) {
                    selectedWord = d.text
                    selectedType = d.type
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
                .attr("class", "p-3")
                .attr("id", "rightWrapper")

            let tableIn = rightPanel
                .append("div")
                .attr("id", "table-wrapper")
                .style("height", (window.innerHeight -180) + "px")
                .attr("class", "table-responsive")
                .append("table")
                .attr("class", "table mt-2 table-striped")
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
                .html(d => d === "Topic" ? d + '&nbsp;<span id="descriptive" ">[phrases]</span>' : d)

            tableIn.append('tbody').attr("id", "tb");
            initTable = true
        }

        let table = d3.select("table")
        table.select("tbody").selectAll("*").remove()

        let filteredData = records.filter(d => d.JournalEntryWeek == (+weekIndex+1).toString())

        filteredData.forEach(function (row, index) {
            return $("#tb").append('<tr>' +
                '<td >' + (index+1) + '</td>' +
                '<td class="context">' + removeDuplicates(row.Nounchunks) + '</td>' +
                '<td class="context">' + displayHTML(row.ResponseOnly) + '</td>' +
                '</tr>');
        });

        highlightLemma(selectedWord, selectedType)

        function removeDuplicates(string) {
            let obj = {}
            let a = string.split(",")
            a.filter(e => e.length > 0).forEach(d => {
                obj[d] = true
            })
            return d3.keys(obj).join(", ")
        }
    }

    function displayHTML(string) {
        return string.replace(/\n/g, '<br>')
    }
}
