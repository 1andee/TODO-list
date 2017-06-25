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


  let rank = item.rank;

  let priority = {'1': 'High', '2': 'Medium', '3': 'Low'};

  let complete = item.completed;

  let status = {'true': 'Done', 'false': 'To-Do'}


  let item_entry = `<article class="row item_article hoverable" id="${item.id} ">
                        <h3 class="col s12">${item.item_name}<i class="material-icons">info</i></h3>

                        <div class="item-info-container">

                          <div class="col s2">
                            <img class="item_thumbnail"src="${item.thumbnail}"/>
                          </div>

                          <div class="col s10">

                            <div class="item_description">
                              <h5>Description:</h5> ${item.description}
                            </div>

                            <div class="item_buttons">
                              <span class="waves-effect waves-light btn category_button">
                                ${item.category}
                              </span>
                              <span class="waves-effect waves-light btn rank_button">
                                 ${priority[rank]}
                              </span>
                              <span class="waves-effect waves-light btn completed_boolean">
                                ${status[complete]}
                              </span>
                                <a class="waves-effect waves-light btn delete">Delete</a>
                             </div>
                           </div>
                          </div>
                    </article>`

  return item_entry;

  }

$('#todo-list').on('click', 'h3', function () {
  $(this).siblings(".item-info-container").slideToggle('slow');
});



  const categories = {

    'www.yelp.com': 'Place/Restaurant',
    'www.amazon.com': 'Product/Book',
    'www.imdb.com': 'Movie/TVSeries'

  };


  //to do: get search bar to replace the parameter search in the url
  $( "#search_bar .input-field" ).keypress(function (e) {
    if(e.which == 13) {

      e.preventDefault();



      $('.search_results').empty();
      $.ajax({

         url: `https://www.googleapis.com/customsearch/v1?key=AIzaSyDbnXGNplJSpB8gYMBr49NTbHFXPGnXgW0&cx=002945784373727008043:4ivjf5lejok&q=${encodeURI($(this).val())}&gl=ca`,
         method: 'GET',
      }).done((response) => {
          //console.log(response.items);

          for (let item of response.items) {

            if (item.displayLink in categories) {

              // let title = item.title;
              // console.log(item.displayLink);
              // console.log(categories['www.imdb.com']);


              let category = categories[item.displayLink.toString()];
              let link = item.link;

              let info = cleanInfo(item, category);

              let title = info.title;
              let image = info.image;
              let description = info.description.substring(0,100).concat("...");
              let subcategory = info.subcategory;

              //console.log(info);

              if (title && image && description && subcategory) {

                $("<div style='display: none;'>").addClass("result").addClass('hoverable')
                .text(`${title} --- ${category} --- ${description}...`)
                .data("element", {"category": category, "link": link, "title": title, "image": image,"description": description, "subcategory": subcategory})
                .appendTo($(".search_results"));
                $('div.result').slideDown('slow');
              }
            }
          }

        });
    }

  })



  function cleanInfo(item, category) {

    // console.log(item);
    // console.log(category);

    if (category === 'Place/Restaurant') {

      // return title = item.pagemap.localbusiness[0].name;

      return searchYelp(item);

    } else if (category === 'Product/Book') {

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
    let subcategory = null;

    if ('localbusiness' in path) {
      title = item.pagemap.localbusiness[0].name;
    }

    if ('cse_thumbnail' in path) {
      image = item.pagemap.cse_thumbnail[0].src;
    }

    if ('review' in path) {
      if (path.review.length >= 2) {
        description = item.pagemap.review[1].description;
      }
    }

    if ('breadcrumb' in path) {

      subcategory = path.breadcrumb[0].title;

    }

    return {title: title, image: image, description, description, subcategory};
  }



  function searchAmazon(item){

    let path = item.pagemap;
    let title = null;
    let image = null;
    let description = null;
    let subcategory = null;

    if ('metatags' in path) {
      title = item.pagemap.metatags[0]["og:title"];
      description = item.pagemap.metatags[0]["og:description"];

      let string = item.pagemap.metatags[0].title;

      if (string) {

        if (string.substring(string.length-5) === 'Books') {
          subcategory = 'Books'
        } else {
          subcategory = 'Product'
        }

      }
    }

    if ('cse_thumbnail' in path) {
      image = item.pagemap.cse_thumbnail[0].src;
    }

    if ('review' in path) {
      description = item.pagemap.review[1].description;
    }

    return {title: title, image: image, description, description, subcategory};
  }



  function searchIMDB(item){

    let path = item.pagemap;
    let title = null;
    let image = null;
    let description = null;
    let subcategory = null;

    if ('movie' in path) {
      title = item.pagemap.movie[0].name;
      description = item.pagemap.movie[0].description;
      subcategory = 'Movie';
    }

    if ('tvseries' in path) {
      title = item.pagemap.tvseries[0].name;
      description = item.pagemap.tvseries[0].description;
      subcategory = 'TVSeries';
    }

    if ('cse_thumbnail' in path) {
      image = item.pagemap.cse_thumbnail[0].src;
    }

    return {title: title, image: image, description, description, subcategory};

  }















$('.search_results').on('click', '.result', function (e) {
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


  // DELETE ITEM FROM ITEMS TABLE WHEN DELETE BUTTON IS CLICKED
  $('.list_class').on('click', '.delete', function () {

    let item_id = {'item_id': $(this).closest(".item_article").prop('id')};

    // ajax post request to delete item
    $.ajax({
      method: 'POST',
      url: '/list/delete',
      data: item_id
    }).then(()=>{
      $(this).closest("article").remove();
    });
  });



  $('.list_class').on('click', '.completed_boolean', function () {

    let item_id = {'item_id': $(this).closest(".item_article").prop('id')};

    $.ajax({
      method: 'POST',
      url: '/list/status',
      data: item_id
    }).then(()=>{
      // console.log($(this).text());
      if ($(this).text().trim() === "Done") {

        $(this).text('To-Do');

      } else {

        $(this).text('Done');

      }

    });

  });



  $('.list_class').on('click', '.rank_button', function () {

    let item_id = {'item_id': $(this).closest(".item_article").prop('id')};

    $.ajax({
      method: 'POST',
      url: '/list/rank',
      data: item_id
    }).then(()=>{
      // console.log($(this).text());
      if ($(this).text().trim() === 'High') {

        $(this).text('Low');

      } else if ($(this).text().trim() === 'Medium') {

        $(this).text('High');

      } else if ($(this).text().trim() === 'Low') {

        $(this).text('Medium');

      }

    });

  });




  $('.list_class').on('click', '.category_button', function () {

    let item_id = {'item_id': $(this).closest(".item_article").prop('id')};

    $.ajax({
      method: 'POST',
      url: '/list/category',
      data: item_id
    }).then(()=>{

      // console.log($(this).text());

      if ($(this).text().trim() === 'Place/Restaurant') {

        $(this).text('Product/Book');

      } else if ($(this).text().trim() === 'Product/Book') {

        $(this).text('Movie/TVSeries');

      } else if ($(this).text().trim() === 'Movie/TVSeries') {

        $(this).text('Place/Restaurant');

      }

    });

  });
























    // logout (doesn't work yet)
    $('.welcome').on('click', '#logout', function () {

      $.ajax({
        method: 'POST',
        url: '/logout',
      });
    });





});
