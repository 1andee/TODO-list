$(() => {

  // $('.dropdown-button').dropdown();

  // render items name at /list
  $.ajax({
    method: "GET",
    url: "/api/users/list",
    dataType: "json"
  }).done((items) => {

    $('#todo-list').empty();

    // console.log(items);

    // console.log($('#dropRank option:selected').text());

    items = sortBy(items, "rank");

    items.forEach( function(element) {

      if (filterBy(element, "movie", false)) {

        let item = createListElement(element);

        $('#todo-list').append(item);

      }
    })
  });


  function sortBy(items, sortCategory) {

    items.sort(function(a,b){

      return a[sortCategory] - b[sortCategory]

    })

    return items;

  }


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

  var categories = {'www.yelp.com' : 'Restaurant',
                    'www.amazon.com' : 'Product',
                    'www.imdb.com' : 'Movie'};

  var list = [];

  $("#search_bar .input-field").keypress( (e) => {
    if(e.which == 13) {
      e.preventDefault();
      //GET ajax request to api
      $.ajax({
        url: "https://www.googleapis.com/customsearch/v1?key=AIzaSyBR4nzihyvI2zdbX3EnNWOnMahJhve3OU8&cx=002945784373727008043:4ivjf5lejok&q=Avengers",
        method: 'GET',
        success: (response) => {

          for (let item of response.items) {

            if (item.displayLink in categories){

              let title = item.title;
              // console.log(item.displayLink);
              // console.log(categories['www.imdb.com']);
              let category = categories[item.displayLink.toString()];

              list.push({title : category})

            }

          }

          console.log(list);
          for (let item of list) {

            console.log(item);
          }

        }
      });


  }});

})
