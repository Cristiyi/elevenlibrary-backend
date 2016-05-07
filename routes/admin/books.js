var Book = require('../../models/Book.js');
var BookProp = require('../../models/BookProp.js');
var History = require('../../models/History.js');
var filter = require('../../models/Filter.js');

module.exports = function(app) {
  // add one book
  app.get('/api/admin/books', filter.adminAuthorize, function(req, res) {
    Book.find(function(err, books) {
      if (err) {
        console.log("[Query books] DB error !");
        res.send(err);
      } else {
        BookProp.find(function(err, booksprop) {
          if (err) {
            console.log("[Query BookProp] DB error !");
            res.send(err);
          } else {
            var newBooks = [];
            for (var i = 0; i < books.length; i++) {
              for (var j = 0; j < booksprop.length; j++) {
                if (books[i].isbn == booksprop[j].isbn) {
                  var book = {};
                  book.unqId = books[i].unqId;
                  book.isbn = books[i].isbn;
                  book.status = books[i].status;
                  book.applyTime = books[i].applyTime;
                  book.borrowTime = books[i].borrowTime;
                  book.returnTime = books[i].returnTime;
                  book.intrID = books[i].intrID;
                  book.borrower = books[i].borrower;
                  book.name = booksprop[j].name;
                  book.category = booksprop[j].category;
                  book.desc = booksprop[j].desc;
                  book.publisher = booksprop[j].publisher;
                  book.author = booksprop[j].author;
                  book.pageCount = booksprop[j].pageCount;
                  book.price = booksprop[j].price;
                  book.count = booksprop[j].count;
                  book.image = booksprop[j].image;
                  book.likes = booksprop[j].likes;
                  book.rates = booksprop[j].rates;
                  book.comments = booksprop[j].comments;
                  newBooks.push(book);
                  break;
                };
              };
            };
            res.send(newBooks);
          };
        });
      }; //booksprop
    }); //books
  });
  // add one book
  app.post('/api/admin/books', filter.adminAuthorize, function(req, res) {
    // console.log(req.body);
    var param = req.body;

    // status: param.status==0?param.status:0, //0-free,1-reserved,2-borrowed
    var newBook = {
      unqId: param.unqId,
      isbn: param.isbn,
      status: 0,
      name: param.name,
      category: param.category,
      intrID: param.intrID,
    };


    Book.findOne({
      unqId: newBook.unqId
    }, function(err, book) {
      if (err) {
        console.log('[Add a book]DB find a book err : ' + err);
      } else if (book) {
        console.log('[Add a book]This book exists');
        res.json({
          'errType': 1
        });
      } else {
        Book.create(newBook, function(err, newBook) {
          if (err) {
            console.log('[Add a book]DB insert book err : ' + err);
            res.json({
              'errType': 3
            });
          } else if (!newBook) {
            console.log('[Add a book]DB insert book Fail');
            res.json({
              'errType': 3
            });
          } else {
            BookProp.findOne({
              isbn: newBook.isbn
            }, function(err, bookprop) {
              if (err) {
                console.log('[Add a book]Find isbn err : ' + err);
              } else if (bookprop) {
                //        BookProp.update({isbn: bookprop.isbn},{count: bookprop.count+1}, function(err, bookprop1){
                //          if(err){
                //            console.log('[Update bookProp]update bookprop count err : ' + err);
                // res.json({
                //  'errType': 3
                // });
                //          }
                //          else if(bookprop1.nModified){
                //            console.log('[Update bookProp]update bookprop count Successfull');
                //            // console.log(bookprop1);
                // res.json({
                //  'errType': 0
                // });
                //          }else{
                //            console.log('[Update bookProp] No update for bookprop');
                // res.json({
                //  'errType': 3
                // });
                //          }
                //        });
                var amdfBook = {
                    name: param.name,
                    image: param.image,
                    category: param.category,
                    author: param.author,
                    publisher: param.publisher,
                    pageCount: param.pageCount,
                    price: param.price,
                    desc: param.desc,
                    count: bookprop.count + 1,
                  }
                  // console.log(amdfBook);

                BookProp.update({ isbn: param.isbn }, amdfBook, function(err, ambookprop) {
                  if (err) {
                    console.log('[update bookprop info]update book info err : ' + err);
                    //delete the book just added
                    res.json({
                      'errType': 3
                    });
                  } else if (ambookprop.ok || ambookprop.nModified) {
                    console.log(ambookprop.nModified);
                    Book.update({ isbn: param.isbn }, { name: amdfBook.name }, function(err, ambook) {
                      if (err) {
                        console.log('[update book info]update book name err : ' + err);
                      } else if (ambook.ok || ambook.nModified) {
                        console.log('[update book info]update book Successfull');
                        res.json({
                          'errType': 0
                        });
                      } else {
                        console.log('[update book name]update book name Fail');
                      }
                    });
                  } else {
                    console.log('[update book info]update book Fail');
                    res.json({
                      'errType': 3
                    });
                  }
                });

              } else {
                var newBookProp = {
                  isbn: param.isbn,
                  name: param.name,
                  category: param.category,
                  desc: param.desc,
                  publisher: param.publisher,
                  author: param.author,
                  pageCount: param.pageCount,
                  price: param.price,
                  count: 1,
                  image: param.image
                };
                BookProp.create(newBookProp, function(err, newBookProp) {
                  if (err) {
                    console.log('[Add a bookProp]Insert bookprop err : ' + err);
                    res.json({
                      'errType': 3
                    });
                  } else if (newBookProp) {
                    console.log('[Add a bookProp]Insert bookprop Successfull');
                    res.json({
                      'errType': 0
                    });
                  } else {
                    console.log('[Add a bookProp]Insert bookprop Fail');
                    res.json({
                      'errType': 3
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  });

  // delete one book
  app.delete('/api/admin/book/:unqId', filter.adminAuthorize, function(req, res) {
    //console.log(req.params);
    var delunqID = req.params.unqId;
    Book.findOne({
      unqId: delunqID
    }, function(err, book) {
      if (err) {
        console.log('[Delete a book]DB find a book err : ' + err);
        res.json({
          'errType': 3
        });
      } else if (!book) {
        console.log('[Delete a book]No this book');
        res.json({
          'errType': 1
        });
      } else {
        var hisbook = {
          unqId: book.unqId,
          isbn: book.isbn,
          name: book.name,
          delTime: new Date(),
          borrower: book.borrower
        };
        // if(book.intrID){
        //  var addborrower = {
        //    intrID: book.intrID,
        //    name: book.name
        //  };
        //  hisbook.borrower.push(addborrower);
        // };
        // console.log("delete book useless attribute : ");
        // console.log(hisbook);

        Book.remove({ unqId: book.unqId }, function(err, delBook) {
          if (err) {
            console.log('[Delete a book]DB delete a book err : ' + err);
            res.json({
              'errType': 3
            });
          } else if (delBook) {
            BookProp.findOne({
              isbn: book.isbn
            }, function(err, bookprop) {
              if (err) {
                console.log('[Delete a book]Find isbn err : ' + err);
              } else if (bookprop) {
                BookProp.update({ isbn: bookprop.isbn }, { count: bookprop.count - 1 }, function(err, mbookprop) {
                  if (err) {
                    console.log('[Update bookProp count]update bookprop count err : ' + err);
                  } else if (mbookprop.nModified) {
                    console.log('[Update bookProp count]update bookprop count Successfull');
                    History.findOne({ unqId: book.unqId }, function(err, hbook) {
                      if (err) {
                        console.log('[Find History]DB insert book err : ' + err);
                      } else if (!hbook) {
                        History.create(hisbook, function(err, newhbook) {
                          if (err) {
                            console.log('[Insert History]DB insert book err : ' + err);
                          } else if (!newbook) {
                            console.log('[Insert History]DB insert book Fail');
                          } else {
                            console.log('[Insert History]DB insert book Successfull');
                          }
                        });
                      } else {}
                    });
                    res.json({
                      errType: 0
                    });
                  } else {
                    console.log('[Update bookProp count] No update for bookprop');
                  }
                });
              }
            });
          } else {
            console.log("[Delete book Fail]");
            // console.log(delBook);
          };
        });
      }
    });
  });

  //modify one book
  app.put('/api/admin/book/unqId', filter.adminAuthorize, function(req, res) {
    // console.log(req.body);
    var param = req.body;
    var mdfBook = {
        name: param.name,
        image: param.image,
        category: param.category,
        author: param.author,
        publisher: param.publisher,
        pageCount: param.pageCount,
        price: param.price,
        desc: param.desc
      }
      // console.log(mdfBook);

    BookProp.update({ isbn: param.isbn }, mdfBook, function(err, bookprop4) {
      if (err) {
        console.log('[update bookprop info]update book info err : ' + err);
        res.json({
          'errType': 3
        });
      } else if (bookprop4.ok || bookprop4.nModified) {
        console.log(bookprop4.nModified);
        Book.update({ isbn: param.isbn }, { name: mdfBook.name }, function(err, book1) {
          if (err) {
            console.log('[update book info]update book name err : ' + err);
          } else if (book1.ok || book1.nModified) {
            console.log('[update book info]update book Successfull');
            res.json({
              'errType': 0
            });
          } else {
            console.log('[update book name]update book name Fail');
          }
        });
      } else {
        console.log('[update book info]update book Fail');
        res.json({
          'errType': 3
        });
      }
    });
  });
  //search the isbn info when add a book
  app.get('/api/admin/add/book/:isbn', filter.adminAuthorize, function(req, res) {
    BookProp.findOne({ isbn: req.params.isbn }, function(err, bookprop) {
      res.json(bookprop);
    });
  });

};
