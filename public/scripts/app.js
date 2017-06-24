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

    // if (filterBy(element, "Movies/TVSeries", false)) {

      let item = createListElement(element);

      $('#todo-list').append(item);

    // }
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


  var list = [];

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
              let info = cleanInfo(item, category);
              let link = item.link;

              let title = info.title;
              let image = info.image;
              let description = info.description;

              console.log(info);

              if (title && image && description) {

                $("<div>").addClass("result")
                .text(`${title} ${category} ${description.substring(0,100)}`)
                .data("element", {"title": title, "category": category, "link": link})
                .appendTo($(".search_results"));

              }
            }
          }

        });
    }

  })



  function cleanInfo(item, category) {

    // console.log(item);
    // console.log(category);

    if (category === 'Place') {

      // return title = item.pagemap.localbusiness[0].name;

      return searchYelp(item);

    } else if (category === 'Product') {

      return searchAmazon(item);

    } else if (category === 'Movie/TVSeries') {

      return searchIMDB(item);

    }

  }



  function searchYelp(item){

    let path = item.pagemap;
    let title = null;
    let image = null;
    let description = null;

    if ('localbusiness' in path) {
      title = item.pagemap.localbusiness[0].name;
    }

    if ('cse_thumbnail' in path) {
      image = item.pagemap.cse_thumbnail[0].src;
    }

    if ('review' in path) {
      description = item.pagemap.review[1].description;
    }

    return {title: title, image: image, description, description};

  }



  function searchAmazon(item){

    let path = item.pagemap;
    let title = null;
    let image = null;
    let description = null;

    if ('metatags' in path) {
      title = item.pagemap.metatags[0]["og:title"];
      description = item.pagemap.metatags[0]["og:description"];
    }

    if ('cse_thumbnail' in path) {
      image = item.pagemap.cse_thumbnail[0].src;
    }

    if ('review' in path) {
      description = item.pagemap.review[1].description;
    }

    return {title: title, image: image, description, description};

  }



  function searchIMDB(item){

    let path = item.pagemap;
    let title = null;
    let image = null;
    let description = null;

    if ('movie' in path) {
      title = item.pagemap.movie[0].name;
      description = item.pagemap.movie[0].description;
    }

    if ('tvseries' in path) {
      title = item.pagemap.tvseries[0].name;
      description = item.pagemap.tvseries[0].description;
    }

    if ('cse_thumbnail' in path) {
      image = item.pagemap.cse_thumbnail[0].src;
    }

    return {title: title, image: image, description, description};

  }



















$('.search_results').on('click', '.result', function () {
  let item = $(this).data("element");
  $('.search_results').empty();

  $.ajax({
    method: 'POST',
    url: '/list',
    data: item
  }).then(() => {

    $.ajax({
      method: "GET",
      url: "/api/users/list",
      dataType: "json"
    })
    .done((items) => {
      $('#todo-list').empty();
      items.forEach( function(element) {
      let item = createListElement(element);
      $('#todo-list').append(item);
      });
    });
  });
});





});
