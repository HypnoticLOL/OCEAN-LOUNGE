fetch ("/call")
.then(response => response.text())
.then(data => {
  guestbook_file.innerHTML = data;
})
.catch(error => {
  throw error;
});