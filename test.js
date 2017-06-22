var amazon = require('amazon-product-api');

var client = amazon.createClient({
  awsId: "AKIAIR2KHDTW23V4FADA",
  awsSecret: "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"
  //awsTag: "aws Tag"
});

client.itemSearch({
  director: 'Quentin Tarantino',
  actor: 'Samuel L. Jackson',
  searchIndex: 'DVD',
  audienceRating: 'R',
  responseGroup: 'ItemAttributes,Offers,Images'
}, function(err, results, response) {
  if (err) {
    console.log(err.Error);
  } else {
    console.log(results);  // products (Array of Object)
    console.log(response); // response (Array where the first element is an Object that contains Request, Item, etc.)
  }
});
