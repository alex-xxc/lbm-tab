//是否chrome插件
const isPlugin = !!(chrome?.storage?.sync||chrome?.storage?.local)
const storage = {
    get: async (key:string)=>{
        let data:any = '';
        if(isPlugin){
            const result = await (chrome.storage.sync||chrome.storage.local).get(key)
            data = result[key]||'';
        }else {
            data = localStorage.getItem(key)
        }
        try{
            return JSON.parse(data)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch(e:any){
            return data;
        }
    },
    set: async (key:string, value:any)=>{
        value = typeof value==='object'?JSON.stringify(value):value
        if(isPlugin){
            return (chrome.storage.sync||chrome.storage.local).set({[key]: value})
        }else {
            return localStorage.setItem(key, value)
        }
    },
    "SPACE":"space",
    "SELECTSPACE":"selectSpace",
    "COLLECTIONDATA":"collectionData",
    "PAGEDATA":"PageData",
    "APPTHEME": "appTheme",
}
export default storage;