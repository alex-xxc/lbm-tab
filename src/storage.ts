//是否chrome插件
const isPlugin = !!chrome?.storage?.local
const storage = {
    get: async (key:string, id?: string)=>{
        if(id) key = key+"_"+id;
        let data:any = '';
        if(isPlugin){
            const result = await chrome.storage.local.get(key)
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
    set: async (key:string|string[], value:any)=>{
        if(Array.isArray(key)) key = key.join('_');
        value = typeof value==='object'?JSON.stringify(value):value
        if(isPlugin){
            return chrome.storage.local.set({[key]: value})
        }else {
            return localStorage.setItem(key, value)
        }
    },
    remove: async (key:string|string[])=>{
        if(Array.isArray(key)) key = key.join('_');
        if(isPlugin){
            return chrome.storage.local.remove(key)
        }else {
            return localStorage.removeItem(key)
        }
    },
    keys:  async ()=>{
        if(isPlugin){
            return chrome.storage.local.getKeys()
        }else {
            return Object.keys(localStorage)
        }
    },
    "SPACE":"space",
    "SELECTSPACE":"selectSpace",
    "COLLECTIONDATA":"collectionData",
    "PAGEDATA":"PageData",
    "APPTHEME": "appTheme",
}
export default storage;