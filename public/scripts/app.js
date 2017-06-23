$(() => {

  // render items name at /list
  $.ajax({
    method: "GET",
    url: "/api/users/list",
    dataType: "json"
  }).done((items) => {

    $('#todo-list').empty();

    // console.log(items);

    // console.log($('#dropRank option:selected'));


    // items = sortBy(items, "rank");


    items.forEach( function(element) {

    if (filterBy(element, "Movies/TVSeries", false)) {

      let item = createListElement(element);

      $('#todo-list').append(item);

    }
  })
});


  // function sortBy(items, sortCategory) {


  //   items.sort(function(a,b){

  //     return a[sortCategory] - b[sortCategory]

  //   })


  //   return items;

  // }


  function filterBy(element, category, completed) {

    if ( (element.category === category) && (element.completed === completed) ) {
      return element;
    }

    return null;
  }


  function createListElement(item) {

  let item_entry = `<article>

                        <p>
                          ${item.item_name}, ${item.category}, ${item.rank}, ${item.completed}
                        </p>

                    </article>`

  return item_entry;

  }

  //hard coded headers


  const categories = {

    'www.yelp.com': 'Place',
    'www.amazon.com': 'Product',
    'www.imdb.com': 'Movie/TVSeries'
  };


  // var list = [];

  //to do: get search bar to replace the parameter search in the url
  $( "#search_bar .input-field" ).keypress(function (e) {
    if(e.which == 13) {
      e.preventDefault();
      $.ajax({

         url: `https://www.googleapis.com/customsearch/v1?key=AIzaSyBj7ISo5BYStqj48hzKmY3vXGNQn2EVqVc&cx=002945784373727008043:4ivjf5lejok&q=${encodeURI($(this).val())}&gl=ca`,
         method: 'GET',
      }).done((response) => {
          // console.log(response.items);

          for (let item of response.items) {

            if (item.displayLink in categories) {

              // let title = item.title;
              // console.log(item.displayLink);
              // console.log(categories['www.imdb.com']);
              let category = categories[item.displayLink.toString()];

              let title = cleanTitle(item, category);
              let link = item.link;


              // list.push({category})
              $("<div>").addClass("result")
              .text(`${title} ${category}`)
              .data("element", {"title": title, "category": category, "link": link})
              .appendTo($(".search_results"));

            }
          }

        });
    }

  })

  function cleanTitle(item, category) {

    console.log(item);
    console.log(category);

    if (category === 'Place') {

      return item.pagemap.localbusiness[0].name;

    } else if (category === 'Product') {

      return item.pagemap.metatags[0]["og:title"];

    } else if (category === 'Movie/TVSeries') {

      if ('tvseries' in item.pagemap) {

        return item.pagemap.tvseries[0].name;

      } else if ('movie' in item.pagemap) {

        return item.pagemap.movie[0].name;

      } else {

        return item.title;

      }

    }

  }


















$('.search_results').on('click', '.result', function () {

  knex('items').insert({ //insert clicked item into items database
    item_name: $(this).data("element").title,
    completed: 'true',
    rank: '5',
    category: $(this).data("element").category
  })


  console.log($(this).data("element").category);

});









});
