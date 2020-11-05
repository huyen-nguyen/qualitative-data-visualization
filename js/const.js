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