$(() => {

  // render items name at /list
  $.ajax({
    method: "GET",
    url: "/api/users/list"
  }).done((items) => {
    for(item of items) {
      $("<div>").text(`Name: ${item.item_name}`).appendTo($("body"));
      $("<div>").text(`Catergory: ${item.category}`).appendTo($("body"));
    }
  });;

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
        url: "https://www.googleapis.com/customsearch/v1?key=AIzaSyApGojK0WLIJ2gQHRhK_Em7QJxOfVNBqFk&cx=002945784373727008043:4ivjf5lejok&q=Avengers",
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
