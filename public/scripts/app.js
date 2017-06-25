$(() => {


  var filterRankVariable = 'All';
  var filterCategoryVariable = 'All';
  var filterCompletedVariable = 'All';

  var sortDate = 'Descending';



  // render items name at /list
  function loadList() {
    $.ajax({
      method: "GET",
      url: "/api/users/list",
      dataType: "json"
    }).done((items) => {

      $('#todo-list').empty();

      items = sortBy(items, sortDate);

      items.forEach( function(element) {

        console.log(element.created_at);

        if (filterBy(element, filterRankVariable, filterCategoryVariable, filterCompletedVariable)) {

          let item = createListElement(element);

          $('#todo-list').append(item);

        }

      });

      console.log( "Current Filters are Rank:" + filterRankVariable + " Category:" + filterCategoryVariable + " Completion:" + filterCompletedVariable + " Sort By:" + sortDate);

    });

  }

  loadList();



  function sortBy(items, order) {

    if (order === 'Descending') {

      items.sort(function(a,b){

        return new Date(b.created_at) - new Date(a.created_at);

      })

    } else if (order === 'Ascending'){

      items.sort(function(a,b){

        return new Date(a.created_at) - new Date(b.created_at);

      })

    }

    return items;

  }



  function filterBy(element, rank ,category, completed) {

    let priority = {'1': 'High', '2': 'Medium', '3': 'Low'};

    let element_rank = priority[element.rank];

    let status = {'true': 'Done', 'false': 'To-Do'};

    let element_completed = status[element.completed];

    if ( (element_rank === rank) || (rank === 'All') ) {
      if ( (element.category === category) || (category === 'All') ) {
        if ( (element_completed === completed) || (completed === 'All') ) {
          return element;
        }
      }
    }

    return null;
  }


  function createListElement(item) {


    let rank = item.rank;

    let priority = {'1': 'High', '2': 'Medium', '3': 'Low'};

    let complete = item.completed;

    let status = {'true': 'Done', 'false': 'To-Do'}

    let date = (new Date(item.created_at));

    let day = date.toDateString();

    let time = date.toLocaleTimeString();


    let item_entry = `
      <article class="row item_article hoverable" id="${item.id} ">
        <div id="item-title" class="col s12">
          <h3>${item.item_name}
            <i class="material-icons">info</i>
          </h3>
          <div>
            <span>Date Added: ${day}</span>
            <span>Time Added: ${time}</span>
          </div>
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

        <div class="item-info-container">

          <div class="col s2">
            <img class="item_thumbnail"src="${item.thumbnail}"/>
          </div>

          <div class="col s10">

            <div class="item_description">
                <h5>Description:</h5>
                ${item.description}</br>
                <a href="${item.url}">
                  <h5>Link</h5>
                </a>
            </div>

           </div>

         </div>
      </article>`


    return item_entry;

  }

  $('#todo-list').on('click', '#item-title', function () {
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
            let description = info.description;
            let subcategory = info.subcategory;

            //console.log(info);

            if (title && image && description && subcategory) {


              description = description.substring(0,100).concat("...");

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

      filterRankVariable = 'All';
      filterCategoryVariable = 'All';
      filterCompletedVariable = 'All';
      sortDate = 'Descending';

      loadList();

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


  $('#filterRank #0').add('#filterRank #1').add('#filterRank #2').add('#filterRank #3').on('click', function () {
    filterRankVariable = $(this).text();
  //change Priority button text to value of chosen filter
  $("a[data-activates='filterRank']").text($(this).text());

  if ( $("a[data-activates='filterRank']").text() === 'All' ) {
     $("a[data-activates='filterRank']").text('priority');
  }
    loadList();

  });



  $('#filterCategory #0').add('#filterCategory #1').add('#filterCategory #2').add('#filterCategory #3').on('click', function () {

    filterCategoryVariable = $(this).text();

    //change Category button text to value of chosen filter
    $("a[data-activates='filterCategory']").text($(this).text());

    if ( $("a[data-activates='filterCategory']").text() === 'All' ) {
       $("a[data-activates='filterCategory']").text('category');
    }


    loadList();

  });



  $('#filterCompleted #0').add('#filterCompleted #1').add('#filterCompleted #2').on('click', function () {

    filterCompletedVariable = $(this).text();

    //change Category button text to value of chosen filter
    $("a[data-activates='filterCompleted']").text($(this).text());

    if ( $("a[data-activates='filterCompleted']").text() === 'All' ) {
       $("a[data-activates='filterCompleted']").text('status');
    }


    loadList();

  });



  $('#sortDate #0').add('#sortDate #1').on('click', function () {

    sortDate = $(this).text();

    //change Date Created button text to value of chosen filter
    $("a[data-activates='sortDate']").text($(this).text());


    loadList();

  });




  $('#resetButton').on('click', function () {

    filterRankVariable = 'All';
    filterCategoryVariable = 'All';
    filterCompletedVariable = 'All';
    sortDate = 'Descending';

    // console.log('reset list')

    loadList();

  });


});
