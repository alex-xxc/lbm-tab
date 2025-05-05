import {action, observable, runInAction} from "mobx";
import {anyParams, AppStoreType} from "./types";
import storage from "@/storage.ts";

class AppStore implements AppStoreType{

    constructor() {
        (async ()=>{
            this.appTheme = await storage.get(storage.APPTHEME) || 'light';
        })()
    }

    @observable selectSpace= [];
    @observable appTheme: AppStoreType['appTheme'] = 'light';
    @observable globalLoading = true;

    @action
    setProperty=(params:anyParams)=>{
        runInAction(()=>{
            Object.assign(this as AppStoreType,params)
        })
    }
}

export default new AppStore();