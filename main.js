"use strict";

// Initialize Firebase
var config = {
	apiKey: "AIzaSyAh0zkAQ0D0JcZzn6-hfmB9Wcsz8BLg0Yw",
	authDomain: "good-reads-ad835.firebaseapp.com",
	databaseURL: "https://good-reads-ad835.firebaseio.com",
	storageBucket: "good-reads-ad835.appspot.com",
	messagingSenderId: "476385763960"
};
firebase.initializeApp(config);

// ADD TO COLLECTION BUTTON
// 1. Check if user is signed in!
//	2. If signed in, add to collection
// 3. If not signed in, pop up modal appears
// 4. User chooses to sign in or sign up
// 5. Depending on button press a sign in/up form appears

// user creates acct (enters something for their own key)


var bookApp = {};

bookApp.firebase = function () {
	// 	// on submit function, prevent default 
	$('.user').on('submit', function (e) {
		e.preventDefault();
		if ('input[name=user]' !== '') {
			bookApp.username = $('input[name=user]').val();
			bookApp.dbRef = firebase.database().ref(bookApp.username);
			bookApp.showData();
			$('.userInput').val('');
		}

		// Append Data to the .headerBottom class div!
		bookApp.dbRef.on('value', function (data) {
			if (bookApp.selectBookTitle !== undefined) {

				$('chosenBookEl').empty();
				var chosenBookEl = $('<h4 class="chosenBookEl">').html("" + bookApp.selectBookTitle);
				var chosenBookDisp = $('.headerBottom').append(chosenBookEl);
			}
		});

		// Store data to send to database in a var
		// var chosenBook = 

		// user adds book to their database (send to firebase)
		// dbRef.push('hello!');
		// display on left from firebase
		// button that deletes item from firebase - therefore deleting from our website
	});
};

// retrieve information from firebase
bookApp.showData = function () {
	bookApp.dbRef.on('value', function (data) {});
};

bookApp.init = function () {
	bookApp.firebase();
	bookApp.events();
};

var goodreadsKey = '3Hm2ArDCENyN8Hp1Xu8GBQ';

// Upon submission of the form empty the results, style the page (first submission), search the api for results with the value of the users search
bookApp.events = function () {
	$(".userSearch").submit(function (e) {
		e.preventDefault();
		$(".booksToDiscover").empty();

		var authorName = $("#search").val();
		$('.header').removeClass('initStyle').addClass('style');
		$('.headerBottom').removeClass('yourBooksHidden').addClass('yourBooks');
		$('main').removeClass('mainHidden');
		$('.userInput').addClass('userFormHidden');
		bookApp.findAuthor(authorName);
		// Prevent submission of homepage search if both fields are empty
		// if ($('') {

		// });
	});

	// Click event to add to users collection here
	$('.booksToDiscover').on("click", ".chosenBook", function (e) {
		e.preventDefault();
		bookApp.selectBookTitle = $(this).attr('value');

		bookApp.dbRef.push(bookApp.selectBookTitle);
	});
};

// Make a first call to the API based on the users input (authors name), in submit event above. 
bookApp.findAuthor = function (authorName) {
	$.ajax({
		url: "http://proxy.hackeryou.com",
		method: "GET",
		dataType: "json",
		data: {
			reqUrl: "https://www.goodreads.com/api/author_url/<" + authorName + ">",
			params: {
				id: authorName,
				key: goodreadsKey
			},
			xmlToJSON: true
		}
	}).then(function (res) {
		var authorID = res.GoodreadsResponse.author.id;
		bookApp.findBooks(authorID);
	});
};

// Make a second call to the API to pull the following pages of books, based on bookApp.findBooks
bookApp.getMoreBooks = function (authorID, pageNum) {
	return $.ajax({
		url: "http://proxy.hackeryou.com",
		method: "GET",
		dataType: "json",
		data: {
			reqUrl: 'https://www.goodreads.com/author/list.xml',
			params: {
				id: authorID,
				key: goodreadsKey,
				page: pageNum
			},
			xmlToJSON: true
		}
	});
};

bookApp.findBooks = function (authorID) {
	$.ajax({
		url: "http://proxy.hackeryou.com",
		method: "GET",
		dataType: "json",
		data: {
			reqUrl: 'https://www.goodreads.com/author/list.xml',
			params: {
				id: authorID,
				key: goodreadsKey
			},
			xmlToJSON: true
		}
	}).then(function (res) {
		res = res.GoodreadsResponse;
		var totalBooks = res.author.books.total;
		var pageNums = Math.ceil(totalBooks / 30);
		if (totalBooks < 30) {} else {
			var _$;

			//run a call until currentPage === pageNum
			//then get all the data
			var pageCalls = [];
			for (var i = 2; i <= pageNums; i++) {
				pageCalls.push(bookApp.getMoreBooks(authorID, i));
			}
			(_$ = $).when.apply(_$, pageCalls).then(function () {
				for (var _len = arguments.length, bookData = Array(_len), _key = 0; _key < _len; _key++) {
					bookData[_key] = arguments[_key];
				}

				bookData = bookData.map(function (books) {
					return books[0];
				});
				res = {
					GoodreadsResponse: {
						Request: res.Request,
						author: res.author
					}
				};
				bookData.unshift(res);
				bookApp.displayInfo(bookData);
			});
		}
	});
};

bookApp.displayInfo = function (bookData) {
	// let goodReadsObjects = bookData.filter(function(bookArray){
	// 	let authorName = $('#search').val();
	// 	return bookArray.GoodreadsResponse.author.name === authorName;
	bookData.forEach(function (obj) {
		var authorsBooks = obj.GoodreadsResponse.author.books.book;
		authorsBooks.forEach(function (book) {

			bookApp.displayTitle = book.title;
			bookApp.bookTitle = $('<h3>').html(book.title);
			bookApp.bookDescription = $('<p>').html(book.description);

			var bookImage = $('<img>').attr("src", book.image_url);
			if (book.image_url === "https://s.gr-assets.com/assets/nophoto/book/111x148-bcc042a9c91a29c1d680899eff700a03.png") {
				bookImage = $('<img>').attr("src", "Assets/cover-img.png");
			}

			// Make add to collection button appear with value of book title, we an call later
			bookApp.bookButton = $("<button class=\"chosenBook\" value=\"" + book.title + "\">").html('<i class="fa fa-plus-circle" aria-hidden="true"></i>').data({
				title: book.title });

			// Make ? button with value of book info, so we can call it later
			bookApp.descriptionButton = $("<button class=\"bookDescript\" value=\"<h3>" + book.title + "</h3><p>" + book.description + "</p>\">").html('<i class="fa fa-question-circle" aria-hidden="true"></i>');
			var allButtons = $('<div class="bookIcons">').append(bookApp.descriptionButton, bookApp.bookButton);
			var bookDisplay = $('<div class="bookDiv">').append(bookImage, bookApp.bookTitle, allButtons);

			$('.booksToDiscover').append(bookDisplay);
			// $('.modal').append(bookApp.bookTitle, bookDescription, );
		});
	});
	// Make modal appear on ? button click and append title + description
	$('.bookDescript').click(function (e) {
		e.preventDefault();
		var thisBookDesc = $(this).val();
		$('.modalInside').append(thisBookDesc);
		$('.modal').removeClass('modalHidden');
	});
	// Make Modal disappear on ? button click
	$('.modal').click(function (e) {
		e.preventDefault();

		$('.modal').addClass('modalHidden');
		// modal.style.display = "block";
		// console.log(this);
		$('.modalInside').empty();
	});
};

$(function () {
	bookApp.init();

	var body = $('body');

	$(document).on({
		ajaxStart: function ajaxStart() {
			body.addClass("loading");
		},
		ajaxStop: function ajaxStop() {
			body.removeClass("loading");
		}
	});
});
