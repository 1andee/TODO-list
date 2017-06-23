$(() => {

  $('.dropdown-button').dropdown();

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
  });

  //   if(e.which == 13) {
  //     e.preventDefault();
  //       // GET ajax request to api
  //       $.ajax({
  //          url: `https://www.googleapis.com/customsearch/v1?key=AIzaSyApGojK0WLIJ2gQHRhK_Em7QJxOfVNBqFk&cx=002945784373727008043:4ivjf5lejok&q=${encodeURI($(this).val())}&gl=ca`,
  //          method: 'GET',
  //       }).done((response) => {
  //
  //         for (let r = 0; r < response.items.length; r++) {
  //             $("<div>")
  //             .text(`${response.items[r].title.substring(0, response.items[r].title.indexOf("-"))}`)
  //             .appendTo($(".search_results"));
  //         }
  //
  //       });
  //    }
  // });


  // for (let item of response.items) {
  //
  //   if (item.displayLink in categories){
  //
  //     let title = item.title;
  //     // console.log(item.displayLink);
  //     // console.log(categories['www.imdb.com']);
  //     let category = categories[item.displayLink.toString()];
  //
  //     list.push({title : category})
  //
  //   }
  //
  // }

  // console.log(list);
  // for (let item of list) {
  //
  //   console.log(item);
  // }
});
