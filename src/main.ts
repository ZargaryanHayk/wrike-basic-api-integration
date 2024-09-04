import axios from 'axios';
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
    users: string[];
    assignees: object[]
    
}

interface User {
        id:string    
        firstName: string;
        lastName: string;
        Email: string;
        profiles: {
            admin: boolean;
            owner: boolean;
        };
    
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

async function getWrikeTask(): Promise<{ allTasks: Task[], uniqueIds: Set<string> }> {
    
    const uniqueId: string[] = [];

    try {
        const response = await axios.get('https://www.wrike.com/api/v4/tasks?fields=[parentIds,sharedIds]', { headers });
        const body: IsendedData[] = response.data.data;

        const allTasks = body.map((d)=> {
            for (const id of d.sharedIds) {
                uniqueId.push(id);
            }
            return{
                id: d.id,
                name: d.title,
                status: d.status,
                collections: d.parentIds,
                created_at: d.createdDate,
                updated_at: d.updatedDate,
                ticket_url: d.permalink,
                users: d.sharedIds,
                assignees: []
                
            };

            
        })

        
        const uniqueIdsSet = new Set(uniqueId);

        return { allTasks, uniqueIds: uniqueIdsSet };
        
    } catch (error) {
        console.error('Error fetching tasks:', error);
        
        throw error; 
    }
}


async function getUserData(uniqueIds:Set<String>) :Promise<User[]>{
    
    const usersData = [] 

    try{

        for(const id of uniqueIds){
            
            const response = await axios.get(`https://www.wrike.com/api/v4/users/${id}`,{headers}) 
            const body = response.data.data
            usersData.push(
                {
                    id:         body[0].id,
                    firstName:  body[0].firstName,
                    lastName:   body[0].lastName,
                    Email:      body[0].primaryEmail,
                    profiles:{
                        admin:  body[0].profiles[0].admin,
                        owner:  body[0].profiles[0].owner
                    }})}
    }catch{
        null
    }
    return usersData


}



function joiningTask2assignees(allTasks:Task[],userData:User[] ){


    for(const userId of allTasks){
        for(const user of userData){
           if( userId.users.includes(user.id)){
            userId.assignees.push(user)
           }

        }
    }

    return allTasks;
    


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
    const {allTasks, uniqueIds}  = await getWrikeTask();
   
    const userData = await getUserData(uniqueIds)
    const task = joiningTask2assignees(allTasks,userData)
    const finalData = joiningProject2Task(Projects,task)
    await writeJson(finalData);
})();