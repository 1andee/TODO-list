$(() => {

  //Initial Values
  var filterRankVariable = 'All';
  var filterCategoryVariable = 'All';
  var filterCompletedVariable = 'All';
  var sortDate = 'Descending';


  //Comparison Tables
  const categories = {

    'www.yelp.com': 'Place/Restaurant',
    'www.amazon.com': 'Product/Book',
    'www.imdb.com': 'Movie/TVSeries'

  };

  const priority = {'1': 'High', '2': 'Medium', '3': 'Low'};
  const status = {'true': 'Done', 'false': 'To-Do'};

  //Load initial list of TO-DO items
  loadList();

  //Loads list of TO-DO items
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

    });

  }


  //Sorts items in ascending/descending order
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


  //Filters items by rank/category/completion status
  function filterBy(element, rank ,category, completed) {

    let element_rank = priority[element.rank];
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


  //Create individual list item
  function createListElement(item) {

    let rank = item.rank;
    let complete = item.completed;

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


  //Slide/Toggle for list items
  $('#todo-list').on('click', '#item-title', function () {
    $(this).siblings(".item-info-container").slideToggle('slow');
  });

  //Search Bar to display auto-categorized results
  $( "#search_bar .input-field" ).keypress(function (e) {
    if(e.which == 13) {

      e.preventDefault();

      $('.search_results').empty();
      $.ajax({
        url: `https://www.googleapis.com/customsearch/v1?key=${ GOOGLEKEY }&cx=${ GOOGLECSE }&q=${encodeURI($(this).val())}&gl=ca`,
        method: 'GET',
      }).done((response) => {

        for (let item of response.items) {

          if (item.displayLink in categories) {


            let category = categories[item.displayLink.toString()];
            let link = item.link;

            let info = cleanInfo(item, category);

            let title = info.title;
            let image = info.image;
            let description = info.description;
            let subcategory = info.subcategory;

            if (title && image) {

              if (!description) {
                 description = 'Description not found...';
              } else {
                description = description.substring(0,100).concat("...");
              }

              $("<div style='display: none;'>").addClass("result").addClass('hoverable')
              .text(`${title} --- ${category} --- ${description}`)
              .data("element", {"category": category,
                "link": link,
                "title": title,
                "image": image,
                "description": description,
                "subcategory": subcategory})
              .appendTo($(".search_results"));
              $('div.result').slideDown('slow');

            }
          }
        }

      });
    }
  })


  //Goes through Google CSE results
  function cleanInfo(item, category) {

    let obj = {title: null, image: null, description: null, 'category':category, subcategory:null}

    if (category === 'Place/Restaurant') {
      return searchYelp(item, obj);
    } else if (category === 'Product/Book') {
      return searchAmazon(item, obj);
    } else if (category === 'Movie/TVSeries') {
      return searchIMDB(item, obj);
    }

  }


  //Searches Yelp Results
  function searchYelp(item, obj){

    let path = item.pagemap;

    if ('localbusiness' in path) {
      obj.title = item.pagemap.localbusiness[0].name;
    }

    if ('cse_thumbnail' in path) {
      obj.image = item.pagemap.cse_thumbnail[0].src;
    }

    if ('review' in path) {
      if (path.review.length >= 2) {
        obj.description = item.pagemap.review[1].description;
      }
    }

    if ('breadcrumb' in path) {
      obj.subcategory = path.breadcrumb[0].title;
    }

    return obj;

  }


  //Searches Amazon Results
  function searchAmazon(item, obj){

    let path = item.pagemap;

    if ('metatags' in path) {
      obj.title = item.pagemap.metatags[0]["og:title"];
      obj.description = item.pagemap.metatags[0]["og:description"];

      let string = item.pagemap.metatags[0].title;

      if (string) {

        if (string.substring(string.length-5) === 'Books') {
          obj.subcategory = 'Books'
        } else {
          obj.subcategory = 'Product'
        }

      }
    }

    if ('cse_thumbnail' in path) {
      obj.image = item.pagemap.cse_thumbnail[0].src;
    }

    if ('review' in path) {
      obj.description = item.pagemap.review[1].description;
    }

    return obj;

  }


  //Searches IMDB results
  function searchIMDB(item, obj){

    let path = item.pagemap;

    if ('movie' in path) {
      obj.title = item.pagemap.movie[0].name;
      obj.description = item.snippet;
      obj.subcategory = 'Movie';
    }

    if ('tvseries' in path) {
      obj.title = item.pagemap.tvseries[0].name;
      obj.description = item.pagemap.tvseries[0].description;
      obj.subcategory = 'TVSeries';
    }

    if ('cse_thumbnail' in path) {
      obj.image = item.pagemap.cse_thumbnail[0].src;
    }



    return obj;

  }


  //Action for new selection
  $('.search_results').on('click', '.result', function () {

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


  //Action for item Delete button
  $('.list_class').on('click', '.delete', function () {

    let item_id = {'item_id': $(this).closest(".item_article").prop('id')};

    $.ajax({
      method: 'POST',
      url: '/list/delete',
      data: item_id
    }).then(()=>{
      $(this).closest("article").remove();
    });
  });


  //Action for item Status button
  $('.list_class').on('click', '.completed_boolean', function () {

    let item_id = {'item_id': $(this).closest(".item_article").prop('id')};

    $.ajax({
      method: 'POST',
      url: '/list/status',
      data: item_id
    }).then(()=>{

      if ($(this).text().trim() === "Done") {

        $(this).text('To-Do');

      } else {
        $(this).text('Done');

        //remove item from display after 750 milliseconds
        setTimeout(() => {
          $(this).closest("article").remove();
        }, 750);

      }

    });

  });


  //Action for item Priority button
  $('.list_class').on('click', '.rank_button', function () {

    let item_id = {'item_id': $(this).closest(".item_article").prop('id')};

    $.ajax({
      method: 'POST',
      url: '/list/rank',
      data: item_id
    }).then(()=>{

      if ($(this).text().trim() === 'High') {
        $(this).text('Low');
      } else if ($(this).text().trim() === 'Medium') {
        $(this).text('High');
      } else if ($(this).text().trim() === 'Low') {
        $(this).text('Medium');
      }

    });

  });


  //Action for item Category button
  $('.list_class').on('click', '.category_button', function () {

    let item_id = {'item_id': $(this).closest(".item_article").prop('id')};

    $.ajax({
      method: 'POST',
      url: '/list/category',
      data: item_id
    }).then(()=>{

      if ($(this).text().trim() === 'Place/Restaurant') {
        $(this).text('Product/Book');
      } else if ($(this).text().trim() === 'Product/Book') {
        $(this).text('Movie/TVSeries');
      } else if ($(this).text().trim() === 'Movie/TVSeries') {
        $(this).text('Place/Restaurant');
      }

    });

  });


  //Action for filter rank button
  $('#filterRank #0').add('#filterRank #1').add('#filterRank #2').add('#filterRank #3').on('click', function () {

    filterRankVariable = $(this).text();

  $("a[data-activates='filterRank']").text($(this).text());

  if ( $("a[data-activates='filterRank']").text() === 'All' ) {
     $("a[data-activates='filterRank']").text('priority');
  }

    loadList();

  });


  //Action for filter category button
  $('#filterCategory #0').add('#filterCategory #1').add('#filterCategory #2').add('#filterCategory #3').on('click', function () {

    filterCategoryVariable = $(this).text();

    $("a[data-activates='filterCategory']").text($(this).text());

    if ( $("a[data-activates='filterCategory']").text() === 'All' ) {
       $("a[data-activates='filterCategory']").text('category');
    }

    loadList();

  });


  //Action for filter status button
  $('#filterCompleted #0').add('#filterCompleted #1').add('#filterCompleted #2').on('click', function () {

    filterCompletedVariable = $(this).text();

    $("a[data-activates='filterCompleted']").text($(this).text());

    if ( $("a[data-activates='filterCompleted']").text() === 'All' ) {
       $("a[data-activates='filterCompleted']").text('status');
    }

    loadList();

  });


  //Action for sort button
  $('#sortDate #0').add('#sortDate #1').on('click', function () {

    sortDate = $(this).text();

    $("a[data-activates='sortDate']").text($(this).text());

    loadList();

  });


  //Action for reset button
  $('#resetButton').on('click', function () {

    filterRankVariable = 'All';
    filterCategoryVariable = 'All';
    filterCompletedVariable = 'All';
    sortDate = 'Descending';

    loadList();

  });


});
