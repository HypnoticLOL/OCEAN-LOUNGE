// Server
// Downloads and settings start here

const fs = require('fs');
const express = require('express');

const app = require('express')();
const http = require('http').Server(app);
const bodyParser = require('body-parser');

const port = process.env.PORT || 3000;
const io = require('socket.io')(http);
const sanitizer = require('sanitizer');

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

const sjcl = require('sjcl');

// Google Firestore

const {
	type,
	project_id,
	private_key_id,
	private_key,
	client_email,
	client_id,
	auth_uri,
	token_uri,
	auth_provider_x509_cert_url,
	client_x509_cert_url
} = process.env;

const serviceAccount = {
	type,
	project_id,
	private_key_id,
	private_key,
	client_email,
	client_id,
	auth_uri,
	token_uri,
	auth_provider_x509_cert_url,
	client_x509_cert_url
};

const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Routes

app.get('', function (req, res) {
  const index = __dirname + '/public/static/index.html';

  res.sendFile(index);
});

app.get('/test', function (req, res) {
  res.send("<style>body {background-color: powderblue;}</style>");
});

app.get('/call', async function (req, res) {
  const gbkRef = db.collection('gbk').doc('chatlog');
  const cleanDoc = await gbkRef.get();

  const all = cleanDoc.data().log;

  res.send(all);
});

app.post('/auth-create', async function (req, res) {
  const handle = req.body.handle;
  const pwd = req.body.pwd;

  let chandle = sanitizer.escape(handle);
  const cpwd = sanitizer.escape(pwd);

  const gbkRef = db.collection('gbk').doc('chatlog');
  const cleanDoc = await gbkRef.get();

  const all = cleanDoc.data().log;
  const encrypted_pwd = sjcl.encrypt(cpwd, cpwd);

  if (handle.includes("#")) {
    res.send("#");
  }

  if (chandle === "") {
    chandle = "Stupid dumb idiot who tried to XSS";
  }

  else {
    if (all.includes("#" + handle)) {
      res.send("taken");
    }

    else {
      const new_member = {
        log : "<section class='msg join' id='#" + chandle + "' pwd='" + encrypted_pwd + "'><strong>" + chandle + "</strong><hr/>Became a member of Ocean Lounge!</section><br/>" + all
      }

      await gbkRef.set(new_member);
      res.send("success");
    }
  }
});

app.post('/auth-login', async function (req, res) {
  const handle = req.body.handle;
  const pwd = req.body.pwd;

  const gbkRef = db.collection('gbk').doc('chatlog');
  const cleanDoc = await gbkRef.get();

  const all = cleanDoc.data().log;

  if (all.includes("#" + handle)) {
    if (all.includes(sjcl.encrypt(pwd, pwd))) {
      res.send(all);
    }

    else {
      res.send(all);
    }
  }

  else {
    res.send("!exists");
  }
});

app.post('/auth-post', async function (req, res) {
  const handle = req.body.handle;
  const msg = req.body.msg;
  const bgcolor = req.body.bgcolor;
  const border_type = req.body.border_type;
  const bcolor = req.body.bcolor;

  const gbkRef = db.collection('gbk').doc('chatlog');
  const cleanDoc = await gbkRef.get();

  const all = cleanDoc.data().log;

  const chandle = sanitizer.escape(handle);
  const cmsg = sanitizer.escape(msg);

  const new_Dat = {
    log : "<section class='msg' style='background-color: " + bgcolor + ";border-style: " + border_type + ";border-color:" + bcolor + ";'><strong>" + chandle + "</strong><hr/>" + cmsg + "</section><br/>" + all
  }

  await gbkRef.set(new_Dat);
  res.send("test");
});

http.listen(port, function(){
  console.log('listening on *:' + port);

  const gbkRef = db.collection('gbk').doc('chatlog');

  async function cleanGBK () {
    const cleanDoc = await gbkRef.get();

    if (!cleanDoc.exists) {
      const fix_data = {
        log : ""
      }

      await gbkRef.set(fix_data);
      console.log("SET FIX");
    }

    else {
      console.log("NO FIX NEEDED");
    }
  }

  cleanGBK();
});