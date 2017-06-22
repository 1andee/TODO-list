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

  //hard coded headers
  $("#search_bar .input-field").keypress(function(e) {
    if(e.which == 13) {
      e.preventDefault();
        // GET ajax request to api
        $.ajax({
           url: "https://www.googleapis.com/customsearch/v1?key=AIzaSyApGojK0WLIJ2gQHRhK_Em7QJxOfVNBqFk&cx=002945784373727008043:4ivjf5lejok&q=the%20federal&gl=ca",
           method: 'GET',
           success: (response) => {
             console.log(response);
           }
        });
     }
  });


});
