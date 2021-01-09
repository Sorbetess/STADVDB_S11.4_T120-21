function pressedEnter(event) {
    if(event.keyCode === 13)
        checklogin()
}

/** This function returns whether or not there is a previous page. */
function isTherePrevPage(currentPage) {
    // return false if the current page is 1
    return currentPage <= 1 ? false : true;
  }
  
  /** This function returns whether or not there is a next page. */
  function isThereNextPage(queryCount, limit, currentPage) {
    var lastPage = queryCount / limit;
  
    // return false if the number of queries is less than 1 page, or if the current page is already the last page
    return (queryCount <= limit || currentPage >= lastPage) ? false : true;
    }