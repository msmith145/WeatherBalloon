 //opens the database
 var database = TAFFY();
 
 //This method stores the weather balloon data in the database
 function store(array,name){ 
     //opens the storedGraphData table
  database.store("storedGraphData");
  //uncomment to empty the storedGraphTable
  //database().remove();
  //inserts the data into the storedGraphData table
  database.insert({data:array,name:name}); 
 }
   
 //This method begins the process of displaying all the weather balloon data stored in the storedGraphData
 //table. The data will be displayed on the Weather.html page
function print(){
 //iterates through the storedGraphData table in order to print each entry
    database("storedGraphData").each(function (data) {
        var input = [];
        var id = [];
        //selects an entrys data and id
        input = database(data).select("data");
        id = database(data).select("___id");
    
        //creates a blob url with the data
        var inputBlob  = new Blob(input[0]);
        var inputBlobURL = window.URL.createObjectURL(inputBlob);
        
        /*runs the TempGraph method from Weather.html
        uses the blob url and id from each data entry to create a Temperature vs Time graph
        each other graph will be called once TempGraph is called
        to be discussed further in Weather.html */
        TempGraph(inputBlobURL,id[0]);
    });    
 } 
     
            
            
            
            
            
            
            
            