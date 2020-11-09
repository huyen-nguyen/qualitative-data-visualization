let lemma
queue()
    .defer(d3.json, 'data/lemma.json')
    .await(run);

function run(error, lemma_) {
    if (error) throw error;

    lemma = lemma_
    console.log(lemma)
}

function highlightLemma(context, selectedWord) {

}