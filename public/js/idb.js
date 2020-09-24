// I followed module 18, lesson 4 to set-up IndexedDB //

// create variable to hold db connection
let db;
// establish a connection to IndexedDB database called 'budget_tracker' and set it to version 1
const request = indexedDB.open('budget_tracker', 1);

// this event will emit if the database version changes (nonexistant to version 1, v1 to v2, etc.)
request.onupgradeneeded = function(event) {
    // save a reference to the database 
    const db = event.target.result;
    // create an object store (table) called `pending_transaction`, set it to have an auto incrementing primary key of sorts 
    db.createObjectStore('pending_transaction', { autoIncrement: true });
  };


  // upon a successful 
request.onsuccess = function(event) {
    // when db is successfully created with its object store (from onupgradedneeded event above) or simply established a connection, save reference to db in global variable
    db = event.target.result;
  
    // check if app is online, if yes run uploadPizza() function to send all local db data to api
    if (navigator.onLine) {
      checkDatabase();
    }
  };
  
  request.onerror = function(event) {
    // log error here
    console.log("Sorry!" + event.target.errorCode);
  };

  // function that is called in index.js when user is offline:
  function saveRecord(record) {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
  
    store.add(record);
  }
  
  // function that is called when user goes back online:
  function checkDatabase() {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    const getAll = store.getAll();
  
    getAll.onsuccess = function () {
      if (getAll.result.length > 0) {
        fetch("/api/transaction/bulk", {
          method: "POST",
          body: JSON.stringify(getAll.result),
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json"
          }
        })
          .then(response => response.json())
          .then(() => {
            // delete records if successful
            const transaction = db.transaction(["pending"], "readwrite");
            const store = transaction.objectStore("pending");
            store.clear();
          });
      }
    };
  }
  function deletePending() {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    store.clear();
  }
  
  // listen for when coming back online:
  window.addEventListener("online", checkDatabase);