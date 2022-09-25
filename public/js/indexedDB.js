let db;
const request = indexedDB.open("budget-tracker", 1);

request.onupgradeneeded = function(event) {
  const db = event.target.result;
  db.createObjectStore('newBudget', { autoIncrement: true });
};


request.onsuccess = function (event) {
  db = event.target.result;

  if (navigator.onLine) {
    uploadBudget();
  }
};

request.onerror = function (event) {
  console.log("Error: " + event.target.errorCode);
};

function saveRecord(record) {
  const transaction = db.transaction(["newBudget"], "readwrite");
  const store = transaction.objectStore("newBudget");
  store.add(record);
}

function uploadBudget() {
  const transaction = db.transaction(["newBudget"], "readwrite");
  const store = transaction.objectStore("newBudget");

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
          const transaction = db.transaction(["newBudget"], "readwrite");
          const store = transaction.objectStore("newBudget");
          store.clear();
        });
    }
  };
}
function deletePending() {
  const transaction = db.transaction(["newBudget"], "readwrite");
  const store = transaction.objectStore("newBudget");
  store.clear();
}

window.addEventListener("online", uploadBudget);