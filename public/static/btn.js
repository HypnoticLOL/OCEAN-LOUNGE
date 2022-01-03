const handle = document.getElementById("handle");
const pwd = document.getElementById("pwd");
const error = document.getElementById("error");
const guestbook_file = document.getElementById("guestbook-file");

const localUser = localStorage.getItem("localuser-oceanlounge");
const localAuth = localStorage.getItem("localauth-oceanlounge");
let tempUser = localUser;
let tempAuth = localAuth;

const bgcolor = document.getElementById("bgcolor");
const border_type = document.getElementById("border-type");
const bcolor = document.getElementById("bcolor");
const msg = document.getElementById("msg");

const scan = document.getElementById("scan");

$("#scan").hide();
$("#alt-options").hide();

$("#create-gbk").click(function () {
  location.href = "/static/account.html";
});

$("#browse-gbk").click(function () {
  location.href = "/static/login.html";
});

$("#logo").click(function () {
  location.href = "/";
});

$("#account-create").click(function () {
  event.preventDefault(); 

  if (pwd.value === "") {
    return false;
  }

  fetch ("/auth-create", {
    method : "POST",
    headers : {
      "Content-Type" : "application/json"
    },
    body : JSON.stringify({
      handle : handle.value,
      pwd : pwd.value
    })
  })
  .then(response => response.text())
  .then(data => {
    if (data === "#") {
      error.innerText = "Username contains invalid character(s): #";
    }

    else {
      if (data === "taken") {
        error.innerText = "Username is taken.";
      }

      else {
        console.log(data);
        localStorage.setItem("localuser-oceanlounge", handle.value);
        localStorage.setItem("localauth-oceanlounge", pwd.value);
        location.href = "/";
      }
    }
  })
  .catch(error => {
    throw error;
  });
});

$("#account-login").submit(function () {
  event.preventDefault();

  fetch ("/auth-login", {
    method : "POST",
    headers : {
      "Content-Type" : "application/json"
    },
    body : JSON.stringify({
      handle : handle.value,
      pwd : pwd.value
    })
  })
  .then(response => response.text())
  .then(data => {
    if (data === "!exists") {
      error.innerText = "Account does not exist!";
    }

    else {
        const first_call = document.getElementById("#" + handle.value);
        const first_call_pwd = first_call.getAttribute('pwd');

        const verify = sjcl.decrypt(pwd.value, first_call_pwd);

        if (verify === pwd.value) {
          localStorage.setItem("localuser-oceanlounge", handle.value);
          localStorage.setItem("localauth-oceanlounge", pwd.value);
          location.href = "/";
        }

        else {
          error.innerText = "Incorrect password!";
        }
      }
  })
  .catch(error => {
    throw error;
  });
});

setTimeout(function () {
  fetch ("/auth-login", {
    method : "POST",
    headers : {
      "Content-Type" : "application/json"
    },
    body : JSON.stringify({
      handle : tempUser,
      pwd : tempAuth
    })
  })
  .then(response => response.text())
  .then(data => {
    if (data === "!exists") {
      $("#alt-options").hide();
      $("#logout").hide();
    }

    else {
      const first_call_pwd = document.getElementById("#" + tempUser).getAttribute("pwd");
      const verify = sjcl.decrypt(tempAuth, first_call_pwd);

      if (verify === tempAuth) {
        $("#btn-options").hide();
        $("#alt-options").show();

        document.getElementById("logged-in-as").innerText =  "Logged in as: " + tempUser;
      }

      else {
        console.log("Oh well");
      }
    }
  })
  .catch(error => {
    throw error;
  });
}, 100);

$("#logout").click(function () {
  localStorage.setItem("localuser-oceanlounge", "#####rgrgrhuh5u4");
  localStorage.setItem("localauth-oceanlounge", "##########dfjsuhf");
  location.href = "/";
});

$("#book-form").submit(function () {
  event.preventDefault();
  
  fetch ("/auth-login", {
    method : "POST",
    headers : {
      "Content-Type" : "application/json"
    },
    body : JSON.stringify({
      handle : tempUser,
      pwd : tempAuth
    })
  })
  .then(response => response.text())
  .then(data => {
    if (data === "!exists") {
      $("#alt-options").hide();
      $("#logout").hide();
    }

    else {
      const first_call_pwd = document.getElementById("#" + tempUser).getAttribute("pwd");
      const verify = sjcl.decrypt(tempAuth, first_call_pwd);

      if (verify === tempAuth) {
        fetch ("/auth-post", {
          method : "POST",
          headers : {
            "Content-Type" : "application/json"
          },
          body : JSON.stringify({
            handle : tempUser,
            msg : msg.value,
            bgcolor : bgcolor.value,
            border_type : border_type.value,
            bcolor : bcolor.value
          })
        })
        .then(response => response.text())
        .then(data => {
          console.log(data);

          fetch ("/call")
          .then(response => response.text())
          .then(data => {
            guestbook_file.innerHTML = data;
          })
          .catch(error => {
            throw error;
          });
        })
        .catch(error => {
          throw error;
        });

        msg.value = "";
        bgcolor.value = "";
        border_type.value = "";
        bcolor.value = "";
      }

      else {
        alert("You must be logged in to use the Ocean Lounge.");
      }
    }
  })
  .catch(error => {
    throw error;
  });
});

$("#refresh").click(function () {
  fetch ("/call")
  .then(response => response.text())
  .then(data => {
    scan.innerHTML = data;
  })
  .catch(error => {
    throw error;
  });
});