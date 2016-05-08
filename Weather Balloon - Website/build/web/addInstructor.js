//opens the database
var database = TAFFY();
//opens the login table
database.store("Login");

//This method add a new instructors username and password combination into the database.
function addInstructor(username,password,userID,passwordID){
//checks if any required inputs are empty, and alerts the user is so
if(username === "" || password === ""){
    alert("You are missing a required field");
}
//checks if both fields are present
else{
    var check = false;
    //iterates through the login table and checks to see if the given username and password combination match
    //any combination already present in the database
    database("Login").each(function (data) {
        var uName = database(data).select("instructorUsername");
        var pWord =  database(data).select("instructorPassword");
        //decodes the passwords already stored in the database
        var decodedPassword = decode(pWord[0]);
        
        if(uName[0] === username && decodedPassword === password){
            check = true;   
        }
     });
     //alerts the user is the username and password combination already exists
    if(check === true){
        alert("This username and password already exists");
    }
    //checks if the combination is unique
    else { 
        //resets the text boxes
        document.getElementById(userID).value=""; 
        document.getElementById(passwordID).value=""; 
        
        //uncomment to clear the login table
       //database().remove();
       //encodes the given password before inserting it into the database
        password = encode(password);
        //inserts the given combination into the login table
        database.insert({instructorUsername:username,instructorPassword:password});
        //retrives the given combination from the database
        var addedUsername = database({instructorUsername:username}).get();
        var addedPassword = database({instructorPassword:password}).get();
    
        var uName = database(addedUsername).select("instructorUsername");
        var pWord =  database(addedPassword).select("instructorPassword");
        //alerts the user that the given combination has been added successful
        alert("Instructor with username: "+uName[0]+" and password: "+decode(pWord[0])+" has been added.");
    }
  }
}

//This method ensures that an instructors login information is valid
function instructorLogin(username,password){ 
  var bool = false; 
  //iterates through the login table to check is the given username and password combination exists or not
  database("Login").each(function (data) {

    inputUsername = database(data).select("instructorUsername");
    inputPassword = database(data).select("instructorPassword");
    
    var decodedPassword = decode(inputPassword[0]);
   //checks if the login is valid
   if(inputUsername[0] === username && decodedPassword === password){
       bool = true;
       //hide the login screen and show the instructors avaiable functions, and reset the login text boxes
       document.getElementById("uploadData").style.display="inline-block";
       document.getElementById("instructorLogin").style.display="none";
       
       document.getElementById("instructorUsername").value=""; 
       document.getElementById("instructorPassword").value="";
   }
  });
  //if the login is invalid, alert the user as such
  if(bool === false){
       alert("Invalid Login");
  }
}

