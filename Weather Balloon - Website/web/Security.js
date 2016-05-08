/*
 * 
 */

/*This method encodes a string, the password in this program. The method returns a byte array converted to a string.
  This is done so the encoded byte array can be stored in the database as a string. */
function encode(string) {
    //converts the string to an array buffer
    var buffer = new ArrayBuffer(string.length*2);
    var bufView = new Uint16Array(buffer);
    //stores each character in the string
    for (var i=0, strLen=string.length; i < strLen; i++) {
        bufView[i] = string.charCodeAt(i);
    }
    //converts the array buffer to a byte array
    var byteArray = new Uint8Array(buffer);
    //encodes the byte array using an rc4 encryption method and a secret key
    encodedByteArray = rc4(unobfuscate(x), byteArray);
    //returns the encoded byte array
    return encodedByteArray.toString();
  }
  
  //This method decodes the encoded password. It returns the decoded password so the program can verify a users login
  function decode(string){
  //converts the encoded byte array to a string array    
  array = string.split(",");
  //decodes the password using the same rc4 encryption method and the same secret key
  array = rc4(unobfuscate(x),array);
  //converts the decoded password back to characters 
  var result = "";
  for (var i = 0; i < array.length; i++) {
    result = String.fromCharCode.apply(null, array);
  }
  //converts the encoded password to a final string result
  var final = "";
  for(var i = 0; i < result.length; i = i+2){
      final = final + result[i];
  }
  //returns the decoded password as a string
  return final;
  }

  //This is the main rc4 encryption/decryption method used to provide security to the websites passwords 
  function rc4(key, byteArray) {
      //creates an array with 256 elements, this will be the array we xor with our string
      var stream = new Uint8Array(256);
      var encodedByteArray = byteArray;
      //filling the stream array with integars 
      for (var i = 0; i < stream.length; i++) {
          stream[i] = i;
      }
      var j = 0;
      var x = 0;
      //randomized the stream array based on a secret key
      for (i = 0; i < stream.length; i++) {
          j = (j + stream[i] + key.charCodeAt(i % key.length)) % 256;
          x = stream[i];
          stream[i] = stream[j];
          stream[j] = x;
      }

      i = 0;
      j = 0;
      //xors the stream array with the input string. If the string in not encoded, this will encoded it.
      //If the string is encoded, this will decode it.
      for (var y = 0; y < byteArray.length; y++) {
          var temp = encodedByteArray[y];
          i = (i + 1) % 256;
          j = (j + stream[i]) % 256;
          x = stream[i];
          stream[i] = stream[j];
          stream[j] = x;

          encodedByteArray[y] = stream[(stream[i] + stream[j]) % 256] ^ temp;
      }

      // returns the encrypted/decrypted byte array
      return encodedByteArray;
  }
 
//variables needs to perform obfuscate and unobfucate methods
var source="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
var target="Q9A8ZWS7XEDC6RFVT5GBY4HNU3J2MI1KO0LP";
var x = "Q86XR2MI1K";

//obfuscates a string
function obfuscate(s) {
    var result = [];
    for (var i=0;i<s.length;i++) {
        var c=s.charAt(i);
        var index=source.indexOf(c);
        result[i]=target.charAt(index);
    }

    //returns an encrypted string 
    return result.join("");
}
  
  //unobfuscates a string
  function unobfuscate(s) {
    var result = [];
    for (var i=0;i<s.length;i++) {
        var c=s.charAt(i);
        var index=target.indexOf(c);
        result[i]=source.charAt(index);
    }
    
    //returns a decrypted string
    return result.join("");
}

