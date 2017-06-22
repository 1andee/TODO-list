$(() => {

  $('.dropdown-button').dropdown();

  $.ajax({
    method: "GET",
    url: "/api/users"
  }).done((users) => {
    for(user of users) {
      $("<div>").text(user.name).appendTo($("body"));
    }
  });

  //hard coded headers


  $("#search_bar .input-field").keypress(function(e) {
    if(e.which == 13) {
      e.preventDefault();
        // GET ajax request to api
        $.ajax({
          //  url: 'https://api.yelp.com/v3/businesses/search?latitude=43.676667&longitude=-79.630555&term=wilbur%20mexicana&limit=1&sort_by=best_match',
          //  url: "https://www.googleapis.com/customsearch/v1?key=AIzaSyApGojK0WLIJ2gQHRhK_Em7QJxOfVNBqFk&cx=002945784373727008043:4ivjf5lejok&q=the%20federal&gl=ca",
          url: "http://api.wolframalpha.com/v2/query?input=the%20avengers&appid=4XV6G6-79TXE2U2HL&output=json",
           method: 'GET',
          //  beforeSend: function(xhr, settings) {
          //    xhr.setRequestHeader('Authorization', 'Bearer ' + 'RMhKtmSkPfHThcXv5ve2wzGyGXeET8fnFdbQlK90d4O1N1G4cVS-JPX4yg0JV5X-zBK4NoiDXbO8OLvqI3qKkxuAquKu9CskANsoQ7otY6gZ1y4R6L0XuwJW_ONKWXYx');
          //  },

           success: (response) => {
             console.log(response);
           }

        });
     }
  });


});
