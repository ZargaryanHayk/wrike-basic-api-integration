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

const API_PROJECT:string = 'https://www.wrike.com/api/v4/folders' 

interface Project {

    project: {
        ownerIds: string[]
    },
    title:string;
    id: string
}

interface Task { 

   

        id: string 
        name: string 
        assignee: string 
        status: string 
        collections: string 
        created_at: string 
        updated_at: string 
        ticket_url: string  
    
}
interface MyData{
    id: string 
    title: string 
    accountId: string 
    status: string 
    parentIds: string 
    createdDate: string 
    updatedDate: string 
    permalink: string
}


const headers = {
    'Authorization': `bearer ${API_TOKEN}`
}

async function getWrikeProjectsId(): Promise<[string, string][]> {
    const response = await axios.get(API_PROJECT, { headers });
    const data = response.data;
    const idAndTitle: [string, string][] = data.data
        .filter((element: Project) => element.project && element.title)
        .map((element: Project) => [element.id, element.title] as [string, string]);

    return idAndTitle;
}


 async function  getWrikeTask(elementArray: [string,string][]) {

        const tasks: { [key: string]: Task[] } = {};

        for(const [id, title] of elementArray){

            const API_TASK:string = `https://www.wrike.com/api/v4/folders/${id}/tasks`
            const response =  await axios.get(API_TASK, { headers });
            const data = response.data;
            tasks[title] = data.data.map((d: MyData) => ({
                id: d.id,
                name: d.title,
                assignee: d.accountId,
                status: d.status,
                collections: d.parentIds,
                created_at: d.createdDate,
                updated_at: d.updatedDate,
                ticket_url: d.permalink,
            }));
            
            }; 
            
        return tasks
}

    


 function writeJson(data: { [key: string]: Task[] }){
        
    const fileSaveData = JSON.stringify({...data})

    fs.writeFile('task.json', fileSaveData, (err) => {
        if (err) throw err;
        console.log('File has been saved!');
      });

}

(async () => {
    const elementArray: [string, string][] = await getWrikeProjectsId();
    const tasks = await getWrikeTask(elementArray);
    writeJson(tasks);
})();