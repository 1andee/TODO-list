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

  //to do: get search bar to replace the parameter search in the url
  $("#search_bar .input-field").keypress(function(e) {
    if(e.which == 13) {
      e.preventDefault();
        // GET ajax request to api
        $.ajax({
           url: `https://www.googleapis.com/customsearch/v1?key=AIzaSyApGojK0WLIJ2gQHRhK_Em7QJxOfVNBqFk&cx=002945784373727008043:4ivjf5lejok&q=${encodeURI($(this).val())}&gl=ca`,
           method: 'GET',
        }).done((response) => {
          console.log(response);
          for (let r = 0; r < response.items.length; r++) {
              $("<div>")
              .text(`${response.items[r].title.substring(0, response.items[r].title.indexOf("-"))}`)
              .appendTo($(".search_results"));
          }
        });;
     }
  });


});
