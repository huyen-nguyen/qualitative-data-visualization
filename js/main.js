queue()
    .defer(d3.csv, 'data/vis-noun-data.csv')
    .defer(d3.csv, 'data/vis-words-data.csv')
    .await(main);

function main(error, nounchunks, words) {
    if (error) throw error;

    console.log(nounchunks);
    console.log(words)


}