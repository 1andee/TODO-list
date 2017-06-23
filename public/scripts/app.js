$(() => {

  // $('.dropdown-button').dropdown();

  // render items name at /list
  $.ajax({
    method: "GET",
    url: "/api/users/list",
    dataType: "json"
  }).done((items) => {

    $('#todo-list').empty();

    console.log(items);

    console.log($('#dropRank option:selected'));

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


  var categories = {
    'www.yelp.com': 'restaurant',
    'www.amazon.com': 'product',
    'www.imdb.com': 'movie'
  };


  var list = [];

  //to do: get search bar to replace the parameter search in the url
  $( "#search_bar .input-field" ).keypress(function (e) {
    if(e.which == 13) {
      e.preventDefault();
      $.ajax({

         url: `https://www.googleapis.com/customsearch/v1?key=AIzaSyBR4nzihyvI2zdbX3EnNWOnMahJhve3OU8&cx=002945784373727008043:4ivjf5lejok&q=${encodeURI($(this).val())}&gl=ca`,
         method: 'GET',
      }).done((response) => {
          console.log(response);

          for (let item of response.items) {

            if (item.displayLink in categories) {

              let title = item.title;
              console.log(item.displayLink);
              console.log(categories['www.imdb.com']);
              let category = categories[item.displayLink.toString()];

              list.push({category})

            }
          }

          //add top 10 to seach_results div
          for (let r = 0; r < 5; r++) {

              if (response.items[r].displayLink === "www.imdb.com") {
                $("<div>")
                .text(`${response.items[r].title.substring(0, response.items[r].title.indexOf(")"))} movie`)
                .appendTo($(".search_results"));
              } else if (response.items[r].displayLink === "www.yelp.com") {
                $("<div>")
                .text(`${response.items[r].title} place`)
                //.substring(0, response.items[r].title.indexOf("-"))
                .appendTo($(".search_results"));
              } else {
                $("<div>")
                .text(`${response.items[r].title} product`)
                //.substring(11, response.items[r].title.indexOf("("))
                .appendTo($(".search_results"));
              }


          }

        });

      }
    })

  });
