import axios, { all, AxiosRequestConfig } from 'axios';
import { log, profile } from 'console';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { get } from 'http';


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

interface IProject {

    project: {
        ownerIds: string[]
        createdDate: string;
        completedDate: string;
    },
    title:string;
    id: string;
    tasks:object[]
   

}





interface Task {
    id: string;
    name: string;
    status: string;
    collections: string[];
    created_at: string;
    updated_at: string;
    ticket_url: string;
    assignees: {
        firstName: string;
        lastName: string;
        primaryEmail: string;
        profiles: {
            admin: boolean;
            owner: boolean;
        };
    }[];
}

interface IsendedData{
    id: string 
    title: string 
    accountId: string 
    status: string 
    createdDate: string 
    updatedDate: string 
    permalink: string
    responsibleIds: string[]
    parentIds: string[]
    sharedIds: string[]

}


const headers = {
    'Authorization': `bearer ${API_TOKEN}`
}

async function getWrikeProjectsId(): Promise <IProject[]> {
    const response = await axios.get(API_PROJECT, { headers });
    const data = response.data;
    ;

    const Projectinfo : IProject[] = data.data
    .filter((element: IProject) => element.project && element.title)
    .map((element: IProject) => {
        return{
            name:element.title,
            id:element.id,
            createdDate: element.project.createdDate,
            completedDate: element.project.completedDate,
            tasks: []
            

        }

    })


    return Projectinfo;
}

async function getWrikeTask(): Promise<Task[]> {
    try {
        const response = await axios.get('https://www.wrike.com/api/v4/tasks?fields=[parentIds,sharedIds]', { headers });
        const body: IsendedData[] = response.data.data;

        const allTasks = await Promise.all(body.map(async (d: IsendedData) => {
            const assignees = [];

            for (const id of d.sharedIds) {
                try {
                    const userResponse = await axios.get(`https://www.wrike.com/api/v4/users/${id}`, { headers });
                    const userBody = userResponse.data;

                    for (const u of userBody.data) {
                        assignees.push({
                            firstName: u.firstName,
                            lastName: u.lastName,
                            primaryEmail: u.primaryEmail,
                            profiles: {
                                admin: u.profiles[0].admin,
                                owner: u.profiles[0].owner,
                            },
                        });
                    }
                } catch (error) {
                    console.error(`Failed to fetch user with id ${id}:`, error);
                }
            }

            return {
                id: d.id,
                name: d.title,
                status: d.status,
                collections: d.parentIds,
                created_at: d.createdDate,
                updated_at: d.updatedDate,
                ticket_url: d.permalink,
                assignees: assignees,
            };
        }));

        return allTasks;
    } catch (error) {
        console.error('Failed to fetch tasks:', error);
        return [];
    }
}


function joiningProject2Task(projects:IProject[],task:Task[]) {
    
    
    for(const i of projects){
        for(const j of task){
            
            if(i.id === j.collections[0]){
                i.tasks.push(j)
            }
        }
        
    }
    
    return projects
    
}

async function writeJson(data: object[]){
        
    const fileSaveData = JSON.stringify(data,null, 2)

  new Promise(function(resolve, reject) {
    fs.writeFile("task.json", fileSaveData, function(err) {
        if (err){
            reject(err);
        } 
        else resolve(data);
    });
})
}

(async () => {
    const Projects: IProject[] = await getWrikeProjectsId();
    const task = await getWrikeTask();
    const finalData = joiningProject2Task(Projects,task)
    await writeJson(finalData);
})();