fetch ("/call")
.then(response => response.text())
.then(data => {
  scan.innerHTML = data;
})
.catch(error => {
  throw error;
});