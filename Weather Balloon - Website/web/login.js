//This method ensures that the admins login information is valid. This file uses methods from security.js
function adminLogin(username, password){
   //change username and password - replace with obfuscated strings
   //the admins username and password are obfuscated
   var x = obfuscate("ADMIN");
   var y = obfuscate("ADMIN");
   //the admins login information is stored in an array
   loginInfo = [x,y];
   
   //checks if the unobfuscated username and password are valid
   if(unobfuscate(loginInfo[0]) === username && unobfuscate(loginInfo[1]) === password){
       //hides the login screen and shows the admin functions
       document.getElementById("edit").style.display="inline-block";
       document.getElementById("adminLogin").style.display="none";
       //reset the login text boxes
       document.getElementById("username").value=""; 
       document.getElementById("password").value=""; 
   }
   //if the login is invalid, alert the user as such
   else{
       alert("Invalid Login");
   } 
}
