const axios = require("axios"); 
const dotenv = require("dotenv"); 
const fs = require('fs') 
 
dotenv.config() 
 

 
const API_TOKEN = process.env.API_TOKEN  ; 
const API = process.env.API  ; 
 
 
const headers = { 
    'Authorization': bearer ${API_TOKEN} 
} 
 
 async function  getWrikeTask(headers) { 
 
    
     
    const response =  await axios.get(API, { headers }); 
    const data = response.data; 
    const tasks = data.data.map(d => ({ 
        id: d.id, 
        name: d.title, 
        assignee: d.accountId, 
        status: d.importance, 
        collections: d.parentIds, 
        created_at: d.createdDate, 
        updated_at: d.updatedDate, 
        ticket_url: d.permalink 
    }));   
    return tasks 
 
} 
 
 
 
 function writeJson(data){ 
         
    const fileSaveData = JSON.stringify({...data}) 
 
    fs.writeFile('tasks.json', fileSaveData, (err) => { 
        if (err) throw err; 
        console.log('File has been saved!'); 
      }); 
 
} 
 
(async () => { 
    const tasks = await getWrikeTask(headers); 
    console.log(tasks) 
    writeJson(tasks) 
})();