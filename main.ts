import axios, { AxiosRequestConfig } from 'axios';
import * as dotenv from 'dotenv';
import * as fs from 'fs';


dotenv.config()

// // id => 'id'
// // name => 'title'
// // assignee => 'accountId'
// // status => 'importance'
// // collections => 'parentIds'
// // created_at => 'createdDate'
// // updated_at => 'updatedDate'
// // ticket_url => 'permalink'

const API_TOKEN = process.env.API_TOKEN as string ;
const API = process.env.API as string ;

class Task { 
    id!: string 
    name!: string 
    assignee!: string 
    status!: string 
    collections!: string 
    created_at!: string 
    updated_at!: string 
    ticket_url!: string  
}
class MyData{
    id!: string 
    title!: string 
    accountId!: string 
    importance!: string 
    parentIds!: string 
    createdDate!: string 
    updatedDate!: string 
    permalink!: string
}


const headers = {
    'Authorization': `bearer ${API_TOKEN}`
}

const config: AxiosRequestConfig = {
    headers: headers
};

 async function  getWrikeTask() {

   
    
    const response =  await axios.get(API, { headers });
    const data = response.data;
    const tasks: Task[] = data.data.map((d: MyData )=> ({
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



 function writeJson(data:Task[]){
        
    const fileSaveData = JSON.stringify({...data})

    fs.writeFile(`${process.env.FILE_NAME}`, fileSaveData, (err) => {
        if (err) throw err;
        console.log('File has been saved!');
      });

}

(async () => {
    const tasks = await getWrikeTask();
    console.log(tasks)
    writeJson(tasks)
})();