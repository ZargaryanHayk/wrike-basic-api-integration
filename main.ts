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
        createdDate: string;
        completedDate: string;
    },
    title:string;
    id: string;
    tasks:object
   

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
        users:string[]
    
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
    responsibleIds: string[] 

}


const headers = {
    'Authorization': `bearer ${API_TOKEN}`
}

async function getWrikeProjectsId(): Promise <Project[]> {
    const response = await axios.get(API_PROJECT, { headers });
    const data = response.data;
    ;

    const Projectinfo : Project[] = data.data
    .filter((element: Project) => element.project && element.title)
    .map((element: Project) => {
        return{
            name:element.title,
            id:element.id,
            createdDate: element.project.createdDate,
            completedDate: element.project.completedDate

        }

    })






    return Projectinfo;
}


async function getWrikeTask(Myproject: Project[]) {
    const tasks: { [key: string]: Task[] } = {};

    await Promise.all(
        Myproject.map(async (e: Project) => {
            const API_TASK = `https://www.wrike.com/api/v4/folders/${e.id}/tasks?fields=[responsibleIds]`;
            const response = await axios.get(API_TASK, { headers });
            const data = response.data;
            e["tasks"] = data.data.map((d: MyData) => ({
                id: d.id,
                name: d.title,
                assignee: d.accountId,
                status: d.status,
                collections: d.parentIds,
                created_at: d.createdDate,
                updated_at: d.updatedDate,
                ticket_url: d.permalink,
                users: d.responsibleIds,
            }));
        })
    );
    return Myproject;
}
    


 function writeJson(data: Project[]){
        
    const fileSaveData = JSON.stringify([data],null, 2)

    fs.writeFile('task.json', fileSaveData, (err) => {
        if (err) throw err;
        console.log('File has been saved!');
      });

}

(async () => {
    const elementArray: Project[] = await getWrikeProjectsId();
    const Myproject = await getWrikeTask(elementArray);
    console.log(Myproject)
    writeJson(Myproject);
})();